/* global importScripts, firebase */
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBURG8MSVJlYHyZGlWMNwVRWJ2tDUqzFYk",
  authDomain: "mobile-hub-8c9be.firebaseapp.com",
  projectId: "mobile-hub-8c9be",
  storageBucket: "mobile-hub-8c9be.firebasestorage.app",
  messagingSenderId: "716057877233",
  appId: "1:716057877233:web:c6edcbadb236d1a4f56750",
  measurementId: "G-3C0THXFHRH"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg', // Varsayılan ikon
    badge: '/vite.svg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
