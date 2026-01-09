import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { ReadingProgress, ReadingHistoryItem } from "../types/readingHistory";
import { getBook } from "./booksService";

/**
 * Update or create reading progress for a book
 */
export const updateReadingProgress = async (
  userId: string,
  bookId: string,
  currentPage: number,
  totalPages: number
): Promise<void> => {
  const percentComplete = Math.round((currentPage / totalPages) * 100);
  const docRef = doc(db, "users", userId, "readingHistory", bookId);
  
  const progressData = {
    bookId,
    userId,
    currentPage,
    totalPages,
    percentComplete,
    lastReadAt: new Date(),
  };

  await setDoc(docRef, progressData, { merge: true });
};

/**
 * Get reading progress for a specific book
 */
export const getReadingProgress = async (
  userId: string,
  bookId: string
): Promise<ReadingProgress | null> => {
  const docRef = doc(db, "users", userId, "readingHistory", bookId);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    bookId: data.bookId,
    userId: data.userId,
    currentPage: data.currentPage,
    totalPages: data.totalPages,
    percentComplete: data.percentComplete,
    lastReadAt: data.lastReadAt?.toDate() || new Date(),
  } as ReadingProgress;
};

/**
 * Get all reading history for a user
 */
export const getReadingHistory = async (
  userId: string
): Promise<ReadingHistoryItem[]> => {
  const q = query(
    collection(db, "users", userId, "readingHistory"),
    orderBy("lastReadAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  const historyItems: ReadingHistoryItem[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const book = await getBook(data.bookId);
    
    if (book) {
      historyItems.push({
        id: docSnap.id,
        bookId: data.bookId,
        userId: data.userId,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        percentComplete: data.percentComplete,
        lastReadAt: data.lastReadAt?.toDate() || new Date(),
        book,
      });
    }
  }

  return historyItems;
};

/**
 * Delete reading progress for a book
 */
export const deleteReadingProgress = async (
  userId: string,
  bookId: string
): Promise<void> => {
  const docRef = doc(db, "users", userId, "readingHistory", bookId);
  await setDoc(docRef, { deleted: true }, { merge: true });
};
