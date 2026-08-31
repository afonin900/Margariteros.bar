import { describe, expect, it } from "vitest";
import { getPage, locales } from "../src/content/page";
import {
  CONSENT_COOKIE_NAME,
  createConsentStore,
  type ConsentPersistence,
} from "../src/lib/consent";
import { syncChoiceConsent } from "../src/lib/consent/choice-consent-bridge";
import { captureAttribution, decorateOutbound } from "../src/lib/analytics/attribution";
import { createAnalyticsTracker } from "../src/lib/analytics";

function createMemoryPersistence(): ConsentPersistence & { cookie: string | undefined; writtenCookie: string | undefined } {
  return {
    cookie: undefined,
    writtenCookie: undefined,
    readCookie() {
      return this.cookie;
    },
    writeCookie(value) {
      this.writtenCookie = value;
      this.cookie = value.split(";")[0]?.split("=").slice(1).join("=");
    },
    now: () => new Date("2026-08-26T10:00:00.000Z"),
  };
}

describe("getPage", () => {
  it("returns full localized page content for every supported route", () => {
    for (const locale of locales) {
      const page = getPage(locale);

      expect(page.locale).toBe(locale);
      expect(page.title).not.toHaveLength(0);
      expect(page.description).not.toHaveLength(0);
    }
  });

  it("exposes the complete guest interface in every locale", () => {
    for (const locale of locales) {
      const page = getPage(locale);

      expect(page.galleryHeading).not.toHaveLength(0);
      expect(page.contactHeading).not.toHaveLength(0);
      expect(page.hoursHeading).not.toHaveLength(0);
      expect(page.socialsHeading).not.toHaveLength(0);
      expect(page.mapHeading).not.toHaveLength(0);
      expect(page.clubLabel).toBe("R Club");
      expect(page.hours).toHaveLength(7);
    }
  });

  it("uses a local, square twenty-image gallery in every locale", () => {
    for (const locale of locales) {
      const page = getPage(locale);

      expect(page.galleryItems).toHaveLength(20);
      for (const item of page.galleryItems) {
        expect(item.src).toMatch(/^\/media\/gallery\//);
        expect(item.width).toBe(item.height);
        expect(item.alt).not.toHaveLength(0);
      }
    }
  });

  it("does not expose the rejected tray photo through the public gallery seam", () => {
    for (const locale of locales) {
      expect(getPage(locale).galleryItems.map((item) => item.src)).not.toContain(
        "/media/gallery/food-tacos-tray-400.webp",
      );
    }
  });

  it("keeps prohibited positioning out of localized content", () => {
    for (const locale of locales) {
      expect(JSON.stringify(getPage(locale))).not.toMatch(/cocktail|margarita|tequila|vodka|whisky|piwo|wino|alkohol|drink/i);
    }
  });
});

describe("consent", () => {
  it("persists Accept, Reject and a later choice in the versioned shared-domain cookie", () => {
    const persistence = createMemoryPersistence();
    const consent = createConsentStore(persistence);

    expect(consent.readConsent()).toMatchObject({ essential: true, analytics: false, marketing: false });

    consent.saveConsent("accept");
    expect(consent.readConsent()).toMatchObject({ analytics: true, marketing: true, policyVersion: 1 });
    expect(persistence.writtenCookie).toContain(`${CONSENT_COOKIE_NAME}=`);
    expect(persistence.writtenCookie).toContain("Domain=.margariteros.bar");

    const afterReload = createConsentStore(persistence);
    expect(afterReload.readConsent()).toMatchObject({ analytics: true, marketing: true });

    afterReload.saveConsent("reject");
    expect(afterReload.readConsent()).toMatchObject({ analytics: false, marketing: false });
  });

  it("keeps the ChoiceQR bridge unsupported without a proven vendor contract", () => {
    expect(syncChoiceConsent({ essential: true, analytics: true, marketing: true, updatedAt: "2026-08-26T10:00:00.000Z", policyVersion: 1 })).toMatchObject({
      status: "unsupported",
    });
  });
});

describe("attribution and analytics", () => {
  it("decorates outbound URLs only with allow-listed campaign identifiers", () => {
    const attribution = captureAttribution("https://margariteros.bar/pl/?utm_source=google&utm_campaign=late-summer&gclid=abc123&email=guest%40example.com&name=Ana");

    expect(attribution).toEqual({ utm_source: "google", utm_campaign: "late-summer", gclid: "abc123" });
    expect(decorateOutbound("https://margariteroswwa.choiceqr.com/booking?existing=yes", attribution)).toBe(
      "https://margariteroswwa.choiceqr.com/booking?existing=yes&utm_source=google&utm_campaign=late-summer&gclid=abc123",
    );
  });

  it("rejects PII and deduplicates a repeated guest action", () => {
    const sent: unknown[] = [];
    const tracker = createAnalyticsTracker({
      getConsent: () => ({ essential: true, analytics: true, marketing: false, updatedAt: "2026-08-26T10:00:00.000Z", policyVersion: 1 }),
      send: (event) => sent.push(event),
      createEventId: () => "evt_1",
    });

    expect(tracker.track({ name: "reservation_click", locale: "pl", destination: "booking" })).toMatchObject({ status: "sent", event_id: "evt_1" });
    expect(tracker.track({ name: "contact_click", locale: "pl", destination: "phone" })).toMatchObject({ status: "sent" });
    expect(tracker.track({ name: "reservation_click", locale: "pl", destination: "booking" })).toMatchObject({ status: "duplicate" });
    expect(tracker.track({ name: "contact_click", locale: "pl", destination: "phone", email: "guest@example.com" } as never)).toMatchObject({ status: "rejected", reason: "pii" });
    expect(sent).toHaveLength(2);
  });
});
