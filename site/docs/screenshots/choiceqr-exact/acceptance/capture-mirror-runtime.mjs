import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const output = fileURLToPath(new URL(".", import.meta.url));
const localUrl = process.env.LOCAL_URL ?? "http://127.0.0.1:4335/pl/";
const liveUrl = "https://qr.margariteros.bar/";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const androidUa = "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/AP2A.240805.005) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function freePort() { const server=createServer(); server.listen(0,"127.0.0.1"); await once(server,"listening"); const address=server.address(); await new Promise((resolve,reject)=>server.close((error)=>error?reject(error):resolve())); return address.port; }
async function until(check,label){ for(let i=0;i<100;i+=1){ try{const value=await check();if(value)return value;}catch{} await sleep(100);} throw new Error(`Timed out: ${label}`); }

class Cdp {
  constructor(url){ this.socket=new WebSocket(url); this.id=0; this.pending=new Map(); this.listeners=[]; }
  async connect(){ await new Promise((resolve,reject)=>{this.socket.onopen=resolve;this.socket.onerror=reject;}); this.socket.onmessage=({data})=>{const message=JSON.parse(data); if(message.id){const pending=this.pending.get(message.id);if(!pending)return;this.pending.delete(message.id);message.error?pending.reject(new Error(message.error.message)):pending.resolve(message.result);return;} for(const listener of this.listeners) listener(message.method,message.params);}; }
  on(listener){this.listeners.push(listener);}
  send(method,params={}){const id=++this.id;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error(`CDP timeout: ${method}`));},20000);this.pending.set(id,{resolve:(value)=>{clearTimeout(timer);resolve(value);},reject:(error)=>{clearTimeout(timer);reject(error);}});this.socket.send(JSON.stringify({id,method,params}));});}
  close(){this.socket.close();}
}

