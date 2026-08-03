import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// TODO: 將這些設定替換為您的 Firebase 專案設定
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 只有在提供有效 apiKey 時才初始化，避免在未設定前報錯崩潰
export const app = firebaseConfig.apiKey !== "YOUR_API_KEY" ? initializeApp(firebaseConfig) : null;

if (!app) {
  console.warn("[Firebase] Firebase config 未設定，帳號綁定功能暫時停用。請至 src/auth/firebaseConfig.js 設定。");
}
