// import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// // 1. Automatically clean up old, unused caches from previous versions
// cleanupOutdatedCaches();

// // 2. Inject the manifest for precaching assets
// // This is the magic line that Vite-Plugin-PWA uses
// precacheAndRoute(self.__WB_MANIFEST || []);

// // 3. Push Notification Listener
// self.addEventListener("push", (event) => {
//   let data = {
//     title: "New Update",
//     body: "Check your app for details.",
//     url: "/",
//   };

//   try {
//     if (event.data) {
//       data = event.data.json();
//     }
//   } catch (err) {
//     // Fallback if data isn't valid JSON
//     data.body = event.data.text();
//   }

//   const options = {
//     body: data.body,
//     icon: "/icons/icon-192x192.png",
//     badge: "/icons/icon-96x96.png",
//     data: { url: data.url || "/" },
//     vibrate: [100, 50, 100], // Vibration pattern for mobile
//     timestamp: Date.now(),
//   };

//   event.waitUntil(self.registration.showNotification(data.title, options));
// });

// // 4. Handle Notification Click
// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();

//   // Open the URL or focus the existing window
//   event.waitUntil(
//     clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
//       const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

//       for (const client of clientList) {
//         if (client.url === urlToOpen && "focus" in client) {
//           return client.focus();
//         }
//       }
//       if (clients.openWindow) {
//         return clients.openWindow(urlToOpen);
//       }
//     })
//   );
// });

// // 5. Allow the app to skip waiting and activate the new SW immediately
// self.addEventListener("message", (event) => {
//   if (event.data && event.data.type === "SKIP_WAITING") {
//     self.skipWaiting();
//   }
// });

import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);


self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : {
        title: "New Update",
        body: "Check your app for details.",
        icon: "/logo.png",
      };

  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png", // Path to your logo
    badge: "/icons/icon-96x96.png", // Small monochrome icon for status bars
    data: { url: data.url || "/" }, // Custom link to open on click
    timestamp: Date.now(),
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});