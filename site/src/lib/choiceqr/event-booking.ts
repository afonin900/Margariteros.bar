import { attributionKeys } from "../analytics/attribution";
import type { Locale } from "../../content/page";

export const CHOICE_QR_BOOKING_URL = "https://qr.margariteros.bar/booking";
export const CHOICE_QR_EMBED_ORIGIN = "https://embed.choiceqr.com";
const CHOICE_QR_EMBED_VENUE = "margariteroswwa";

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

export interface ChoiceQrBookingEmbed {
  origin: typeof CHOICE_QR_EMBED_ORIGIN;
  src: string;
  date: string;
  time: string;
}

export type ChoiceQrEmbedMessage =
  | { action: "initialize" }
  | { action: "updateDate"; date: string }
  | { action: "updateTime"; time: string };

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

function warsawDateAndTime(value: string): { date: string; time: string } | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return null;

  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(parsed)
    .filter(({ type }) => type !== "literal")
    .map(({ type, value: part }) => [type, part]));

  const { year, month, day, hour, minute } = parts;
  if (!year || !month || !day || !hour || !minute) return null;
  const date = `${year}-${month}-${day}`;
  return { date, time: `${date} ${hour}:${minute}` };
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
 * Builds the public ChoiceQR booking-widget endpoint and its documented
 * postMessage prefill values. This does not include guest data or try to read
 * it back from the widget.
 */
export function buildChoiceQrEventEmbed(input: EventBookingInput & { locale: Locale }): ChoiceQrBookingEmbed | null {
  if (isPreviewEvent(input)) return null;

  const configured = input.bookingUrl?.trim();
  if (configured && !isChoiceQrBooking(configured)) return null;

  const prefill = warsawDateAndTime(input.startsAt);
  if (!prefill) return null;

  const url = new URL(`/booking/${CHOICE_QR_EMBED_VENUE}`, CHOICE_QR_EMBED_ORIGIN);
  url.searchParams.set("lang", input.locale);
  return { origin: CHOICE_QR_EMBED_ORIGIN, src: url.toString(), ...prefill };
}

export function choiceQrEmbedInitializeMessage(): ChoiceQrEmbedMessage {
  return { action: "initialize" };
}

export function choiceQrEmbedPrefillMessages(prefill: Pick<ChoiceQrBookingEmbed, "date" | "time">): ChoiceQrEmbedMessage[] {
  return [
    { action: "updateDate", date: prefill.date },
    { action: "updateTime", time: prefill.time },
  ];
}

/**
 * The embed sends a bookingCreated payload containing guest data. The host
 * deliberately only accepts the harmless initialized acknowledgement and only
 * from the exact iframe window at the official ChoiceQR origin.
 */
export function isTrustedChoiceQrEmbedMessage(
  event: { origin: string; source: unknown; data: unknown },
  expectedSource: unknown,
): boolean {
  if (event.origin !== CHOICE_QR_EMBED_ORIGIN || event.source !== expectedSource) return false;
  return typeof event.data === "object"
    && event.data !== null
    && "action" in event.data
    && (event.data as { action?: unknown }).action === "initialized";
}

export function isChoiceQrEmbedInitializedMessage(
  event: { origin: string; source: unknown; data: unknown },
  expectedSource: unknown,
): boolean {
  return isTrustedChoiceQrEmbedMessage(event, expectedSource);
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
