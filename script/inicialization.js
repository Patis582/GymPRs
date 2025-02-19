// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMoEnT2xBRyqC2wPW404eBq5XSMjQ4-lM",
  authDomain: "gymprs-1ab39.firebaseapp.com",
  projectId: "gymprs-1ab39",
  storageBucket: "gymprs-1ab39.firebasestorage.app",
  messagingSenderId: "501305308944",
  appId: "1:501305308944:web:c310b5979a313f43edd795",
  measurementId: "G-NCMXSM5425"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);