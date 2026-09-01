import { describe, expect, it } from "vitest";
import { captureAttribution, decorateOutbound } from "../src/lib/analytics/attribution";
import {
  buildEventBookingUrl,
  isPreviewEvent,
} from "../src/lib/choiceqr/event-booking";
import { normalizePublicEvent } from "../src/lib/content/events";
import type { Event } from "../.emdash/types";

describe("ChoiceQR event booking links", () => {
  it("prefers migrated common facts while retaining the old event shape for ChoiceQR", () => {
    const event = normalizePublicEvent({
      id: "event-1",
      slug: "music-night",
      status: "published",
      starts_at: "2026-09-05T19:00:00+02:00",
      event_state: "scheduled",
      title: "Music night",
      summary: "Summary",
      details: [],
      hero_image: { id: "old-image" },
      fact_sources: "Old source",
      facts_confirmed_at: "2026-09-01T10:00:00+02:00",
      shared_starts_at: "2026-09-05T20:00:00+02:00",
      shared_event_state: "postponed",
      shared_hero_image: { id: "shared-image" },
      shared_booking_url: "https://qr.margariteros.bar/booking",
      shared_fact_sources: "Shared source",
      shared_facts_confirmed_at: "2026-09-01T11:00:00+02:00",
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
    } satisfies Event);

    expect(event).toMatchObject({
      starts_at: "2026-09-05T20:00:00+02:00",
      event_state: "postponed",
      hero_image: { id: "shared-image" },
      booking_url: "https://qr.margariteros.bar/booking",
      fact_sources: "Shared source",
    });
  });

  it("uses the exact Unix seconds from a summer Warsaw ISO value", () => {
    expect(buildEventBookingUrl({ startsAt: "2026-09-05T19:00:00+02:00" })).toBe(
      "https://qr.margariteros.bar/booking?date=1788627600",
    );
  });

  it("uses the exact Unix seconds from a winter Warsaw ISO value", () => {
    expect(buildEventBookingUrl({ startsAt: "2026-01-10T20:00:00+01:00" })).toBe(
      "https://qr.margariteros.bar/booking?date=1768071600",
    );
  });

  it("rebuilds ChoiceQR booking links without stale vendor parameters", () => {
    for (const bookingUrl of [
      "https://qr.margariteros.bar/booking?party=6&duration=120&eventId=old",
      "https://margariteroswwa.choiceqr.com/booking?date=1",
    ]) {
      const target = new URL(buildEventBookingUrl({ startsAt: "2026-09-05T19:00:00+02:00", bookingUrl }));

      expect(target.origin + target.pathname).toBe("https://qr.margariteros.bar/booking");
      expect([...target.searchParams.keys()]).toEqual(["date"]);
      expect(target.searchParams.get("date")).toBe("1788627600");
    }
  });

  it("retains only the existing safe campaign parameters from a ChoiceQR URL", () => {
    const target = new URL(buildEventBookingUrl({
      startsAt: "2026-09-05T19:00:00+02:00",
      bookingUrl: "https://margariteroswwa.choiceqr.com/booking?utm_source=gbp&utm_medium=organic&utm_id=drop&party=6",
    }));

    expect(target.toString()).toBe(
      "https://qr.margariteros.bar/booking?date=1788627600&utm_source=gbp&utm_medium=organic",
    );
  });

  it("keeps safe campaign decoration when the browser decorates the deep link", () => {
    const attribution = captureAttribution(
      "https://new.margariteros.bar/pl/?utm_source=google&utm_campaign=events&gclid=abc123&email=drop@example.com",
    );
    const target = decorateOutbound(
      buildEventBookingUrl({ startsAt: "2026-09-05T19:00:00+02:00" }),
      attribution,
    );

    expect(target).toBe(
      "https://qr.margariteros.bar/booking?date=1788627600&utm_source=google&utm_campaign=events&gclid=abc123",
    );
    expect(target).not.toContain("party=");
    expect(target).not.toContain("duration=");
    expect(target).not.toContain("eventId=");
    expect(target).not.toContain("email=");
  });

  it("keeps a separately configured non-ChoiceQR booking destination", () => {
    expect(buildEventBookingUrl({
      startsAt: "2026-09-05T19:00:00+02:00",
      bookingUrl: "https://tickets.example.test/events/music-night",
    })).toBe("https://tickets.example.test/events/music-night");
  });

  it("uses the general booking page for test fixtures and legacy staging rows", () => {
    expect(isPreviewEvent({ isPreview: true })).toBe(true);
    expect(isPreviewEvent({ slug: "test-dance-evening-2026-09-12" })).toBe(true);
    expect(isPreviewEvent({ slug: "music-night" })).toBe(false);
    expect(isPreviewEvent({ legacyPath: "staging-preview/test-dance-evening" })).toBe(true);
    expect(buildEventBookingUrl({
      slug: "test-music-evening-2026-09-05",
      startsAt: "2026-09-05T19:00:00+02:00",
    })).toBe("https://qr.margariteros.bar/booking");
  });
});
