// Required for VitePWA InjectManifest
self.__WB_MANIFEST;

// ------------------------------------
// Push Notification Handler
// ------------------------------------
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  self.registration.showNotification(data.title || "Bhuvi Manager", {
    body: data.body || "You have a new notification.",
    icon: "icons/icon-192x192.png",
    badge: "icons/icon-96x96.png",
    vibrate: [200, 100, 200],
    data: data.url || "/",
  });
});

// ------------------------------------
// Click Notification Event
// ------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
});
