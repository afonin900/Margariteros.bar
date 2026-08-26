import type { Attribution } from "./attribution";
import type { ConsentState } from "../consent";

export type AnalyticsEventName = "consent_updated" | "view_menu" | "reservation_click" | "contact_click";
export type AnalyticsDestination = "menu" | "booking" | "phone" | "map" | "instagram" | "tiktok" | "facebook";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  locale: "pl" | "en" | "ru" | "es";
  destination?: AnalyticsDestination;
  attribution?: Attribution;
}

export interface AnalyticsPayload extends AnalyticsEvent {
  event: AnalyticsEventName;
  event_id: string;
}

export type TrackResult =
  | { status: "sent"; event_id: string }
  | { status: "blocked"; reason: "consent" }
  | { status: "duplicate" }
  | { status: "rejected"; reason: "pii" };

export interface AnalyticsTrackerOptions {
  getConsent(): ConsentState;
  send(event: AnalyticsPayload): void;
  createEventId(): string;
}

const PII_KEY = /(?:e-?mail|phone|tel(?:ephone)?|name|first|last|comment|message|address|user)/i;
const PII_VALUE = /(?:[^\s@]+@[^\s@]+\.[^\s@]+|\+?\d[\d\s().-]{6,}\d)/;

const semanticDestinations = new Set<AnalyticsDestination>(["menu", "booking", "phone", "map", "instagram", "tiktok", "facebook"]);

function destinationContainsPii(destination: unknown): boolean {
  return destination !== undefined && (typeof destination !== "string" || !semanticDestinations.has(destination as AnalyticsDestination));
}

function containsPii(value: unknown, seen = new Set<object>()): boolean {
  if (typeof value === "string") return PII_VALUE.test(value);
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);
  return Object.entries(value).some(([key, nested]) => PII_KEY.test(key) || containsPii(nested, seen));
}

function hasPii(event: Record<string, unknown>): boolean {
  if (destinationContainsPii(event.destination)) return true;
  return Object.entries(event).some(([key, value]) => {
    if (key === "name" || key === "destination") return false;
    return PII_KEY.test(key) || containsPii(value);
  });
}

export function createAnalyticsTracker(options: AnalyticsTrackerOptions) {
  const sent = new Set<string>();

  return {
    track(event: AnalyticsEvent): TrackResult {
      if (hasPii(event as unknown as Record<string, unknown>)) return { status: "rejected", reason: "pii" };
      const consent = options.getConsent();
      if (!consent.analytics) return { status: "blocked", reason: "consent" };

      const fingerprint = JSON.stringify([event.name, event.locale, event.destination ?? "", event.attribution ?? {}]);
      if (sent.has(fingerprint)) return { status: "duplicate" };

      sent.add(fingerprint);
      const event_id = options.createEventId();
      options.send({ ...event, event: event.name, event_id });
      return { status: "sent", event_id };
    },
  };
}
