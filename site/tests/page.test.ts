import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getPage, locales } from "../src/content/page";
import {
  CONSENT_COOKIE_NAME,
  createConsentStore,
  type ConsentPersistence,
} from "../src/lib/consent";
import { syncChoiceConsent } from "../src/lib/consent/choice-consent-bridge";
import { captureAttribution, decorateOutbound } from "../src/lib/analytics/attribution";
import { createAnalyticsTracker } from "../src/lib/analytics";
import { resolveHomepageGallery, resolveHomepageMediaUrl, resolveSharedHomepageGallery } from "../src/lib/content/homepage";

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

describe("Emdash website schema", () => {
  it("contains only multilingual homepage and event modules", () => {
    const seed = JSON.parse(readFileSync(new URL("../.emdash/seed.json", import.meta.url), "utf8"));
    expect(seed.meta.description).toContain("English-first");
    expect(seed.collections.map((collection: { slug: string }) => collection.slug)).toEqual(["homepage", "events"]);
    expect(JSON.stringify(seed)).not.toMatch(/publications|creative_assets|postiz|buffer/i);
    expect(seed.defaultLocale).toBe("pl");
    const homepage = seed.collections.find((collection: { slug: string }) => collection.slug === "homepage");
    const fields = homepage.fields.map((field: { slug: string }) => field.slug);
    expect(fields).toContain("hero_title");
    expect(fields).toContain("hero_text");
    expect(fields).toContain("primary_cta_label");
    const gallery = homepage.fields.find((field: { slug: string; validation?: unknown }) => field.slug === "gallery_items");
    expect(gallery).toMatchObject({ slug: "gallery_items", type: "repeater", required: true });
    expect(gallery?.validation).toMatchObject({ minItems: 4, maxItems: 20 });
    expect((gallery?.validation as { subFields?: unknown } | undefined)?.subFields).toEqual([
      { slug: "image", label: "Image", type: "image", required: true },
      { slug: "alt", label: "Alt text", type: "string", required: true },
    ]);
    expect(fields.some((field: string) => /_(pl|en|ru|es)$/.test(field))).toBe(false);
    expect(JSON.stringify(seed)).not.toContain("published_locales");
  });
});

describe("editable homepage gallery", () => {
  it("resolves local Emdash storage keys and keeps CMS order", () => {
    const value = [
      { image: { id: "media-1", provider: "local", width: 800, height: 600, meta: { storageKey: "seed/one.webp" } }, alt: "One" },
      { image: { id: "media-2", provider: "local", src: "/_emdash/api/media/file/seed/two.webp" }, alt: "Two" },
    ];

    expect(resolveHomepageGallery("pl", value, (key) => `/media/${key}`)).toEqual([
      { src: "/media/seed/one.webp", alt: "One", width: 800, height: 600 },
      { src: "/_emdash/api/media/file/seed/two.webp", alt: "Two", width: 400, height: 400 },
    ]);
  });

  it("falls back to the media id for a local value without a URL", () => {
    expect(resolveHomepageMediaUrl({ id: "media-1", provider: "local" })).toBe("/_emdash/api/media/file/media-1");
    expect(resolveHomepageMediaUrl({ id: "media-1", provider: "local", meta: { storageKey: "../private.webp" } })).toBe("/_emdash/api/media/file/media-1");
  });

  it("keeps shared gallery images paired with each locale's descriptions", () => {
    const images = [
      { image: { id: "media-1", provider: "local", meta: { storageKey: "seed/one.webp" }, width: 800, height: 600 } },
      { image: { id: "media-2", provider: "local", meta: { storageKey: "seed/two.webp" } } },
    ];
    const alts = [{ alt: "Polski opis jeden" }, { alt: "Polski opis dwa" }];

    expect(resolveSharedHomepageGallery(images, alts, (key) => `/media/${key}`)).toEqual([
      { src: "/media/seed/one.webp", alt: "Polski opis jeden", width: 800, height: 600 },
      { src: "/media/seed/two.webp", alt: "Polski opis dwa", width: 400, height: 400 },
    ]);
    expect(resolveSharedHomepageGallery(images, [{ alt: "Only one" }])).toEqual([]);
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

  it("maps only complete consent to ChoiceQR and keeps partial consent denied", () => {
    expect(syncChoiceConsent({ essential: true, analytics: true, marketing: true, updatedAt: "2026-08-26T10:00:00.000Z", policyVersion: 1 })).toMatchObject({ value: "required-ga-gtag-fb" });
    expect(syncChoiceConsent({ essential: true, analytics: true, marketing: false, updatedAt: "2026-08-26T10:00:00.000Z", policyVersion: 1 })).toMatchObject({ value: "required" });
    expect(syncChoiceConsent({ essential: true, analytics: false, marketing: false, updatedAt: "2026-08-26T10:00:00.000Z", policyVersion: 1 })).toMatchObject({ value: "required" });
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
