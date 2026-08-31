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
      pl: { home: "Strona główna" }, en: { home: "Main" }, ru: { home: "Главная" }, es: { home: "Inicio" },
    } as const;

    for (const locale of ["pl", "en", "ru", "es"] as const) {
      const response = await fetch(`${server.url}/${locale}/`);
      const html = await response.text();
      const expected = labels[locale];

      expect(response.status).toBe(200);
      if (html.includes('data-choiceqr-mirror="home"')) {
        expect(html).not.toMatch(/googletagmanager\.com|connect\.facebook\.net/);
        expect(html).toContain("__CHOICEQR_FIRST_PARTY_CONSENT__");
        continue;
      }
      expect(html).toContain(`<html lang="${locale === "pl" ? "pl-PL" : locale}">`);
      expect(html).toMatch(/<h1[^>]*>[^<]+<\/h1>/);
      expect(html).toContain(`href="/${locale}/"`);
      expect(html).toContain('href="https://qr.margariteros.bar/booking"');
      expect(html).toContain('href="https://qr.margariteros.bar/section:menu"');
      expect(html).toContain('href="https://qr.margariteros.bar/delivery-areas"');
      expect(html).toContain('href="https://qr.margariteros.bar/feedback"');
      expect(html).toContain('href="https://qr.margariteros.bar/cookie-policy"');
      expect(html).toContain('href="https://qr.margariteros.bar/terms-of-use"');
      expect(html).toContain('href="https://qr.margariteros.bar/privacy-policy"');
      expect(html).toContain(`aria-label="${expected.home}"`);
      expect(html).toContain('aria-label="Profile"');
      expect(html).toContain('aria-label="Menu"');
      expect(html).toContain('class="cq-footer"');
      expect(html).toContain('class="ad-gallery"');
      expect(html).toContain('viewport-fit=cover');
      expect(html).toContain('data-analytics-destination="phone"');
      expect(html).toContain('data-analytics-destination="map"');
      expect(html).toContain('data-analytics-destination="instagram"');
      expect(html).toContain('data-analytics-destination="tiktok"');
      expect(html).toContain('data-analytics-destination="facebook"');
      expect(html).toContain(`href="tel:+48728805628" data-analytics-event="contact_click" data-analytics-destination="phone"`);
      expect(html).toMatch(/<img[^>]+alt="[^"]+"/);
      expect(html).toContain('loading="lazy"');
      expect(html).toContain('data-campaign-surface');
      if (["pl", "en", "es"].includes(locale)) {
        expect(html).not.toMatch(/cocktail|tequila|vodka|whisky|piwo|wino|alkohol/i);
      }

      const previewResponse = await fetch(`${server.url}/${locale}/?preview=events`);
      const previewHtml = await previewResponse.text();
      expect(previewResponse.status).toBe(200);
      expect(previewHtml.match(/class="event-card"/g)).toHaveLength(2);
      expect(previewHtml).toContain("preview-event-1");
      expect(previewHtml).toContain("preview-event-2");
      expect(previewHtml).not.toContain(`/${locale}/events/preview-event-`);
    }

    await server.stop();
  });

  it("renders the responsive R Club entry without requiring Telegram or JavaScript", async () => {
    const server = await startProductionServer();

    for (const locale of ["pl", "en", "ru", "es"] as const) {
      const response = await fetch(`${server.url}/${locale}/club/`);
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toMatch(/<h1[^>]*>R Club<\/h1>/);
      expect(html).toContain('data-club-status="not-configured"');
      expect(html).toContain("Telegramie i w zwykłej przeglądarce");
      expect(html).toContain("width:min(100% - 2rem,42rem)");
      expect(html).not.toMatch(/type="tel"|phone_verified|telefon.*zweryfikowany/i);
    }

    await server.stop();
  });
});
