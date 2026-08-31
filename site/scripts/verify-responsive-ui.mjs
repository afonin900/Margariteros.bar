import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const chromePath = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const siteRoot = fileURLToPath(new URL("..", import.meta.url));
const entrypoint = fileURLToPath(new URL("../dist/server/entry.mjs", import.meta.url));
const viewportCases = [
  [320, 844],
  [390, 844],
  [597, 844],
  [719, 844],
  [720, 1024],
  [768, 1024],
  [1024, 1024],
  [1280, 1024],
];

async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No local port available");
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return address.port;
}

async function waitFor(check, message) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const value = await check();
      if (value) return value;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(message);
}

function stop(process) {
  if (process.exitCode !== null || process.killed) return Promise.resolve();
  process.kill("SIGTERM");
  return once(process, "exit");
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.socket.onopen = resolve;
      this.socket.onerror = reject;
    });
    this.socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    };
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

function measurementExpression() {
  return `(() => {
    const rect = (element) => {
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
    };
    const union = (selector) => {
      const boxes = [...document.querySelectorAll(selector)].map(rect).filter(Boolean);
      if (!boxes.length) return null;
      return {
        left: Math.min(...boxes.map((box) => box.left)),
        right: Math.max(...boxes.map((box) => box.right)),
        top: Math.min(...boxes.map((box) => box.top)),
        bottom: Math.max(...boxes.map((box) => box.bottom)),
      };
    };
    const overlaps = (first, second) => Boolean(first && second && first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top);
    const targets = [...document.querySelectorAll(".cq-button, .cq-category-list > a, .cq-booking, .cq-mobile-booking, .cq-footer-social a, .cq-footer-map > a")].filter((element) => {
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0;
    }).map((element) => {
      const box = element.getBoundingClientRect();
      return { width: box.width, height: box.height };
    });
    const footerElement = document.querySelector(".cq-footer");
    const footerActions = [
      'a[href^="tel:"][data-analytics-destination="phone"]',
      'a[data-analytics-destination="map"]',
      'a[data-analytics-destination="instagram"]',
      'a[data-analytics-destination="tiktok"]',
      'a[data-analytics-destination="facebook"]',
      '.cq-footer-map a[data-analytics-destination="map"]',
    ].map((selector) => {
      const element = footerElement?.querySelector(selector);
      return Boolean(element && (element.getAttribute("aria-label") || element.textContent.trim()));
    });
    const brand = rect(document.querySelector(".cq-brand, .cq-mobile-logo"));
    const controls = rect(document.querySelector(".cq-header-actions, .cq-mobile-actions"));
    const facts = union(".cq-desktop-contact > div, .cq-mobile-contact-actions > div");
    const booking = rect(document.querySelector(".cq-booking, .cq-mobile-booking"));
    const contentStage = rect(document.querySelector(".cq-main"));
    const gallery = rect(document.querySelector(".ad-gallery"));
    const footer = rect(footerElement);
    const consent = rect(document.querySelector(".consent-control"));
    return {
      viewport: { width: innerWidth, height: innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      contentStage,
      headerOverlap: overlaps(brand, controls),
      bookingOverlap: overlaps(facts, booking),
      consentGalleryOverlap: overlaps(consent, gallery),
      consentFooterOverlap: overlaps(consent, footer),
      consentHidden: document.querySelector(".consent-control")?.hasAttribute("hidden") ?? true,
      footerAfterGallery: Boolean(footer && gallery && footer.top >= gallery.bottom),
      minimumTarget: Math.min(...targets.map(({ width, height }) => Math.min(width, height))),
      footerActions,
      footerHeight: footer?.height ?? 0,
      galleryColumns: getComputedStyle(document.querySelector(".ad-gallery > div")).gridTemplateColumns.split(" ").filter(Boolean).length,
      mobileTemplate: Boolean(document.querySelector(".cq-mobile-header") && getComputedStyle(document.querySelector(".cq-mobile-header")).display !== "none"),
      sections: [...document.querySelectorAll(".ad-hero, .events, .ad-gallery")].map((element) => ({ className: element.className, ...rect(element) })),
      galleryGrid: (() => { const element = document.querySelector(".ad-gallery > div"); return element ? { ...rect(element), rows: getComputedStyle(element).gridTemplateRows, cols: getComputedStyle(element).gridTemplateColumns } : null; })(),
    };
  })()`;
}

