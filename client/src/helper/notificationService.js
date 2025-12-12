import axios from "axios";
axios.defaults.withCredentials = true;

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user")) || null;
    return user;
  } catch (e) {
    return null;
  }
};

export const enableNotifications = async (userId) => {
  try {
    if (!userId) return;

    await navigator.serviceWorker.register("/sw.js");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY
        ),
      });

      await axios.post("/api/v1/notification/subscribe", {
        subscription: sub,
        user: userId || getUserId()?._id,
      });
    }
  } catch (err) {
    console.log("Push setup error:", err);
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
      user: userId || getUserId(),
    });

    return true;
  } catch (err) {
    console.log("Disable error", err);
    return false;
  }
}

export async function toggleNotifications(userId) {
  const isEnabled = await checkNotificationStatus(userId);

  if (isEnabled) {
    await disableNotifications();
    return false;
  } else {
    await enableNotifications(userId);
    return true;
  }
}

export async function checkNotificationStatus() {
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();
  return !!sub;
}

export async function ensureSubscription(userId) {
  const registration = await navigator.serviceWorker.ready;

  // Check browser subscription
  let subscription = await registration.pushManager.getSubscription();
  const endpoint = subscription?.endpoint || null;

  // Check DB record for this user & this device
  const res = await axios.post("/api/v1/notification/subscription/check", {
    endpoint,
    user: userId,
  });

  const data = await res.data;

  // Case 1: Browser has subscription AND DB has subscription => do nothing
  if (subscription && data.existsInDB) {
    console.log("Subscription exists on device + DB. OK.");
    return;
  }

  // Case 2: Browser has subscription but DB does NOT => save it
  if (subscription && !data.existsInDB) {
    console.log("Browser subscription exists but missing in DB. Saving...");
    await saveToDB(subscription, userId);
    return;
  }

  // Case 3: Browser has NO subscription => create new
  console.log("No browser subscription. Creating new...");
  subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
  });

  await saveToDB(subscription, userId);
}

async function saveToDB(subscription, userId) {
    await axios.post("/api/v1/notification/subscribe", {
      subscription,
      user: userId,
    });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
