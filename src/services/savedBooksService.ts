import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Book, getBook } from "./booksService";

export const addSavedBook = async (bookId: string, userId: string): Promise<void> => {
  const docRef = doc(db, "savedBooks", userId, "savedBooks", bookId);
  await setDoc(docRef, { bookId });
};

export const getSavedBooks = async (userId: string): Promise<string[]> => {
  const q = query(collection(db, "savedBooks", userId, "savedBooks"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => docSnap.data().bookId as string);
};

export const getSavedBookDetails = async (userId: string): Promise<Book[]> => {
  const bookIds = await getSavedBooks(userId);
  const bookDocs = await Promise.all(bookIds.map((id) => getBook(id)));
  return bookDocs.filter((book): book is Book => !!book);
};

export const removeSavedBook = async (bookId: string, userId: string): Promise<void> => {
  const docRef = doc(db, "savedBooks", userId, "savedBooks", bookId);
  await deleteDoc(docRef);
};

export const removeSavedBooks = async (
  bookIds: string[],
  userId: string
): Promise<void> => {
  if (bookIds.length === 0) return;
  const batch = writeBatch(db);
  bookIds.forEach((bookId) => {
    const docRef = doc(db, "savedBooks", userId, "savedBooks", bookId);
    batch.delete(docRef);
  });
  await batch.commit();
};

export const isBookSaved = async (bookId: string, userId: string): Promise<boolean> => {
  const docRef = doc(db, "savedBooks", userId, "savedBooks", bookId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists();
};
