import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

type PosterInput = {
  template?: string;
  photo?: string;
  photo_position?: string;
  dates?: string;
  artist?: string;
  start?: string;
  location?: string;
  hook?: string;
  width?: number;
  height?: number;
};

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FORBIDDEN = new Set(["MISSING", "DD.MM", "GG:MM"]);
const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];

function argValue(flag: string) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || !process.argv[index + 1]) return null;
  return process.argv[index + 1];
}

function clean(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function hiddenAttr(value: string) {
  return value ? "" : "hidden";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function assertUsable(label: string, value: string, required = false) {
  if (FORBIDDEN.has(value.toUpperCase())) {
    throw new Error(`${label} nie może być placeholdereem: ${value}`);
  }
  if (required && !value) {
    throw new Error(`${label} jest wymagane`);
  }
}

function fill(template: string, data: Record<string, string>) {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key: string) => {
    if (!(key in data)) {
      throw new Error(`Szablon czeka na pole ${key}`);
    }
    return data[key];
  });
}

function findChrome() {
  return CHROME_CANDIDATES.find((candidate) => existsSync(candidate)) ?? null;
}

function run(command: string, args: string[], timeoutMs = 20_000) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`${command} timeout ${timeoutMs}ms${stderr ? `\n${stderr}` : ""}`));
    }, timeoutMs);
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`${command} exited ${code}${stderr ? `\n${stderr}` : ""}`));
    });
  });
}

async function waitForFile(filePath: string, timeoutMs = 15_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (existsSync(filePath)) {
      const stat = await Bun.file(filePath).stat();
      if (stat && stat.size > 10_000) return;
    }
    await Bun.sleep(150);
  }
  throw new Error(`Нет файла рендера: ${filePath}`);
}

const dataPath = path.resolve(argValue("--data") ?? path.join(ROOT, "data/friday-kike-w33.json"));
const raw = JSON.parse(await readFile(dataPath, "utf8")) as PosterInput;

const artist = clean(raw.artist);
const dates = clean(raw.dates);
const startRaw = clean(raw.start);
const location = clean(raw.location);
const hook = clean(raw.hook);
const photoRel = clean(raw.photo);
const photoPosition = clean(raw.photo_position) || "50% 50%";
const templateName = clean(raw.template) || "friday-reel";
const width = Number(raw.width) > 0 ? Math.round(Number(raw.width)) : 1080;
const height = Number(raw.height) > 0 ? Math.round(Number(raw.height)) : 1920;

assertUsable("artist", artist, !hook);
assertUsable("dates", dates);
assertUsable("start", startRaw);
assertUsable("location", location);
assertUsable("hook", hook);

if (!photoRel) {
  throw new Error("photo jest wymagane — hero to prawdziwe zdjęcie z baru");
}

const start = startRaw
  ? startRaw.toUpperCase().startsWith("START")
    ? startRaw
    : `START ${startRaw}`
  : "";

const photoPath = path.resolve(path.dirname(dataPath), photoRel);
if (!existsSync(photoPath)) {
  throw new Error(`Nie ma zdjęcia: ${photoPath}`);
}

const templatePath = path.join(ROOT, "templates", `${templateName}.html`);
const htmlTemplate = await readFile(templatePath, "utf8");

const outDir = path.join(ROOT, "out");
await mkdir(outDir, { recursive: true });

const html = fill(htmlTemplate, {
  PHOTO_URL: path.relative(path.join(ROOT, "templates"), photoPath).split(path.sep).join("/"),
  ARTIST: escapeHtml(artist),
  DATES: escapeHtml(dates),
  START: escapeHtml(start),
  LOCATION: escapeHtml(location),
  HOOK: escapeHtml(hook),
  DATES_HIDDEN: hiddenAttr(dates),
  START_HIDDEN: hiddenAttr(start),
  LOCATION_HIDDEN: hiddenAttr(location),
  HOOK_HIDDEN: hiddenAttr(hook),
  PHOTO_POSITION: escapeHtml(photoPosition),
});

const previewPath = path.join(outDir, `${templateName}.html`);
const pngPath = path.join(outDir, `${path.basename(dataPath, path.extname(dataPath))}.png`);
await writeFile(previewPath, html, "utf8");

const chrome = findChrome();
if (!chrome) {
  throw new Error("Nie ma Chrome/Brave. Zainstaluj przeglądarkę albo Playwright Chromium.");
}

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(request) {
    const url = new URL(request.url);
    const requested = decodeURIComponent(url.pathname);
    const filePath = path.resolve(ROOT, requested.replace(/^\/+/, ""));
    const relative = path.relative(ROOT, filePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      return new Response("Forbidden", { status: 403 });
    }
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(file);
  },
});

const tmpShot = path.join(outDir, ".chrome-shot.png");
const profileDir = await mkdtemp(path.join(os.tmpdir(), "margariteros-poster-"));
const chromeArgs = [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  `--user-data-dir=${profileDir}`,
  "--force-device-scale-factor=1",
  `--window-size=${width},${height}`,
  `--screenshot=${tmpShot}`,
  "--virtual-time-budget=4000",
  `http://127.0.0.1:${server.port}/out/${templateName}.html`,
];
const chromeProcess = spawn(chrome, chromeArgs, { stdio: ["ignore", "pipe", "pipe"] });
try {
  await waitForFile(tmpShot);
  chromeProcess.kill("SIGKILL");
  await run("sips", ["-z", String(height), String(width), tmpShot, "--out", pngPath]);
} finally {
  chromeProcess.kill("SIGKILL");
  server.stop(true);
  await rm(tmpShot, { force: true });
  await rm(profileDir, { recursive: true, force: true });
}

console.log(path.relative(process.cwd(), pngPath));
