import { afterEach, describe, expect, it, vi } from "vitest";
import { CONSENT_COOKIE_NAME, createConsentStore, saveConsent, type ConsentPersistence } from "../src/lib/consent";
import { createAnalyticsTracker } from "../src/lib/analytics";
import { initializeAnalytics } from "../src/lib/analytics/browser";
import { syncChoiceConsent } from "../src/lib/consent/choice-consent-bridge";

function persistence(cookie: string | undefined = undefined): ConsentPersistence & { written?: string } {
  return {
    readCookie: () => cookie,
    writeCookie(value) {
      this.written = value;
      cookie = value.split(";")[0]?.split("=").slice(1).join("=");
    },
    now: () => new Date("2026-08-26T12:00:00.000Z"),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("privacy regression contract", () => {
  it("writes Secure, SameSite and Max-Age cookie attributes and falls back from malformed state", () => {
    const recorded = persistence();
    createConsentStore(recorded).saveConsent("accept");
    expect(recorded.written).toContain(`${CONSENT_COOKIE_NAME}=`);
    expect(recorded.written).toContain("Secure");
    expect(recorded.written).toContain("SameSite=Lax");
    expect(recorded.written).toContain("Max-Age=31536000");
    expect(createConsentStore(persistence("not-valid-json")).readConsent()).toMatchObject({ analytics: false, marketing: false });
  });

  it("writes the current shared ChoiceQR consent cookie without granting partial consent", () => {
    let written = "";
    vi.stubGlobal("document", {
      get cookie() { return written; },
      set cookie(value: string) { written = value; },
    });
    const base = { essential: true as const, updatedAt: "2026-08-31T12:00:00.000Z", policyVersion: 1 };
    expect(syncChoiceConsent({ ...base, analytics: false, marketing: false })).toMatchObject({ status: "synced", value: "required" });
    expect(written).toContain("cookieSettings=required");
    expect(written).toContain("Domain=.margariteros.bar");
    expect(syncChoiceConsent({ ...base, analytics: true, marketing: false })).toMatchObject({ value: "required" });
    expect(syncChoiceConsent({ ...base, analytics: true, marketing: true })).toMatchObject({ value: "required-ga-gtag-fb" });
  });

  it("keeps browser dataLayer on consent-mode updates for Reject and only permits normal analytics after Accept", () => {
    let cookie = "";
    const dataLayer: unknown[] = [];
    vi.stubGlobal("window", { dataLayer });
    vi.stubGlobal("document", {
      get cookie() { return cookie; },
      set cookie(value: string) { cookie = value.split(";")[0] ?? ""; },
      getElementById: () => null,
      createElement: () => ({ id: "", async: false, src: "" }),
      head: { append: () => undefined },
    });
    vi.stubGlobal("crypto", { randomUUID: () => "evt_browser" });

    const tracker = initializeAnalytics();
    saveConsent("reject");
    expect(dataLayer).toContainEqual(["consent", "default", expect.objectContaining({ analytics_storage: "denied", ad_storage: "denied" })]);
    expect(dataLayer).toContainEqual(["consent", "update", expect.objectContaining({ analytics_storage: "denied", ad_storage: "denied" })]);
    expect(dataLayer).not.toContainEqual(expect.objectContaining({ event: "consent_updated" }));
    expect(tracker.track({ name: "consent_updated", locale: "pl" })).toMatchObject({ status: "blocked", reason: "consent" });

    saveConsent("accept");
    expect(dataLayer).toContainEqual(["consent", "update", expect.objectContaining({ analytics_storage: "granted", ad_storage: "granted" })]);
    expect(tracker.track({ name: "consent_updated", locale: "pl" })).toMatchObject({ status: "sent", event_id: "evt_browser" });
  });

  it("rejects nested PII and raw phone values while allowing semantic contact destinations", () => {
    const sent: unknown[] = [];
    const tracker = createAnalyticsTracker({
      getConsent: () => ({ essential: true, analytics: true, marketing: false, updatedAt: "2026-08-26T12:00:00.000Z", policyVersion: 1 }),
      send: (event) => sent.push(event),
      createEventId: () => "evt_privacy",
    });

    expect(tracker.track({ name: "contact_click", locale: "pl", destination: "phone" })).toMatchObject({ status: "sent" });
    expect(tracker.track({ name: "contact_click", locale: "pl", destination: "tel:+48728805628" } as never)).toMatchObject({ status: "rejected", reason: "pii" });
    expect(tracker.track({ name: "reservation_click", locale: "pl", destination: "booking", attribution: { utm_source: { payload: { email: "guest@example.com" } } } } as never)).toMatchObject({ status: "rejected", reason: "pii" });
    expect(sent).toHaveLength(1);
  });
});
