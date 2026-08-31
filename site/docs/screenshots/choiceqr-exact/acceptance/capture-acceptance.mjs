import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const output = fileURLToPath(new URL(".", import.meta.url));
const localUrl = process.env.LOCAL_URL ?? "http://127.0.0.1:4324/pl/";
const liveUrl = "https://qr.margariteros.bar/";
const mobileCases = [320, 390, 398, 597, 719];
const desktopCases = [[1024, 768], [1280, 1024]];
const androidUa = "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/AP2A.240805.005) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
const desktopUa = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const consentChoice = process.env.CONSENT_CHOICE === "necessary" ? "Tylko niezbędne" : "Akceptuj";

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
async function freePort() { const server = createServer(); server.listen(0, "127.0.0.1"); await once(server, "listening"); const address = server.address(); await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); return address.port; }
async function until(check, label, attempts = 120) { for (let i = 0; i < attempts; i += 1) { try { const value = await check(); if (value) return value; } catch {} await sleep(100); } throw new Error(`Timed out: ${label}`); }
class Cdp {
  constructor(url) { this.socket = new WebSocket(url); this.id = 0; this.pending = new Map(); }
  async connect() { await new Promise((resolve, reject) => { this.socket.onopen = resolve; this.socket.onerror = reject; }); this.socket.onmessage = ({ data }) => { const message = JSON.parse(data); const pending = this.pending.get(message.id); if (!pending) return; this.pending.delete(message.id); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result); }; }
  send(method, params = {}) { const id = ++this.id; return new Promise((resolve, reject) => { const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, method === "Page.captureScreenshot" ? 50000 : 20000); this.pending.set(id, { resolve: (value) => { clearTimeout(timer); resolve(value); }, reject: (error) => { clearTimeout(timer); reject(error); } }); this.socket.send(JSON.stringify({ id, method, params })); }); }
  close() { this.socket.close(); }
}

const metricsExpression = `(() => {
  const rect = (el) => { if (!el) return null; const r=el.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}; };
  const byText = (fragment) => [...document.querySelectorAll('body *')].filter((el) => el.children.length===0 && (el.textContent||'').trim().includes(fragment)).map((el) => ({tag:el.tagName, text:(el.textContent||'').trim().slice(0,160), rect:rect(el), display:getComputedStyle(el).display})).slice(0,12);
  const galleryHeading = [...document.querySelectorAll('body *')].find((el)=>el.children.length===0&&(el.textContent||'').trim()==='Nasze zdjęcia');
  let galleryRoot = document.querySelector('.cq-gallery') || galleryHeading?.parentElement; while(galleryRoot?.parentElement && galleryRoot.querySelectorAll('img').length<20) galleryRoot=galleryRoot.parentElement;
  const allImages = [...document.querySelectorAll('img')].map((img)=>({src:img.currentSrc||img.src,complete:img.complete,naturalWidth:img.naturalWidth,rect:rect(img)})).filter((x)=>x.rect&&x.rect.width>40);
  const imageData = allImages.filter((x)=>x.rect.y>=(galleryHeading?.getBoundingClientRect().bottom||0)&&Math.abs(x.rect.width-x.rect.height)<2).slice(0,20);
  const galleryGridRect = imageData.length ? {x:Math.min(...imageData.map(x=>x.rect.x)),y:Math.min(...imageData.map(x=>x.rect.y)),width:Math.max(...imageData.map(x=>x.rect.x+x.rect.width))-Math.min(...imageData.map(x=>x.rect.x)),height:Math.max(...imageData.map(x=>x.rect.y+x.rect.height))-Math.min(...imageData.map(x=>x.rect.y)),bottom:Math.max(...imageData.map(x=>x.rect.y+x.rect.height))} : null;
  const footer = document.querySelector('.cq-footer');
  const consent = document.querySelector('.consent-control');
  const consentPanel = document.querySelector('.consent-panel');
  const mapFrame = [...document.querySelectorAll('iframe')].find((frame)=>(frame.title||'').toLowerCase().includes('map') || frame.src.includes('google.com/maps')) || [...document.querySelectorAll('.cq-map-image')].find((el)=>el.getBoundingClientRect().width>0);
  const links = [...document.querySelectorAll('a')].map((a)=>({text:(a.textContent||'').trim().replace(/\\s+/g,' ').slice(0,100),href:a.href,target:a.target}));
  const card = (text) => { const leaf=[...document.querySelectorAll('body *')].find((node)=>node.children.length===0 && (node.textContent||'').trim()===text); const el=leaf?.closest('a,button')||leaf; return el ? {rect:rect(el),border:getComputedStyle(el).borderColor,background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color,font:getComputedStyle(el).font} : null; };
  return {
    url:location.href, title:document.title,
    viewport:{innerWidth,innerHeight,dpr:devicePixelRatio,coarse:matchMedia('(pointer:coarse)').matches,hoverNone:matchMedia('(hover:none)').matches,touch:navigator.maxTouchPoints,ua:navigator.userAgent},
    dimensions:{documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,bodyHeight:document.body.scrollHeight},
    gallery:{heading:rect(galleryHeading),root:rect(galleryRoot),grid:galleryGridRect,count:imageData.length,loaded:imageData.filter((x)=>x.complete&&x.naturalWidth>0).length,images:imageData},
    footer:rect(footer), consent:rect(consent), consentPanel:{hidden:consentPanel?.hidden??null,rect:rect(consentPanel)}, map:{rect:rect(mapFrame),loaded:mapFrame?.contentWindow!=null,src:mapFrame?.src||mapFrame?.href||null},
    status:byText('Restauracja będzie otwarta'), photos:byText('Nasze zdjęcia'), contact:byText('Dane kontaktowe'), powered:byText('Powered by'), changeConsent:byText('Zmień zgodę'),
    header:{language:card('PL')||card('pl'),menu:rect([...document.querySelectorAll('button')].find((b)=>/menu/i.test(b.getAttribute('aria-label')||''))),logo:rect([...document.querySelectorAll('a')].find((a)=>{const r=a.getBoundingClientRect();return r.top<100&&r.left<80&&r.width>=40&&r.height>=40;}))},
    cards:{dineIn:card('Na miejscu'), pickup:card('Odbiór osobisty'), localPickup:card('Na wynos'), delivery:card('Dostawa'), cocktails:card('Cocktails')},
    links
  };
})()`;

