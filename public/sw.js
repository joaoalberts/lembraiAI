/**
 * Service Worker do LembreiAi (Expo).
 *
 * Objetivos, nesta ordem: (1) tornar o app instalável, (2) exibir as notificações de chegada mesmo com a aba em
 * segundo plano, (3) abrir na tela certa ao tocar no aviso. O cache é conservador de propósito — a navegação vai
 * sempre à rede primeiro, para o app nunca servir uma versão velha depois de um deploy.
 */
const VERSION = 'v1';
const STATIC = `lembreiai-static-${VERSION}`;
const PRECACHE = ['/icons/icon-192.png', '/icons/icon-512.png', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('lembreiai-') && k !== STATIC).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // navegação: rede primeiro; só usa o cache se estiver offline
  if (request.mode === 'navigate') {
    e.respondWith((async () => {
      try { return await fetch(request); }
      catch { return (await caches.match(request)) ?? (await caches.match('/')) ?? Response.error(); }
    })());
    return;
  }

  // estáticos próprios (ícones, imagens, fontes): responde do cache e atualiza em segundo plano
  if (/\/(icons|assets)\//.test(url.pathname) || /\.(png|jpg|svg|woff2?)$/.test(url.pathname)) {
    e.respondWith((async () => {
      const hit = await caches.match(request);
      const net = fetch(request).then((res) => {
        if (res.ok) caches.open(STATIC).then((c) => c.put(request, res.clone()));
        return res;
      }).catch(() => hit ?? Response.error());
      return hit ?? net;
    })());
  }
});

/** Tocar no aviso abre o app. */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const alvo = e.notification.data?.url || '/';
  e.waitUntil((async () => {
    const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of janelas) {
      if (new URL(c.url).origin === self.location.origin) { await c.focus(); return c.navigate?.(alvo); }
    }
    return self.clients.openWindow(alvo);
  })());
});
