// سرویس‌ورکر سبک، فقط برای فعال‌شدن قابلیت نصب (Add to Home Screen) روی اندروید لازم است.
// کش واقعی انجام نمی‌دهد؛ همه‌چیز مستقیم از شبکه لود می‌شود.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
