import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const entry = fileURLToPath(new URL("../dist/server/entry.mjs", import.meta.url));
const chromePath = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const cases = [{ name: "android-390", width: 390, height: 844, mobile: true }];

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
async function port() { const server = createServer(); server.listen(0, "127.0.0.1"); await once(server, "listening"); const address = server.address(); await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); return address.port; }
async function until(check) { for (let i = 0; i < 80; i += 1) { try { const value = await check(); if (value) return value; } catch {} await wait(50); } throw new Error("Timed out"); }
class Cdp { constructor(url) { this.socket = new WebSocket(url); this.id = 0; this.pending = new Map(); } async connect() { await new Promise((resolve, reject) => { this.socket.onopen = resolve; this.socket.onerror = reject; }); this.socket.onmessage = ({ data }) => { const message = JSON.parse(data); const pending = this.pending.get(message.id); if (!pending) return; this.pending.delete(message.id); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result); }; } send(method, params = {}) { const id = ++this.id; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params })); }); } close() { this.socket.close(); } }
const stop = (process) => process && process.exitCode === null && !process.killed ? (process.kill("SIGTERM"), once(process, "exit")) : Promise.resolve();

const serverPort = await port(); const debugPort = await port(); const profile = await mkdtemp(join(tmpdir(), "cq-capture-")); const output = join(root, "docs", "screenshots", "choiceqr-exact");
const server = spawn("node", [entry], { cwd: root, env: { ...process.env, HOST: "127.0.0.1", PORT: String(serverPort) }, stdio: "ignore" }); let chrome; let cdp;
try { await until(async () => (await fetch(`http://127.0.0.1:${serverPort}/healthz`)).ok); chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" }); const version = await until(async () => { const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`); return response.ok && response.json(); }); const target = await until(async () => { const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?http%3A%2F%2F127.0.0.1%3A${serverPort}%2Fpl%2F`, { method: "PUT" }); return response.ok && response.json(); }); cdp = new Cdp(target.webSocketDebuggerUrl ?? version.webSocketDebuggerUrl); await cdp.connect(); await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await mkdir(output, { recursive: true });
  for (const item of cases) { await cdp.send("Emulation.setUserAgentOverride", { userAgent: item.mobile ? "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36" }); await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: item.mobile, maxTouchPoints: item.mobile ? 5 : 1 }); await cdp.send("Emulation.setDeviceMetricsOverride", { width: item.width, height: item.height, deviceScaleFactor: item.mobile ? 3 : 1, mobile: item.mobile, screenWidth: item.width, screenHeight: item.height }); await cdp.send("Page.navigate", { url: `http://127.0.0.1:${serverPort}/pl/` }); await until(async () => (await cdp.send("Runtime.evaluate", { expression: "document.readyState === 'complete' && Boolean(document.querySelector('.cq-footer'))", returnByValue: true })).result.value); const screenshot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }); await writeFile(join(output, `${item.name}.png`), Buffer.from(screenshot.data, "base64")); }
  console.log(output);
} finally { cdp?.close(); await stop(chrome); await stop(server); await rm(profile, { recursive: true, force: true }); }
