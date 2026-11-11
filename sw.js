const V="rexweb-v4",ST=V+"-static",RT=V+"-rt";
const SHELL=["./","index.html"];
const OFF='<!DOCTYPE html><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#f4f7ff;font:16px system-ui;text-align:center"><div><div style="font-size:54px">📡</div><h1>You\'re offline</h1><p style="color:#a9b8d2">This page isn\'t saved yet. Pages you\'ve visited still work.</p><a href="index.html" style="color:#36a5ff">Go to Home</a></div>';
const PAGES=["tools.html","templates.html","Rex-editor.html","Rexweb-%23piano.html","games.html","marketplace.html","about.html","contact.html","privacy.html","terms.html","login.html","register.html","video-editor/index.html"];
const HOSTS=["images.unsplash.com","cdnjs.cloudflare.com","cdn.jsdelivr.net","fonts.googleapis.com","fonts.gstatic.com"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{const c=await caches.open(ST);await Promise.all(SHELL.concat(PAGES).map(u=>c.add(new Request(u,{cache:"reload"})).catch(()=>{})));self.skipWaiting()})())});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(!k.startsWith(V))await caches.delete(k);await self.clients.claim()})())});
self.addEventListener("message",e=>{if(e.data&&e.data.type==="precache")e.waitUntil((async()=>{const c=await caches.open(RT);await Promise.all(e.data.urls.map(u=>fetch(u,{mode:new URL(u).origin===location.origin?"same-origin":"no-cors"}).then(r=>c.put(u,r)).catch(()=>{})))})())});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
 if(r.mode==="navigate"){if(u.origin===location.origin)e.respondWith(nav(r));return}
 const ok=u.origin===location.origin?["style","script","image","font","manifest"].includes(r.destination):HOSTS.includes(u.hostname);
 if(ok)e.respondWith(swr(r))});
async function nav(r){const c=await caches.open(ST);try{const res=await Promise.race([fetch(r),new Promise((_,j)=>setTimeout(j,3500))]);if(res.ok)c.put(r,res.clone());return res}catch(_){return await c.match(r,{ignoreSearch:true})||(new URL(r.url).pathname.endsWith("/")&&await c.match("index.html"))||new Response(OFF,{headers:{"Content-Type":"text/html;charset=utf-8"}})}}
async function swr(r){const c=await caches.open(RT);const hit=await c.match(r)||await caches.match(r);
 const net=fetch(r).then(async res=>{if(res.ok||res.type==="opaque"){await c.put(r,res.clone());const k=await c.keys();if(k.length>160)await c.delete(k[0])}return res}).catch(()=>null);
 return hit||await net||(r.destination==="image"?new Response('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',{headers:{"Content-Type":"image/svg+xml"}}):Response.error())}
