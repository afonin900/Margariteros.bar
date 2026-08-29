import { getEmDashCollection, getEmDashEntry } from "emdash";
import type { Event } from "../../../.emdash/types";
import type { Locale } from "../../content/page";

export type PublicEvent = Event & { slug: string };
export type MonthEvents = { key: string; startsAt: Date; events: PublicEvent[] };

function localeFields(locale: Locale) {
  if (locale === "pl") return { title: "title", summary: "summary", details: "details" } as const;
  return { title: `title_${locale}`, summary: `summary_${locale}`, details: `details_${locale}` } as const;
}

function hasLocale(event: Event, locale: Locale): boolean {
  const fields = localeFields(locale);
  return event.published_locales.includes(locale) && Boolean(event[fields.title] && event[fields.summary] && event[fields.details]);
}

function warsawDayEnd(value: Date): Date {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => date.find((item) => item.type === type)?.value;
  return new Date(`${part("year")}-${part("month")}-${part("day")}T23:59:59.999+02:00`);
}

function monthKey(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit" }).format(value);
}

function publicEvent(event: Event): PublicEvent | null {
  return event.slug ? { ...event, slug: event.slug } : null;
}

export async function listUpcomingEvents(locale: Locale, now: Date): Promise<MonthEvents[] | null> {
  const { entries, error } = await getEmDashCollection<"events", Event>("events", { status: "published", orderBy: { starts_at: "asc" }, limit: 500 });
  if (error) return null;
  const currentMonth = monthKey(now);
  const nextMonth = monthKey(new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const groups = new Map<string, MonthEvents>();

  for (const entry of entries) {
    const event = publicEvent(entry.data);
    if (!event || !hasLocale(event, locale)) continue;
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
  const { entry, error } = await getEmDashEntry<"events", Event>("events", slug);
  if (error) return { event: null, unavailable: true };
  const event = entry ? publicEvent(entry.data) : null;
  return { event: event && event.status === "published" && hasLocale(event, locale) ? event : null, unavailable: false };
}

export function localizedEvent(event: PublicEvent, locale: Locale) {
  const fields = localeFields(locale);
  return { title: event[fields.title] as string, summary: event[fields.summary] as string, details: event[fields.details] as Event["details"] };
}
