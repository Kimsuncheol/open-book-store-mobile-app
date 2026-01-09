import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  pdfUrl: string;
  price: number;
  category: string;
  rating: number;
  downloads: number;
  createdAt: Date;
  uploadedBy: string;
}

export interface Purchase {
  id: string;
  userId: string;
  bookId: string;
  amount: number;
  paymentId: string;
  purchasedAt: Date;
}

export const getBooks = async (categoryFilter?: string): Promise<Book[]> => {
  let q = query(collection(db, "books"), orderBy("createdAt", "desc"), limit(50));
  if (categoryFilter) {
    q = query(
      collection(db, "books"),
      where("category", "==", categoryFilter),
      orderBy("createdAt", "desc")
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Book));
};

export const getBook = async (bookId: string): Promise<Book | null> => {
  const docRef = doc(db, "books", bookId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Book) : null;
};

export const addBook = async (book: Omit<Book, "id">): Promise<string> => {
  const docRef = doc(collection(db, "books"));
  const bookData = {
    ...book,
    createdAt: book.createdAt || new Date(),
  };
  await setDoc(docRef, bookData);
  return docRef.id;
};

export const getFeaturedBooks = async (): Promise<Book[]> => {
  const q = query(collection(db, "books"), orderBy("downloads", "desc"), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Book));
};

export const getBookCount = async (): Promise<number> => {
  const snapshot = await getDocs(collection(db, "books"));
  return snapshot.size;
};

export const getTotalDownloads = async (): Promise<number> => {
  const snapshot = await getDocs(collection(db, "books"));
  return snapshot.docs.reduce((sum, docSnap) => sum + (docSnap.data().downloads || 0), 0);
};

export const getUserUploadCount = async (userId: string): Promise<number> => {
  const q = query(collection(db, "books"), where("uploadedBy", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.size;
};
