import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const output = fileURLToPath(new URL(".", import.meta.url));
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const liveUrl = "https://qr.margariteros.bar/";
const stagingUrl = "https://new.margariteros.bar/pl/";
const ua = "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/AP2A.240805.005) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return address.port;
}

async function until(check, label) {
  for (let index = 0; index < 120; index += 1) {
    try { const value = await check(); if (value) return value; } catch {}
    await sleep(100);
  }
  throw new Error(`Timed out: ${label}`);
}

class Cdp {
  constructor(url) { this.socket = new WebSocket(url); this.id = 0; this.pending = new Map(); this.listeners = []; }
  async connect() {
    await new Promise((resolve, reject) => { this.socket.onopen = resolve; this.socket.onerror = reject; });
    this.socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result);
        return;
      }
      for (const listener of this.listeners) listener(message.method, message.params);
    };
  }
  on(listener) { this.listeners.push(listener); }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
      this.pending.set(id, { resolve: (value) => { clearTimeout(timer); resolve(value); }, reject: (error) => { clearTimeout(timer); reject(error); } });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.socket.close(); }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}

async function configure(cdp) {
  await cdp.send("Emulation.setUserAgentOverride", { userAgent: ua, userAgentMetadata: { brands: [{ brand: "Google Chrome", version: "131" }, { brand: "Chromium", version: "131" }], fullVersionList: [{ brand: "Google Chrome", version: "131.0.0.0" }, { brand: "Chromium", version: "131.0.0.0" }], platform: "Android", platformVersion: "14.0.0", architecture: "", model: "Pixel 7", mobile: true, bitness: "", wow64: false } });
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 3, mobile: true, screenWidth: 390, screenHeight: 844, screenOrientation: { type: "portraitPrimary", angle: 0 } });
}

async function navigate(cdp, url) {
  await cdp.send("Page.navigate", { url });
  await until(async () => evaluate(cdp, "document.readyState==='complete'"), "page ready");
  await sleep(5000);
}

async function screenshot(cdp, name) {
  const metrics = await cdp.send("Page.getLayoutMetrics");
  const viewport = metrics.cssVisualViewport || metrics.visualViewport;
  const dpr = await evaluate(cdp, "devicePixelRatio");
  const result = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: true, clip: { x: viewport.pageX, y: viewport.pageY, width: viewport.clientWidth, height: viewport.clientHeight, scale: 1 / dpr } });
  await writeFile(join(output, name), Buffer.from(result.data, "base64"));
}

const consentState = `(() => {
  const rect = (element) => { if (!element) return null; const r=element.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}; };
  const exact = (text) => [...document.querySelectorAll('button')].find((button)=>(button.textContent||'').trim()===text && button.getBoundingClientRect().height>0);
  const manage=exact('Zarządzaj'), necessary=exact('Tylko niezbędne'), accept=exact('Akceptuj');
  let panel=necessary?.parentElement; while(panel && !(manage && accept && panel.contains(manage) && panel.contains(accept))) panel=panel.parentElement;
  const menu=[...document.querySelectorAll('button')].find((button)=>/menu/i.test(button.getAttribute('aria-label')||''));
  const mr=menu?.getBoundingClientRect(); const hit=mr ? document.elementFromPoint(mr.x+mr.width/2,mr.y+mr.height/2) : null;
  const buttonData=(button)=>button?{text:(button.textContent||'').trim(),rect:rect(button),font:getComputedStyle(button).font,background:getComputedStyle(button).backgroundColor,color:getComputedStyle(button).color,border:getComputedStyle(button).border}:null;
  return {url:location.href,title:document.title,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio,touch:navigator.maxTouchPoints,coarse:matchMedia('(pointer:coarse)').matches,ua:navigator.userAgent},mirror:document.documentElement.getAttribute('data-choiceqr-mirror'),panel:rect(panel),panelText:(panel?.innerText||'').trim(),buttons:{manage:buttonData(manage),necessary:buttonData(necessary),accept:buttonData(accept)},menu:rect(menu),hitAtMenu:hit?{tag:hit.tagName,class:hit.className,text:(hit.textContent||'').trim().slice(0,120)}:null,drawerVisible:[...document.querySelectorAll('button')].some((button)=>{if((button.textContent||'').trim()!=='Zaloguj się')return false;const r=button.getBoundingClientRect();return r.width>200&&r.left<innerWidth&&r.right>0;})};
})()`;

