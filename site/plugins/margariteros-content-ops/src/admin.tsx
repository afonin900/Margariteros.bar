import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";

type CalendarEntry = { id: string; title: string; start: string; color: string; url: string; kind: "event" | "publication" };

function CalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/_emdash/api/plugins/margariteros-content-ops/calendar", { headers: { "X-EmDash-Request": "1" } })
      .then(async (response) => {
        if (!response.ok) throw new Error("Nie udało się wczytać kalendarza");
        return response.json() as Promise<{ entries: CalendarEntry[] }>;
      })
      .then((payload) => setEntries(payload.entries))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Nie udało się wczytać kalendarza"));
  }, []);

  if (error) return <p role="alert">{error}</p>;
  return <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="dayGridMonth" headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek" }} events={entries} eventClick={(info) => { info.jsEvent.preventDefault(); window.location.assign(info.event.url); }} dateClick={(info) => window.location.assign(`/_emdash/admin/content/publications/new?publishAt=${encodeURIComponent(info.date.toISOString())}`)} eventStartEditable={false} editable={false} height="auto" />;
}

function PublicationsPage() {
  return <section><h1>Publikacje</h1><p>Twórz i filtruj publikacje w standardowej kolekcji „Publikacje”.</p><a href="/_emdash/admin/content/publications">Otwórz publikacje</a></section>;
}

export const pages = {
  "/calendar": CalendarPage,
  "/publications": PublicationsPage,
};
