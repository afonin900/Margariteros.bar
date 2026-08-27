import { afterEach, describe, expect, it, vi } from "vitest";
import { deviceHeaders, fetchMirroredHome, officialRedirect, safeApiQuery, safeReadOnlyApi, transformHomeHtml, upstreamHome, vendorCookieHeader } from "../src/lib/choiceqr/mirror";

const request = (url = "https://new.margariteros.bar/pl/?utm_source=ad&unsafe=drop") => new Request(url, { headers: { cookie: "mguid=vendor; placeDbName=; consent=yes; Authorization=bad" } });

afterEach(() => vi.unstubAllGlobals());

describe("ChoiceQR home mirror safety boundary", () => {
  it("uses only canonical locale upstream paths and allowed query keys", () => {
    expect(upstreamHome("pl", new URL(request().url))?.toString()).toBe("https://qr.margariteros.bar/pl?utm_source=ad");
    expect(upstreamHome("xx", new URL(request().url))).toBeNull();
    expect(safeReadOnlyApi("/api/public/booking/params")).toBe(true);
    expect(safeReadOnlyApi("/api/public/translate/get-available-languages")).toBe(true);
    expect(safeReadOnlyApi("/api/public/analytics/cookies")).toBe(true);
    expect(safeReadOnlyApi("/api/public/booking/create")).toBe(false);
  });

  it("keeps API query parameters per endpoint instead of forwarding arbitrary fields", () => {
    const menu = safeApiQuery("/api/public/menu", new URL("https://new.margariteros.bar/api/public/menu?lang=pl&section=menu&token=drop"));
    const booking = safeApiQuery("/api/public/booking/blocks", new URL("https://new.margariteros.bar/api/public/booking/blocks?visitDuration=60&date=2026-08-27&email=drop"));
    expect(menu.toString()).toBe("lang=pl&section=menu");
    expect(booking.toString()).toBe("visitDuration=60&date=2026-08-27");
  });

  it("forwards only sanitized device data so ChoiceQR selects the matching SSR template", () => {
    const mobile = new Headers({ "user-agent": "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/131 Mobile Safari/537.36", "sec-ch-ua-mobile": "?1", "sec-ch-ua-platform": '"Android"', cookie: "mguid=private" });
    const desktop = new Headers({ "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131 Safari/537.36", "sec-ch-ua-mobile": "?0", "sec-ch-ua-platform": '"macOS"', authorization: "secret" });
    expect(deviceHeaders(mobile)).toMatchObject({ "sec-ch-ua-mobile": "?1", "sec-ch-ua-platform": '"Android"' });
    expect(deviceHeaders(desktop)).toMatchObject({ "sec-ch-ua-mobile": "?0", "sec-ch-ua-platform": '"macOS"' });
    expect(deviceHeaders(desktop)).not.toHaveProperty("cookie");
    expect(deviceHeaders(desktop)).not.toHaveProperty("authorization");
  });

  it("keeps the vendor mobile/desktop SSR branch selected by the browser UA", async () => {
    vi.stubGlobal("fetch", vi.fn(async (_url, init: RequestInit) => {
      const headers = new Headers(init.headers);
      const mobile = headers.get("sec-ch-ua-mobile") === "?1";
      return new Response(`<html><body><div id="device-type-selector" class="is-${mobile ? "mobile" : "desktop"}"></div><script id="__NEXT_DATA__" type="application/json">{"props":{"app":{"marketing":{"analytics":{},"seo":{}}}}}</script></body></html>`, { headers: { "content-type": "text/html" } });
    }));
    const mobile = await fetchMirroredHome("pl", new Request("https://new.margariteros.bar/pl/", { headers: { "user-agent": "Android Mobile", "sec-ch-ua-mobile": "?1", "sec-ch-ua-platform": '"Android"' } }));
    const desktop = await fetchMirroredHome("pl", new Request("https://new.margariteros.bar/pl/", { headers: { "user-agent": "Desktop", "sec-ch-ua-mobile": "?0", "sec-ch-ua-platform": '"macOS"' } }));
    expect(mobile).toContain('class="is-mobile"');
    expect(desktop).toContain('class="is-desktop"');
  });

  it("forwards vendor cookies only, preserves the functional marketing schema, and strips tracking", () => {
    expect(vendorCookieHeader(request().headers.get("cookie"))).toBe("mguid=vendor; placeDbName=");
    const html = transformHomeHtml('<html><head><script src="https://www.googletagmanager.com/gtm.js"></script><script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="{}"></script></head><body><script id="__NEXT_DATA__" type="application/json">{"props":{"app":{"marketing":{"analytics":{"gtm":"secret"},"seo":{"title":"kept"},"og":{"title":"kept"}}}}}</script><a href="https://qr.margariteros.bar/booking">Book</a></body></html>', "https://new.margariteros.bar", "pl");
    expect(html).toContain('data-choiceqr-mirror="home"');
    expect(html).toContain('href="/booking"');
    expect(html).not.toMatch(/googletagmanager|cloudflareinsights|secret/);
    expect(html).toMatch(/"marketing".*"seo".*kept/);
    expect(html).toMatch(/"analytics":\{"gtm":null/);
    expect(html).toContain("__CHOICEQR_FIRST_PARTY_CONSENT__");
  });

  it("does not leak upstream failure and never follows arbitrary proxy locations", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(fetchMirroredHome("pl", request())).resolves.toBeNull();
    const redirect = officialRedirect("/booking", new URL(request().url));
    expect(redirect.status).toBe(302);
    expect(redirect.headers.get("location")).toBe("https://qr.margariteros.bar/booking?utm_source=ad");
    expect(officialRedirect("/booking/create", new URL("https://new.margariteros.bar/booking/create?gclid=x&token=drop")).headers.get("location")).toBe("https://qr.margariteros.bar/booking/create?gclid=x");
    expect(officialRedirect("/auth", new URL("https://new.margariteros.bar/auth?utm_campaign=safe")).headers.get("location")).toBe("https://qr.margariteros.bar/auth?utm_campaign=safe");
  });
});
