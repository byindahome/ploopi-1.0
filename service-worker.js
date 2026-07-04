const CACHE_NAME = 'ploopi-cache-v2';
const FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/manifest.json',
  '/locales/en.json',
  '/locales/id.json',
  '/src/main.js'
];

self.addEventListener('install', evt=>{
  self.skipWaiting();
  evt.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES)));
});
self.addEventListener('activate', evt=>{
  evt.waitUntil(caches.keys().then(keys => Promise.all(
    keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })
  )));
});
self.addEventListener('fetch', evt=>{
  evt.respondWith(caches.match(evt.request).then(res => res || fetch(evt.request).then(r=>{ caches.open(CACHE_NAME).then(c=>{ try{ c.put(evt.request, r.clone()); }catch(e){} }); return r; })).catch(()=>caches.match('/index.html')));
});