const profile = await mkdtemp(join(tmpdir(), "cq-staging-consent-"));
const port = await freePort();
let chrome; let cdp; let currentSide = "startup";
try {
  chrome = spawn(chromePath, ["--headless=new", "--no-first-run", "--no-default-browser-check", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
  const version = await until(async () => { const response=await fetch(`http://127.0.0.1:${port}/json/version`); return response.ok && response.json(); }, "Chrome");
  const target = await until(async () => { const response=await fetch(`http://127.0.0.1:${port}/json/new?about%3Ablank`, { method: "PUT" }); return response.ok && response.json(); }, "target");
  cdp = new Cdp(target.webSocketDebuggerUrl); await cdp.connect();
  await Promise.all([cdp.send("Page.enable"), cdp.send("Runtime.enable"), cdp.send("Network.enable"), cdp.send("Log.enable")]);
  await configure(cdp);
  const evidence = { chrome: version.Browser, live: { requests: [], failures: [], console: [], logs: [] }, staging: { requests: [], failures: [], console: [], logs: [] } };
  cdp.on((method, params) => {
    const side = evidence[currentSide]; if (!side) return;
    if (method === "Network.requestWillBeSent") side.requests.push({ url: params.request.url, method: params.request.method, type: params.type });
    else if (method === "Network.loadingFailed") side.failures.push({ error: params.errorText, blockedReason: params.blockedReason, canceled: params.canceled });
    else if (method === "Runtime.consoleAPICalled") side.console.push({ type: params.type, text: params.args?.map((arg)=>arg.value??arg.description).join(" ") });
    else if (method === "Log.entryAdded") side.logs.push({ level: params.entry.level, text: params.entry.text, url: params.entry.url });
  });

  currentSide = "live"; await navigate(cdp, liveUrl); evidence.live.before = await evaluate(cdp, consentState); await screenshot(cdp, "live-pl-android-390-consent-first.png");
  if (evidence.live.before.menu) {
    const point={x:evidence.live.before.menu.x+evidence.live.before.menu.width/2,y:evidence.live.before.menu.y+evidence.live.before.menu.height/2};
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", ...point, button: "left", clickCount: 1 }); await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", ...point, button: "left", clickCount: 1 }); await sleep(750);
  }
  evidence.live.afterBlockedClick = await evaluate(cdp, consentState);

  currentSide = "staging"; await navigate(cdp, stagingUrl); evidence.staging.before = await evaluate(cdp, consentState); await screenshot(cdp, "staging-pl-android-390-consent-first.png");
  if (evidence.staging.before.menu) {
    const point={x:evidence.staging.before.menu.x+evidence.staging.before.menu.width/2,y:evidence.staging.before.menu.y+evidence.staging.before.menu.height/2};
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", ...point, button: "left", clickCount: 1 }); await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", ...point, button: "left", clickCount: 1 }); await sleep(750);
  }
  evidence.staging.afterBlockedClick = await evaluate(cdp, consentState);
  evidence.staging.necessaryClicked = await evaluate(cdp, `(()=>{const button=[...document.querySelectorAll('button')].find((item)=>(item.textContent||'').trim()==='Tylko niezbędne'&&item.getBoundingClientRect().height>0);button?.click();return Boolean(button);})()`);
  await sleep(2500); evidence.staging.afterNecessary = await evaluate(cdp, consentState); await screenshot(cdp, "staging-pl-android-390-after-necessary.png");
  await navigate(cdp, stagingUrl); evidence.staging.afterReload = await evaluate(cdp, consentState); await screenshot(cdp, "staging-pl-android-390-saved-consent.png");

  for (const side of [evidence.live, evidence.staging]) side.requests = side.requests.filter((item,index,all)=>all.findIndex((other)=>other.url===item.url&&other.method===item.method)===index);
  await writeFile(join(output, "staging-consent.json"), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify({live:{before:evidence.live.before,afterBlockedClick:evidence.live.afterBlockedClick,failures:evidence.live.failures,console:evidence.live.console,logs:evidence.live.logs},staging:{before:evidence.staging.before,afterBlockedClick:evidence.staging.afterBlockedClick,necessaryClicked:evidence.staging.necessaryClicked,afterNecessary:evidence.staging.afterNecessary,afterReload:evidence.staging.afterReload,failures:evidence.staging.failures,console:evidence.staging.console,logs:evidence.staging.logs}}, null, 2));
} finally {
  cdp?.close();
  if (chrome && chrome.exitCode === null && !chrome.killed) { chrome.kill("SIGTERM"); await Promise.race([once(chrome, "exit"), sleep(3000)]); }
  await rm(profile, { recursive: true, force: true });
}
