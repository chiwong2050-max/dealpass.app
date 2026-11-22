/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { createHandlerBoundToURL } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

// 1. Precache App Shell (HTML, JS, CSS)
const manifest = (self as any).__WB_MANIFEST;
if (manifest && Array.isArray(manifest)) {
    cleanupOutdatedCaches();
    precacheAndRoute(manifest);
}

// 2. Navigation Fallback (SPA Support)
// This ensures that refreshing a page like /offers/123 while offline
// serves index.html (the app shell) instead of a 404.
// We wrap this in a try-catch because createHandlerBoundToURL throws if /index.html is not in the precache
// (which is common in dev mode).
try {
    const handler = createHandlerBoundToURL('/index.html');
    const navigationRoute = new NavigationRoute(handler, {
      allowlist: [
        // Allow all routes except API calls and file extensions
        new RegExp('^/(?!api|[^/]+\\.[^/]+$)'), 
      ],
    });
    registerRoute(navigationRoute);
} catch (error) {
    console.log('Workbox: Navigation fallback to index.html skipped (likely dev mode). Using NetworkFirst.');
    
    // In dev mode, or if index.html isn't precached, fallback to NetworkFirst for navigation
    registerRoute(
        ({ request }) => request.mode === 'navigate',
        new NetworkFirst({
            cacheName: 'dev-nav-cache',
            plugins: [
                new ExpirationPlugin({ maxEntries: 5 }),
            ]
        })
    );
}

// 3. Cache Images (User avatars, Deal photos) - CacheFirst
// Serve from cache immediately, only go to network if missing.
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// 4. Cache API Responses (Deals, Business Info) - StaleWhileRevalidate
// Serve cached content immediately for speed/offline, then update in background.
// Only cache GET requests.
registerRoute(
  ({ url, request }) => (url.pathname.startsWith('/api/offers') || url.pathname.startsWith('/api/businesses')) && request.method === 'GET',
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 24 * 60 * 60, // 24 Hours
      }),
    ],
  })
);

// 5. Handle Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'New Deal!', body: 'Check out the latest offer.' };
  
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/mask-icon.svg',
    data: data.url || '/', // URL to open on click
    vibrate: [100, 50, 100],
    actions: [
        { action: 'view', title: 'View Deal' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 6. Handle Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // URL to open (from payload)
  const urlToOpen = new URL(event.notification.data, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with this URL
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});