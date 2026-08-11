import { app } from "./firebaseConfig.js";
import { getCurrentUser } from "./authManager.js";
import { pruneStateForCloudSync } from "../engine/storageGuard.js";
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
    const cloudSafeState = pruneStateForCloudSync(stateData);
    const docRef = doc(db, "users", user.uid, "saves", "main");
    // Replace the complete save document so legacy raw fields cannot survive a merge.
    await setDoc(docRef, {
      save_data: cloudSafeState,
      client_last_seen: cloudSafeState.lastSeenAt || Date.now(),
      updated_at: serverTimestamp(),
      version: "v1"
    });
    
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
      return {
        ok: true,
        // Apply the same privacy projection on read so a pre-V2 cloud save
        // cannot reintroduce raw/conversation-derived fields before its first
        // replacement write.
        data: pruneStateForCloudSync(data.save_data || {}),
        serverTimestamp: data.updated_at
      };
    } else {
      return { ok: true, data: null }; // 雲端無存檔
    }
  } catch (error) {
    console.error("[cloudSync] 拉取存檔失敗:", error);
    return { ok: false, error };
  }
}
