// 상하이 여행 페이지 오프라인 캐시
const V = "shanghai-cf74a477fd";
const FILES = ["./", "./index.html", "./manifest.webmanifest",
               "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;          // 지도 링크 등 외부는 그대로
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok) caches.open(V).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => hit || caches.match("./index.html"));
      return hit || net;                              // 캐시 우선, 뒤에서 갱신
    })
  );
});