async function evaluate(cdp, expression) { const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; }
async function configure(cdp, width, height, mobile) {
  await cdp.send("Emulation.setUserAgentOverride", { userAgent: mobile ? androidUa : desktopUa, userAgentMetadata: mobile ? { brands:[{brand:"Google Chrome",version:"131"},{brand:"Chromium",version:"131"},{brand:"Not_A Brand",version:"24"}], fullVersionList:[{brand:"Google Chrome",version:"131.0.0.0"},{brand:"Chromium",version:"131.0.0.0"},{brand:"Not_A Brand",version:"24.0.0.0"}], platform:"Android", platformVersion:"14.0.0", architecture:"", model:"Pixel 7", mobile:true, bitness:"", wow64:false } : { brands:[{brand:"Google Chrome",version:"131"},{brand:"Chromium",version:"131"},{brand:"Not_A Brand",version:"24"}], fullVersionList:[{brand:"Google Chrome",version:"131.0.0.0"},{brand:"Chromium",version:"131.0.0.0"},{brand:"Not_A Brand",version:"24.0.0.0"}], platform:"macOS", platformVersion:"14.6.0", architecture:"arm", model:"", mobile:false, bitness:"64", wow64:false } });
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
  await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 3 : 1, mobile, screenWidth:width, screenHeight:height, screenOrientation:{type:"portraitPrimary",angle:0} });
}
async function ready(cdp) { await until(async()=>await evaluate(cdp,"document.readyState==='complete'"),"document ready"); await sleep(2500); }
async function warm(cdp) { await evaluate(cdp,`(async()=>{ for(let y=0;y<document.documentElement.scrollHeight;y+=Math.max(300,innerHeight*.55)){scrollTo(0,y);await new Promise(r=>setTimeout(r,45));}scrollTo(0,document.documentElement.scrollHeight);await new Promise(r=>setTimeout(r,500));scrollTo(0,0);await new Promise(r=>setTimeout(r,250));return true;})()`); }
async function navigate(cdp,url){ await cdp.send("Page.navigate",{url}); await ready(cdp); await warm(cdp); }
async function acceptVisibleConsent(cdp){
  const clicked=await evaluate(cdp,`(()=>{const button=[...document.querySelectorAll('button')].find((item)=>(item.textContent||'').trim()===${JSON.stringify(consentChoice)}&&item.getBoundingClientRect().height>0);button?.click();return Boolean(button);})()`);
  if(clicked) await sleep(500);
}
async function shot(cdp,name,beyond=true){ console.error(`capture ${name}`); const metrics=await cdp.send("Page.getLayoutMetrics"); const content=metrics.cssContentSize||metrics.contentSize; const viewport=metrics.cssVisualViewport||metrics.visualViewport; const dpr=await evaluate(cdp,"devicePixelRatio"); const params={format:"png",captureBeyondViewport:true,fromSurface:true,optimizeForSpeed:true,clip:beyond?{x:0,y:0,width:content.width,height:content.height,scale:1/dpr}:{x:viewport.pageX,y:viewport.pageY,width:viewport.clientWidth,height:viewport.clientHeight,scale:1/dpr}}; const image=await cdp.send("Page.captureScreenshot",params); await writeFile(join(output,name),Buffer.from(image.data,"base64")); console.error(`captured ${name}`); }

