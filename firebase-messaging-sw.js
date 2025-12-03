importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyCMBo0gOn43_ovP4MiZpeGRRKX4EMjRxFg",
  authDomain: "stepanproject-e1a89.firebaseapp.com",
  projectId: "stepanproject-e1a89",
  messagingSenderId: "910486338176",
  appId: "1:910486338176:web:6d9456735d172736d94465"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Отримано фонове повідомлення:", payload);

  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body: body,
    icon: "/icon.png" // заміни на свій шлях до іконки або видали
  });
});
