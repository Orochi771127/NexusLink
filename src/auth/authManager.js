import { app } from "./firebaseConfig.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let auth = null;
if (app) {
  auth = getAuth(app);
}

export function isAuthAvailable() {
  return auth !== null;
}

export async function loginWithGoogle() {
  if (!isAuthAvailable()) {
    throw new Error("Firebase Auth 未初始化，無法登入");
  }
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return { ok: true, user: result.user };
  } catch (error) {
    console.error("[authManager] 登入失敗:", error);
    return { ok: false, error };
  }
}

export async function logout() {
  if (!isAuthAvailable()) return { ok: true };
  try {
    await firebaseSignOut(auth);
    return { ok: true };
  } catch (error) {
    console.error("[authManager] 登出失敗:", error);
    return { ok: false, error };
  }
}

/**
 * 訂閱登入狀態改變
 * @param {Function} callback - 回呼函式，參數為 (user)
 * @returns {Function} - 取消訂閱函式
 */
export function onAuthStateChanged(callback) {
  if (!isAuthAvailable()) {
    // 若未初始化，直接以 null (未登入) 呼叫一次
    callback(null);
    return () => {};
  }
  return firebaseOnAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth ? auth.currentUser : null;
}
