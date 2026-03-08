// src/utils/pushSubscription.js
import axios from "axios";
axios.defaults.withCredentials = true;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const initPushNotifications = async (userId) => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error("Push messaging or Service Workers not supported.");
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    // Check with the backend first!
    const { data } = await axios.post("/api/v1/notification/check", {
      userId,
      endpoint: subscription.endpoint,
    });

    if (data.existsInDB && !data.needsUpdate) {
      console.log("Subscription already valid in DB. Skipping save.");
      return;
    }
  }

  try {
    // 1. Register the Service Worker
    // Note: VitePWA usually handles the registration for you if you use autoUpdate,
    // but manually registering here is fine for direct control.
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // 2. CRITICAL FIX: Wait for the Service Worker to be 'ready' (Active)
    // This solves the 'AbortError: no active Service Worker'
    await navigator.serviceWorker.ready;

    // 3. Request Permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return;
    }

    // 4. Check for existing subscription first (Optimization)
    let subscription = await registration.pushManager.getSubscription();

    // 5. If no subscription exists, create one
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY,
        ),
      });
    }

    // 6. Send to backend
    // I added a check here—only hit the API if we actually have a subscription/userId
    if (subscription && userId) {
      console.log("Sending subscription to backend:", userId);
      await axios.post("/api/v1/notification/subscribe", {
        subscription,
        userId,
      });
    }

    console.log("Push notification setup complete");
  } catch (err) {
    // Better error logging for debugging
    if (err.name === "AbortError") {
      console.error(
        "Push subscription aborted: Service Worker not active yet.",
      );
    } else {
      console.error("Push subscription error:", err);
    }
  }
};


export async function disableNotifications(userId) {
  try {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();

    if (!sub) return false;

    const endpoint = sub.endpoint;

    await sub.unsubscribe();

    await axios.post("/api/v1/notification/unsubscribe", {
      endpoint,
      user: userId,
    });

    return true;
  } catch (err) {
    console.log("Disable error", err);
    return false;
  }
}
