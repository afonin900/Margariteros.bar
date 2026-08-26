import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { afterEach, describe, expect, it } from "vitest";

const processes: ChildProcess[] = [];

async function freePort(): Promise<number> {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("A TCP port was not allocated");
  const { port } = address;
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function startProductionServer(): Promise<{ url: string; stop(): Promise<void> }> {
  const port = await freePort();
  const child = spawn("node", ["./dist/server/entry.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
    stdio: "ignore",
  });
  processes.push(child);
  const url = `http://127.0.0.1:${port}`;

  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await fetch(`${url}/healthz`);
      return {
        url,
        async stop() {
          child.kill("SIGTERM");
          await once(child, "exit");
          processes.splice(processes.indexOf(child), 1);
        },
      };
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error("Production server did not start");
}

afterEach(async () => {
  await Promise.all(processes.splice(0).map(async (child) => {
    if (child.exitCode !== null || child.killed) return;
    child.kill("SIGTERM");
    await once(child, "exit");
  }));
});

describe("production HTTP contract", () => {
  it("answers the dependency-free health endpoint", async () => {
    const server = await startProductionServer();
    const response = await fetch(`${server.url}/healthz`);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");

    await server.stop();
  });

  it("renders the accessible, food-safe guest surface on every SSR locale without JavaScript", async () => {
    const server = await startProductionServer();
    const labels = {
      pl: { home: "Strona główna", navigation: "Nawigacja i wybór języka", menu: "Zobacz menu", booking: "Rezerwacja", directions: "Dowiedz się, jak dojechać" },
      en: { home: "Home", navigation: "Navigation and language selection", menu: "View menu", booking: "Book a table", directions: "Get directions" },
      ru: { home: "Главная", navigation: "Навигация и выбор языка", menu: "Посмотреть меню", booking: "Забронировать", directions: "Построить маршрут" },
      es: { home: "Inicio", navigation: "Navegación y selección de idioma", menu: "Ver menú", booking: "Reservar", directions: "Cómo llegar" },
    } as const;

    for (const locale of ["pl", "en", "ru", "es"] as const) {
      const response = await fetch(`${server.url}/${locale}/`);
      const html = await response.text();
      const expected = labels[locale];

      expect(response.status).toBe(200);
      expect(html).toContain(`<html lang="${locale === "pl" ? "pl-PL" : locale}">`);
      expect(html).toMatch(/<h1[^>]*>[^<]+<\/h1>/);
      expect(html).toContain('href="https://qr.margariteros.bar/"');
      expect(html).toContain('href="https://margariteroswwa.choiceqr.com/booking"');
      expect(html).toContain(`aria-label="${expected.home}"`);
      expect(html).toContain(`aria-label="${expected.navigation}"`);
      expect(html).toContain(`aria-label="${expected.menu}"`);
      expect(html).toContain(`aria-label="${expected.booking}"`);
      expect(html).toContain(`aria-label="${expected.directions}"`);
      expect(html).toContain(`>${expected.booking}</span>`);
      expect(html).toContain('viewport-fit=cover');
      expect(html).toContain('class="footer-column footer-primary"');
      expect(html).toContain('data-analytics-destination="phone"');
      expect(html).toContain('data-analytics-destination="map"');
      expect(html).toContain('data-analytics-destination="instagram"');
      expect(html).toContain('data-analytics-destination="tiktok"');
      expect(html).toContain('data-analytics-destination="facebook"');
      expect(html).toContain(`href="tel:+48728805628" data-analytics-event="contact_click" data-analytics-destination="phone"`);
      expect(html).toContain('aria-label="Instagram Margariteros"');
      expect(html).toContain('aria-label="TikTok Margariteros"');
      expect(html).toContain('aria-label="Facebook Margariteros"');
      expect(html).toMatch(/<img[^>]+alt="[^"]+"/);
      expect(html).toContain('loading="lazy"');
      expect(html).not.toMatch(/cocktail|margarita|tequila|vodka|whisky|piwo|wino|alkohol|drink/i);
    }

    await server.stop();
  });
});
