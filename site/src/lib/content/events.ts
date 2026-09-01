import { getEmDashCollection, getEmDashEntry } from "emdash";
import type { Event } from "../../../.emdash/types";
import type { Locale } from "../../content/page";

type EventState = NonNullable<Event["event_state"]>;
type EventImage = NonNullable<Event["hero_image"]>;
type SharedEventFacts = {
  starts_at: string;
  ends_at?: string;
  event_state: EventState;
  hero_image: EventImage;
  booking_url?: string;
  fact_sources: string;
  facts_confirmed_at: string;
};

/**
 * The page continues to receive one stable event shape.  New shared_* fields
 * win after the migration; old fields are only a read fallback until their
 * separately approved removal.
 */
export type PublicEvent = Omit<Event, keyof SharedEventFacts | "slug"> & SharedEventFacts & {
  slug: string;
  primary_performer?: string;
  isPreview?: boolean;
};
export type MonthEvents = { key: string; startsAt: Date; events: PublicEvent[] };

function warsawDayEnd(value: Date): Date {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => date.find((item) => item.type === type)?.value;
  return new Date(`${part("year")}-${part("month")}-${part("day")}T23:59:59.999+02:00`);
}

function monthKey(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit" }).format(value);
}

function meaningfulText(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0 && value.trim() !== "null")?.trim();
}

function eventImage(...values: Array<EventImage | undefined>): EventImage | undefined {
  return values.find((value) => typeof value?.id === "string" && value.id.trim().length > 0);
}

function eventState(...values: Array<EventState | undefined>): EventState | undefined {
  return values.find((value) => value === "scheduled" || value === "postponed" || value === "cancelled");
}

function sharedEventFacts(event: Event): SharedEventFacts | null {
  const starts_at = meaningfulText(event.shared_starts_at, event.starts_at);
  const event_state = eventState(event.shared_event_state, event.event_state);
  const hero_image = eventImage(event.shared_hero_image, event.hero_image);
  const fact_sources = meaningfulText(event.shared_fact_sources, event.fact_sources);
  const facts_confirmed_at = meaningfulText(event.shared_facts_confirmed_at, event.facts_confirmed_at);

  if (!starts_at || !event_state || !hero_image || !fact_sources || !facts_confirmed_at) return null;

  return {
    starts_at,
    ...(meaningfulText(event.shared_ends_at, event.ends_at) ? { ends_at: meaningfulText(event.shared_ends_at, event.ends_at) } : {}),
    event_state,
    hero_image,
    ...(meaningfulText(event.shared_booking_url, event.booking_url) ? { booking_url: meaningfulText(event.shared_booking_url, event.booking_url) } : {}),
    fact_sources,
    facts_confirmed_at,
  };
}

export function normalizePublicEvent(event: Event): PublicEvent | null {
  if (!event.slug) return null;
  const facts = sharedEventFacts(event);
  return facts ? { ...event, ...facts, slug: event.slug } : null;
}

async function listEventsByStart(locale: Locale): Promise<Array<{ data: Event }> | null> {
  // A schema from before the migration has no shared_starts_at column.  Fall
  // back to its old indexed date rather than taking the events page offline.
  const shared = await getEmDashCollection<"events", Event>("events", {
    status: "published",
    locale,
    orderBy: { shared_starts_at: "asc" },
    limit: 500,
  });
  if (!shared.error) return shared.entries;

  const legacy = await getEmDashCollection<"events", Event>("events", {
    status: "published",
    locale,
    orderBy: { starts_at: "asc" },
    limit: 500,
  });
  return legacy.error ? null : legacy.entries;
}

export async function listUpcomingEvents(locale: Locale, now: Date): Promise<MonthEvents[] | null> {
  const entries = await listEventsByStart(locale);
  if (!entries) return null;
  const currentMonth = monthKey(now);
  const nextMonth = monthKey(new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const groups = new Map<string, MonthEvents>();

  for (const entry of entries) {
    const event = normalizePublicEvent(entry.data);
    if (!event || !event.title || !event.summary || !event.details) continue;
    const startsAt = new Date(event.starts_at);
    const endsAt = event.ends_at ? new Date(event.ends_at) : warsawDayEnd(startsAt);
    if (Number.isNaN(startsAt.valueOf()) || Number.isNaN(endsAt.valueOf()) || endsAt < now) continue;
    const key = monthKey(startsAt);
    if (key !== currentMonth && key !== nextMonth) continue;
    const group = groups.get(key) ?? { key, startsAt, events: [] };
    group.events.push(event);
    groups.set(key, group);
  }

  return [...groups.values()].sort((left, right) => left.startsAt.valueOf() - right.startsAt.valueOf());
}

export async function getPublicEvent(locale: Locale, slug: string): Promise<{ event: PublicEvent | null; unavailable: boolean }> {
  const { entry, error } = await getEmDashEntry<"events", Event>("events", slug, { locale });
  if (error) return { event: null, unavailable: true };
  const event = entry ? normalizePublicEvent(entry.data) : null;
  return { event: event && event.status === "published" && event.title && event.summary && event.details ? event : null, unavailable: false };
}

export function localizedEvent(event: PublicEvent, _locale: Locale) {
  return { title: event.title, summary: event.summary, details: event.details };
}

export function previewEventGroups(now: Date, locale: Locale = "pl"): MonthEvents[] {
  const makeDate = (days: number, hour: number) => {
    const value = new Date(now);
    value.setUTCDate(value.getUTCDate() + days);
    value.setUTCHours(hour, 0, 0, 0);
    return value;
  };
  const dates = [makeDate(5, 17), makeDate(12, 18)];
  const titles = [
    { pl: "TEST — wieczór z muzyką", en: "TEST — music evening", ru: "ТЕСТ — музыкальный вечер", es: "PRUEBA — noche de música" },
    { pl: "TEST — wieczór taneczny", en: "TEST — dance evening", ru: "ТЕСТ — танцевальный вечер", es: "PRUEBA — noche de baile" },
  ];
  const summaries = [
    { pl: "Przykładowa karta. To nie jest prawdziwe wydarzenie.", en: "Example card. This is not a real event.", ru: "Пример карточки. Это не настоящее событие.", es: "Tarjeta de ejemplo. No es un evento real." },
    { pl: "Przykładowa karta do oceny wyglądu. Bez rezerwacji.", en: "Example card for design review. Booking is disabled.", ru: "Пример карточки для оценки дизайна. Бронь отключена.", es: "Tarjeta de ejemplo para evaluar el diseño. Sin reserva." },
  ];
  const photos = ["dance-floor", "live-music"];
  const events = dates.map((startsAt, index) => ({
    id: `preview-event-${index + 1}`,
    slug: `preview-event-${index + 1}`,
    status: "published",
    starts_at: startsAt.toISOString(),
    event_state: "scheduled" as const,
    title: titles[index]![locale],
    summary: summaries[index]![locale],
    details: [],
    hero_image: { id: `preview-image-${index + 1}`, src: `/media/gallery/${photos[index]}-400.webp`, width: 400, height: 400 },
    fact_sources: "Preview fixture — not a real event",
    facts_confirmed_at: now.toISOString(),
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    isPreview: true,
  }));
  const groups = new Map<string, MonthEvents>();
  for (const event of events) {
    const startsAt = new Date(event.starts_at);
    const key = monthKey(startsAt);
    const group = groups.get(key) ?? { key, startsAt, events: [] };
    group.events.push(event);
    groups.set(key, group);
  }
  return [...groups.values()];
}
