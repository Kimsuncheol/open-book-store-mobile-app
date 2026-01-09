import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { BookList, BookListWithBooks } from "../types/lists";
import { Book, getBook } from "./booksService";

/**
 * Create a new list for a user
 */
export const createList = async (
  userId: string,
  listName: string
): Promise<string> => {
  const docRef = doc(collection(db, "users", userId, "lists"));
  const listData: Omit<BookList, "id"> = {
    name: listName,
    createdAt: new Date(),
    bookIds: [],
    userId,
  };
  await setDoc(docRef, listData);
  return docRef.id;
};

/**
 * Get all lists for a user
 */
export const getUserLists = async (userId: string): Promise<BookList[]> => {
  const q = query(
    collection(db, "users", userId, "lists"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate() || new Date(),
  })) as BookList[];
};

/**
 * Add a book to a list
 */
export const addBookToList = async (
  userId: string,
  listId: string,
  bookId: string
): Promise<void> => {
  const docRef = doc(db, "users", userId, "lists", listId);
  await updateDoc(docRef, {
    bookIds: arrayUnion(bookId),
  });
};

/**
 * Remove a book from a list
 */
export const removeBookFromList = async (
  userId: string,
  listId: string,
  bookId: string
): Promise<void> => {
  const docRef = doc(db, "users", userId, "lists", listId);
  await updateDoc(docRef, {
    bookIds: arrayRemove(bookId),
  });
};

/**
 * Delete a list
 */
export const deleteList = async (
  userId: string,
  listId: string
): Promise<void> => {
  const docRef = doc(db, "users", userId, "lists", listId);
  await deleteDoc(docRef);
};

/**
 * Get a list with populated book data
 */
export const getListWithBooks = async (
  userId: string,
  listId: string
): Promise<BookListWithBooks | null> => {
  const docRef = doc(db, "users", userId, "lists", listId);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    return null;
  }

  const listData = {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate() || new Date(),
  } as BookList;

  // Fetch all books in the list
  const books: Book[] = [];
  for (const bookId of listData.bookIds) {
    const book = await getBook(bookId);
    if (book) {
      books.push(book);
    }
  }

  return {
    ...listData,
    books,
  };
};

/**
 * Rename a list
 */
export const renameList = async (
  userId: string,
  listId: string,
  newName: string
): Promise<void> => {
  const docRef = doc(db, "users", userId, "lists", listId);
  await updateDoc(docRef, {
    name: newName,
  });
};
