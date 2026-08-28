import { ClubLaunch } from "./club-launch";

export const metadata = {
  title: "R Club | Margariteros",
  description: "R Club — bezpieczny status zaproszeń Margariteros.",
};

/** One responsive URL for ordinary browsers and Telegram Mini App launches. */
export default function RClubPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-6 p-6 sm:p-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Margariteros</p>
        <h1 className="text-4xl font-semibold tracking-tight">R Club</h1>
        <p className="text-muted-foreground">Jeden link do zaproszeń — w Telegramie i zwykłej przeglądarce.</p>
      </header>
      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="club-status">
        <h2 id="club-status" className="text-lg font-medium">Status</h2>
        <ClubLaunch />
        <p className="text-sm text-muted-foreground">
          Link polecający i kod QR pojawią się dopiero po aktywacji partnera. Nie pokazujemy danych osób zaproszonych.
        </p>
      </section>
      <p className="text-sm text-muted-foreground">
        Rejestracja partnera pozostaje niedostępna, dopóki operator nie skonfiguruje produktu i programu RefRef. Obecne logowanie Better Auth służy właścicielom programów, a nie może bezpiecznie udawać rejestracji partnera.
      </p>
    </main>
  );
}
