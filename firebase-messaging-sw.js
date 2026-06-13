importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyALT4nNnGuiqpLN4S1QFm4el9742xB20vI",
  authDomain: "zdorovenki-buly-app.firebaseapp.com",
  projectId: "zdorovenki-buly-app",
  messagingSenderId: "634015822794",
  appId: "1:634015822794:web:32f4debc3910731f4a1533"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Отримано фонове повідомлення:", payload);

  const { title, body } = payload.notification || {};

  self.registration.showNotification(title || "Нагадування", {
    body: body || "",
    icon: "/icon.png"
  });
});
