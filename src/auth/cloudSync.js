import { app } from "./firebaseConfig.js";
import { getCurrentUser } from "./authManager.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let db = null;
if (app) {
  db = getFirestore(app);
}

export function isSyncAvailable() {
  return db !== null && getCurrentUser() !== null;
}

/**
 * 將本地存檔推送到雲端
 * @param {Object} stateData - 已經 normalize 過的 state
 * @returns {Promise<{ok: boolean, error?: any}>}
 */
export async function pushState(stateData) {
  if (!isSyncAvailable()) return { ok: false, error: "Sync unavailable" };
  const user = getCurrentUser();
  if (!user) return { ok: false, error: "No user" };

  try {
    const docRef = doc(db, "users", user.uid, "saves", "main");
    // 我們將整份 stateData 原封不動存放，並加上 server timestamp 以便未來比對
    await setDoc(docRef, {
      save_data: stateData,
      client_last_seen: stateData.lastSeenAt || Date.now(),
      updated_at: serverTimestamp(),
      version: "v1"
    }, { merge: true }); // 使用 merge 避免覆蓋其他可能的 meta 欄位
    
    return { ok: true };
  } catch (error) {
    console.error("[cloudSync] 推送存檔失敗:", error);
    return { ok: false, error };
  }
}

/**
 * 從雲端拉取最新的存檔
 * @returns {Promise<{ok: boolean, data?: Object, error?: any}>}
 */
export async function pullState() {
  if (!isSyncAvailable()) return { ok: false, error: "Sync unavailable" };
  const user = getCurrentUser();
  if (!user) return { ok: false, error: "No user" };

  try {
    const docRef = doc(db, "users", user.uid, "saves", "main");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return { ok: true, data: data.save_data, serverTimestamp: data.updated_at };
    } else {
      return { ok: true, data: null }; // 雲端無存檔
    }
  } catch (error) {
    console.error("[cloudSync] 拉取存檔失敗:", error);
    return { ok: false, error };
  }
}