async function waitForDocument(cdp) {
  await waitFor(async () => {
    const result = await cdp.send("Runtime.evaluate", {
      expression: "document.readyState === 'complete' && Boolean(document.querySelector('.cq-footer'))",
      returnByValue: true,
    });
    return result.result.value;
  }, "SSR page did not become ready");
}

export async function verifyResponsiveUi() {
  const serverPort = await freePort();
  const debugPort = await freePort();
  const profile = await mkdtemp(join(tmpdir(), "margariteros-responsive-"));
  const server = spawn("node", [entrypoint], {
    cwd: siteRoot,
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(serverPort) },
    stdio: "ignore",
  });
  let chrome;
  let cdp;

  try {
    await waitFor(async () => (await fetch(`http://127.0.0.1:${serverPort}/healthz`)).ok, "SSR server did not start");
    chrome = spawn(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ], { stdio: "ignore" });

    const version = await waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      return response.ok ? response.json() : undefined;
    }, "Chrome CDP did not start");
    const target = await waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?http%3A%2F%2F127.0.0.1%3A${serverPort}%2Fpl%2F`, { method: "PUT" });
      return response.ok ? response.json() : undefined;
    }, "Chrome target did not start");

    cdp = new Cdp(target.webSocketDebuggerUrl ?? version.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    // Compare the public shell with the same saved-consent state used for the
    // ChoiceQR baseline. The consent control is deliberately not page flow.
    const savedConsent = encodeURIComponent(JSON.stringify({ essential: true, analytics: true, marketing: true, updatedAt: "2026-08-27T00:00:00.000Z", policyVersion: 1 }));
    await cdp.send("Network.setCookie", { name: "margariteros_consent_v1", value: savedConsent, url: `http://127.0.0.1:${serverPort}/pl/`, path: "/", sameSite: "Lax" });

    const results = {};
    for (const [width, height] of viewportCases) {
      const mobile = width <= 760 || process.env.CQ_MOBILE_WIDE === "1";
      await cdp.send("Emulation.setUserAgentOverride", { userAgent: mobile ? "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36" });
      await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
      await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 3 : 1, mobile, screenWidth: width, screenHeight: height });
      await cdp.send("Page.navigate", { url: `http://127.0.0.1:${serverPort}/pl/` });
      await waitForDocument(cdp);
      const result = await cdp.send("Runtime.evaluate", {
        expression: measurementExpression(),
        awaitPromise: true,
        returnByValue: true,
      });
      const interaction = await cdp.send("Runtime.evaluate", { expression: `(() => { const drawer=document.querySelector('[data-drawer]'); const menu=document.querySelector('[data-drawer-toggle]'); const language=document.querySelector('[data-language-overlay]'); const languageButton=document.querySelector('[data-language-open]'); menu?.click(); const drawerOpen=!drawer?.hasAttribute('hidden') && document.documentElement.classList.contains('cq-scroll-lock'); document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'})); const drawerEscaped=drawer?.hasAttribute('hidden') && !document.documentElement.classList.contains('cq-scroll-lock'); languageButton?.click(); const languageOpen=!language?.hasAttribute('hidden'); document.querySelector('[data-overlay-back]')?.click(); return { drawerOpen, drawerClosed: drawer?.hasAttribute('hidden'), drawerEscaped, languageOpen, languageClosed: language?.hasAttribute('hidden') }; })()`, returnByValue: true });
      results[width] = { ...result.result.value, interaction: interaction.result.value };
    }
    return results;
  } finally {
    cdp?.close();
    await stop(chrome);
    await stop(server);
    await rm(profile, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(await verifyResponsiveUi(), null, 2));
}
