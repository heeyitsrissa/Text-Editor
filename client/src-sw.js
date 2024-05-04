const { offlineFallback, warmStrategyCache } = require('workbox-recipes');
const { CacheFirst } = require('workbox-strategies');
const { registerRoute } = require('workbox-routing');
const { CacheableResponsePlugin } = require('workbox-cacheable-response');
const { ExpirationPlugin } = require('workbox-expiration');
const { precacheAndRoute } = require('workbox-precaching/precacheAndRoute');

precacheAndRoute(self.__WB_MANIFEST);

const pageCache = new CacheFirst({
  cacheName: 'page-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

warmStrategyCache({
  urls: ['/index.html', '/'],
  strategy: pageCache,
});

registerRoute(
  ({ request }) => ['style', 'script', 'worker', 'image'].includes(request.destination),
  ({ request }) => {
    if (request.destination === 'image') {
      return new CacheFirst({
        cacheName: 'image-cache',
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxAgeSeconds: 7 * 24 * 60 * 60, 
          }),
        ],
      });
    }
    return new StaleWhileRevalidate({
      cacheName: 'asset-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200], 
        }),
      ],
    });
  }
);

offlineFallback({
  pageFallback: '/offline.html',
})
// TODO: Implement asset caching
registerRoute();