await mkdir(output,{recursive:true});
const debugPort=await freePort(); const profile=await mkdtemp(join(tmpdir(),"cq-exact-acceptance-")); let chrome; let cdp;
try {
  chrome=spawn(chromePath,["--headless=new","--no-first-run","--no-default-browser-check",`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profile}`,"about:blank"],{stdio:"ignore"});
  const version=await until(async()=>{const r=await fetch(`http://127.0.0.1:${debugPort}/json/version`);return r.ok&&r.json();},"Chrome start");
  const target=await until(async()=>{const r=await fetch(`http://127.0.0.1:${debugPort}/json/new?about%3Ablank`,{method:"PUT"});return r.ok&&r.json();},"target");
  cdp=new Cdp(target.webSocketDebuggerUrl||version.webSocketDebuggerUrl); await cdp.connect(); await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Network.enable");

  const screenshots = process.env.SKIP_CAPTURES !== "1";
  const onlyProfile = process.env.ONLY_PROFILE;
  const onlySide = process.env.ONLY_SIDE;
  const statesOnly = process.env.STATES_ONLY === "1";
  const statesNoDesktop = process.env.STATES_NO_DESKTOP === "1";
  const desktopOnly = process.env.DESKTOP_ONLY === "1";
  await configure(cdp,390,844,true); await navigate(cdp,localUrl); if (screenshots) await shot(cdp,"local-pl-android-390-first-visit.png",false);
  const accepted=encodeURIComponent(JSON.stringify({essential:true,analytics:true,marketing:true,updatedAt:"2026-08-27T00:00:00.000Z",policyVersion:1}));
  await cdp.send("Network.setCookie",{name:"margariteros_consent_v1",value:accepted,url:localUrl,path:"/",sameSite:"Lax"});
  await acceptVisibleConsent(cdp);
  if (!onlySide || onlySide === "live") { await configure(cdp,390,844,true); await navigate(cdp,liveUrl); await acceptVisibleConsent(cdp); }

  const results={chrome:{product:version.Browser,protocol:version["Protocol-Version"],androidUa,desktopUa},profiles:{},states:{}};
  if (!statesOnly) for(const width of mobileCases){ const key=`android-${width}`; if (onlyProfile && onlyProfile!==key) continue; results.profiles[key]={}; for(const [side,url] of [["live",liveUrl],["local",localUrl]]){ if (onlySide && onlySide!==side) continue; await configure(cdp,width,844,true); await navigate(cdp,url); await acceptVisibleConsent(cdp); if (screenshots) await shot(cdp,`${side}-pl-android-${width}-dpr3-ready.png`); results.profiles[key][side]=await evaluate(cdp,metricsExpression); } await writeFile(join(output,"metrics-summary-single.json"),JSON.stringify(results,null,2)); }
  if (!statesOnly) for(const [width,height] of desktopCases){ const key=`desktop-${width}`; if (onlyProfile && onlyProfile!==key) continue; results.profiles[key]={}; for(const [side,url] of [["live",liveUrl],["local",localUrl]]){ if (onlySide && onlySide!==side) continue; await configure(cdp,width,height,false); await navigate(cdp,url); await acceptVisibleConsent(cdp); if (screenshots) await shot(cdp,`${side}-pl-desktop-${width}-ready.png`); results.profiles[key][side]=await evaluate(cdp,metricsExpression); } await writeFile(join(output,"metrics-summary-single.json"),JSON.stringify(results,null,2)); }

  for(const [side,url] of [["live",liveUrl],["local",localUrl]]){ if (desktopOnly || onlyProfile || (onlySide && onlySide!==side)) continue;
    await configure(cdp,390,844,true); await navigate(cdp,url); await acceptVisibleConsent(cdp);
    if (screenshots) await shot(cdp,`${side}-pl-android-390-top-viewport.png`,false);
    await evaluate(cdp,"scrollTo(0,document.documentElement.scrollHeight); true"); await sleep(2200); if (screenshots) await shot(cdp,`${side}-pl-android-390-footer-map-viewport.png`,false); await evaluate(cdp,"scrollTo(0,0); true"); await sleep(250);
    const languageOpen=await evaluate(cdp,`(()=>{const candidates=[...document.querySelectorAll('button')].filter(b=>(b.textContent||'').trim().toUpperCase().startsWith('PL'));const b=candidates.find(x=>{const r=x.getBoundingClientRect();return r.top<140&&r.width>30;});b?.click();return Boolean(b);})()`); await sleep(5000); if (screenshots) await shot(cdp,`${side}-pl-android-390-language-overlay.png`,false); const languageState=await evaluate(cdp,`(()=>({text:(document.body.innerText||'').slice(0,8000),buttons:[...document.querySelectorAll('button')].map(b=>({text:(b.textContent||'').trim(),aria:b.getAttribute('aria-label'),expanded:b.getAttribute('aria-expanded'),rect:(()=>{const r=b.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()})).filter(x=>x.rect.width>0&&x.rect.height>0),links:[...document.querySelectorAll('a')].map(a=>({text:(a.textContent||'').trim().replace(/\\s+/g,' '),href:a.href,target:a.target})).filter(x=>x.text)}))()`);
    await navigate(cdp,url); await acceptVisibleConsent(cdp);
    const menuOpen=await evaluate(cdp,`(()=>{const buttons=[...document.querySelectorAll('button')];const b=buttons.find(b=>/menu/i.test(b.getAttribute('aria-label')||''))||buttons.filter(b=>{const r=b.getBoundingClientRect();return r.top<140&&r.width>=38&&r.width<=60;}).at(-2);b?.click();return Boolean(b);})()`); await sleep(5000); if (screenshots) await shot(cdp,`${side}-pl-android-390-drawer.png`,false); const drawerState=await evaluate(cdp,`(()=>({text:(document.body.innerText||'').slice(0,8000),htmlClass:document.documentElement.className,buttons:[...document.querySelectorAll('button')].map(b=>({text:(b.textContent||'').trim(),aria:b.getAttribute('aria-label'),expanded:b.getAttribute('aria-expanded'),rect:(()=>{const r=b.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()})).filter(x=>x.rect.width>0&&x.rect.height>0),links:[...document.querySelectorAll('a')].map(a=>({text:(a.textContent||'').trim().replace(/\\s+/g,' '),href:a.href,target:a.target})).filter(x=>x.text)}))()`);
    const drawerVisible=`(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='Zaloguj się'&&x.getBoundingClientRect().width>200);if(!b)return false;const r=b.getBoundingClientRect();return r.left<innerWidth&&r.right>0;})()`;
    const closeBefore=await evaluate(cdp,drawerVisible); await evaluate(cdp,`(()=>{const b=[...document.querySelectorAll('button')].find(b=>{const r=b.getBoundingClientRect();return r.x>320&&r.y<80&&r.width>=35&&r.height>=35&&!/menu/i.test(b.getAttribute('aria-label')||'')});b?.click();return Boolean(b);})()`); await sleep(5000); const closeAfter=await evaluate(cdp,drawerVisible);
    await evaluate(cdp,`(()=>{const b=[...document.querySelectorAll('button')].find(b=>/menu/i.test(b.getAttribute('aria-label')||''));b?.click();return Boolean(b);})()`); await sleep(5000); const escapeBefore=await evaluate(cdp,drawerVisible); await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27,nativeVirtualKeyCode:27}); await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27,nativeVirtualKeyCode:27}); await sleep(5000); const escapeAfter=await evaluate(cdp,drawerVisible);
    results.states[side]={languageOpen,languageState,menuOpen,drawerState,escapeBefore,escapeAfter,closeBefore,closeAfter};
  }
  if (statesOnly && !statesNoDesktop) for (const [width,height] of desktopCases) for (const [side,url] of [["live",liveUrl],["local",localUrl]]) {
    if (onlySide && onlySide!==side) continue;
    await configure(cdp,width,height,false); await navigate(cdp,url); await acceptVisibleConsent(cdp); await shot(cdp,`${side}-pl-desktop-${width}-top-viewport.png`,false);
    await evaluate(cdp,"scrollTo(0,document.documentElement.scrollHeight); true"); await sleep(1500); await shot(cdp,`${side}-pl-desktop-${width}-footer-viewport.png`,false);
  }
  await writeFile(join(output,statesOnly?"interaction-states.json":onlyProfile||onlySide?"metrics-summary-single.json":"metrics-summary.json"),JSON.stringify(results,null,2));
  console.log(JSON.stringify(Object.fromEntries(Object.entries(results.profiles).map(([k,v])=>[k,{live:v.live?.dimensions??null,local:v.local?.dimensions??null,liveGallery:v.live?.gallery.count??null,localGallery:v.local?.gallery.count??null}])),null,2));
} finally { cdp?.close(); if(chrome&&chrome.exitCode===null&&!chrome.killed){chrome.kill("SIGTERM");await Promise.race([once(chrome,"exit"),sleep(3000)]);} await rm(profile,{recursive:true,force:true}); }