async function evaluate(cdp,expression){const result=await cdp.send("Runtime.evaluate",{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);return result.result.value;}
async function configure(cdp){await cdp.send("Emulation.setUserAgentOverride",{userAgent:androidUa,userAgentMetadata:{brands:[{brand:"Google Chrome",version:"131"},{brand:"Chromium",version:"131"}],fullVersionList:[{brand:"Google Chrome",version:"131.0.0.0"},{brand:"Chromium",version:"131.0.0.0"}],platform:"Android",platformVersion:"14.0.0",architecture:"",model:"Pixel 7",mobile:true,bitness:"",wow64:false}});await cdp.send("Emulation.setTouchEmulationEnabled",{enabled:true,maxTouchPoints:5});await cdp.send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:3,mobile:true,screenWidth:390,screenHeight:844,screenOrientation:{type:"portraitPrimary",angle:0}});}
async function screenshot(cdp,name){const data=await cdp.send("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false});await writeFile(join(output,name),Buffer.from(data.data,"base64"));}

const profile=await mkdtemp(join(tmpdir(),"cq-mirror-runtime-")); const port=await freePort(); let chrome; let cdp;
try{
  chrome=spawn(chromePath,["--headless=new","--no-first-run","--no-default-browser-check",`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,"about:blank"],{stdio:"ignore"});
  const version=await until(async()=>{const response=await fetch(`http://127.0.0.1:${port}/json/version`);return response.ok&&response.json();},"Chrome");
  const target=await until(async()=>{const response=await fetch(`http://127.0.0.1:${port}/json/new?about%3Ablank`,{method:"PUT"});return response.ok&&response.json();},"target");
  cdp=new Cdp(target.webSocketDebuggerUrl); await cdp.connect();
  await Promise.all([cdp.send("Page.enable"),cdp.send("Runtime.enable"),cdp.send("Network.enable"),cdp.send("Log.enable")]); await configure(cdp);
  const results={chrome:version.Browser,sides:{}};
  for(const [side,url] of [["live",liveUrl],["local",localUrl]]){
    const evidence={requests:[],responses:[],failures:[],console:[],exceptions:[],logs:[]}; results.sides[side]=evidence;
    const listener=(method,params)=>{
      if(method==="Network.requestWillBeSent") evidence.requests.push({url:params.request.url,method:params.request.method,type:params.type,initiator:params.initiator?.type});
      else if(method==="Network.responseReceived") evidence.responses.push({url:params.response.url,status:params.response.status,type:params.type,mime:params.response.mimeType,fromDiskCache:params.response.fromDiskCache,headers:params.response.headers});
      else if(method==="Network.loadingFailed") evidence.failures.push({id:params.requestId,type:params.type,error:params.errorText,blockedReason:params.blockedReason,canceled:params.canceled});
      else if(method==="Runtime.consoleAPICalled") evidence.console.push({type:params.type,text:params.args?.map((arg)=>arg.value??arg.description).join(" ")});
      else if(method==="Runtime.exceptionThrown") evidence.exceptions.push(params.exceptionDetails?.exception?.description??params.exceptionDetails?.text);
      else if(method==="Log.entryAdded") evidence.logs.push({source:params.entry.source,level:params.entry.level,text:params.entry.text,url:params.entry.url});
    };
    cdp.on(listener); await cdp.send("Page.navigate",{url}); await sleep(7000);
    const accepted=await evaluate(cdp,`(()=>{const button=[...document.querySelectorAll('button')].find((item)=>(item.textContent||'').trim()==='Akceptuj'&&item.getBoundingClientRect().height>0);button?.click();return Boolean(button);})()`); if(accepted) await sleep(750);
    const languageClicked=await evaluate(cdp,`(()=>{const button=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').trim().toUpperCase().startsWith('PL')&&b.getBoundingClientRect().top<140);button?.click();return Boolean(button);})()`); if(languageClicked) await sleep(2500);
    evidence.dom=await evaluate(cdp,`(()=>({url:location.href,readyState:document.readyState,title:document.title,htmlMirror:document.documentElement.getAttribute('data-choiceqr-mirror'),nextChildren:document.querySelector('#__next')?.children.length??null,deviceSelector:document.querySelector('#device-type-selector')?.className??null,bodyText:(document.body.innerText||'').slice(0,500),bodyHtmlLength:document.body.innerHTML.length,images:document.images.length,loadedImages:[...document.images].filter(x=>x.complete&&x.naturalWidth>0).length,scripts:[...document.scripts].map(s=>s.src||'inline'),iframes:[...document.querySelectorAll('iframe')].map(f=>f.src),galleryText:(document.body.innerText||'').includes('Nasze zdjęcia'),languageButtons:[...document.querySelectorAll('button')].filter(b=>(b.textContent||'').trim().toUpperCase().startsWith('PL')).length,menuButtons:[...document.querySelectorAll('button')].filter(b=>/menu/i.test(b.getAttribute('aria-label')||'')).length,languageClicked:${languageClicked},hasMachineTranslations:(document.body.innerText||'').includes('Tłumaczenie maszynowe'),hasSpanish:(document.body.innerText||'').includes('Spanish'),htmlHasCf:document.documentElement.outerHTML.includes('cloudflareinsights'),htmlHasGtm:document.documentElement.outerHTML.includes('googletagmanager')||document.documentElement.outerHTML.includes('gtag/js'),htmlHasFacebook:document.documentElement.outerHTML.includes('connect.facebook')||document.documentElement.outerHTML.includes('facebookPixel'),nextDataHasMarketing:(()=>{try{const j=JSON.parse(document.querySelector('#__NEXT_DATA__')?.textContent||'{}');return Boolean(j?.props?.app?.marketing)}catch{return 'parse-error'}})()}))()`);
    await screenshot(cdp,`${side}-pl-android-390-mirror-runtime.png`);
    evidence.requests=evidence.requests.filter((item,index,all)=>all.findIndex((other)=>other.url===item.url&&other.method===item.method)===index);
    evidence.responses=evidence.responses.filter((item,index,all)=>all.findIndex((other)=>other.url===item.url&&other.status===item.status)===index);
  }
  await writeFile(join(output,"mirror-runtime.json"),JSON.stringify(results,null,2));
  console.log(JSON.stringify(Object.fromEntries(Object.entries(results.sides).map(([side,value])=>[side,{dom:value.dom,requests:value.requests.length,responses:value.responses.length,failures:value.failures,console:value.console,exceptions:value.exceptions,logs:value.logs}])),null,2));
} finally {cdp?.close();if(chrome&&chrome.exitCode===null&&!chrome.killed){chrome.kill("SIGTERM");await Promise.race([once(chrome,"exit"),sleep(2000)]);}await rm(profile,{recursive:true,force:true});}
