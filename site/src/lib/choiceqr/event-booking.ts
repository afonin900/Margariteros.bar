import { attributionKeys } from "../analytics/attribution";

export const CHOICE_QR_BOOKING_URL = "https://qr.margariteros.bar/booking";

const choiceQrBookingHosts = new Set([
  "qr.margariteros.bar",
  "margariteroswwa.choiceqr.com",
]);

export interface EventBookingInput {
  slug?: string | null;
  startsAt: string;
  bookingUrl?: string | null;
  isPreview?: boolean;
  legacyPath?: string | null;
}

export function isPreviewEvent(input: Pick<EventBookingInput, "slug" | "isPreview" | "legacyPath">): boolean {
  // Test fixtures share a slug across every locale, unlike the historical
  // staging marker which may only exist on the source-language row.
  return input.isPreview === true
    || input.slug?.startsWith("test-") === true
    || input.legacyPath?.startsWith("staging-preview/") === true;
}

function isChoiceQrBooking(value: string): boolean {
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    return (url.protocol === "https:" || url.protocol === "http:")
      && (choiceQrBookingHosts.has(url.hostname) || url.hostname.endsWith(".choiceqr.com"))
      && (path === "/booking" || path.startsWith("/booking/"));
  } catch {
    return false;
  }
}

function unixSeconds(value: string): number | null {
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return null;
  return Math.floor(milliseconds / 1000);
}

function choiceQrEventLink(startsAt: string, configured: string | undefined): string {
  const seconds = unixSeconds(startsAt);
  if (seconds === null) return CHOICE_QR_BOOKING_URL;

  const target = new URL(CHOICE_QR_BOOKING_URL);
  target.searchParams.set("date", String(seconds));
  if (configured) {
    const source = new URL(configured);
    for (const key of attributionKeys) {
      const value = source.searchParams.get(key);
      if (value) target.searchParams.set(key, value);
    }
  }
  return target.toString();
}

/**
 * Resolve the booking destination for an event.
 *
 * ChoiceQR booking URLs are deliberately rebuilt from the event start time,
 * so stale vendor query parameters cannot leak into the event deep link.
 * Existing allow-listed campaign parameters and the current page's campaign
 * parameters are retained by the same attribution decorator on the server and
 * in the browser.
 */
export function buildEventBookingUrl(input: EventBookingInput): string {
  // Preview and legacy staging rows must never look like a real event booking.
  if (isPreviewEvent(input)) return CHOICE_QR_BOOKING_URL;

  const configured = input.bookingUrl?.trim();
  if (configured && !isChoiceQrBooking(configured)) {
    try {
      const url = new URL(configured);
      if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
    } catch {
      // Fall through to the safe general booking destination below.
    }
    return CHOICE_QR_BOOKING_URL;
  }

  return choiceQrEventLink(input.startsAt, configured);
}
