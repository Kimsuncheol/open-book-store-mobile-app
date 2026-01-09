import { doc, getDoc, setDoc, updateDoc, deleteDoc, increment } from "firebase/firestore";
import { db } from "../config/firebase";

export const incrementUserDownloads = async (
  userId: string,
  amount = 1
): Promise<void> => {
  const docRef = doc(db, "users", userId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    await setDoc(docRef, { downloads: 0 }, { merge: true });
  }
  await updateDoc(docRef, { downloads: increment(amount) });
};

export const decrementUserDownloads = async (userId: string): Promise<void> => {
  const docRef = doc(db, "users", userId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    await setDoc(docRef, { downloads: 0 }, { merge: true });
  }
  await updateDoc(docRef, { downloads: increment(-1) });
};

export const addUserDownload = async (userId: string, bookId: string): Promise<void> => {
  const docRef = doc(db, "downloads", userId, "downloads", bookId);
  await setDoc(docRef, { bookId, downloadedAt: new Date() }, { merge: true });
};

export const getUserDownloadCount = async (userId: string): Promise<number> => {
  const docRef = doc(db, "users", userId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return 0;
  const data = snapshot.data();
  return typeof data?.downloads === "number" ? data.downloads : 0;
};

export const removeUserDownload = async (userId: string, bookId: string): Promise<void> => {
  const docRef = doc(db, "downloads", userId, "downloads", bookId);
  await deleteDoc(docRef);
};
