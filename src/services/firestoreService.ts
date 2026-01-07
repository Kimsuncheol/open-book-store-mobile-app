import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Book interface
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

// User purchase
export interface Purchase {
  id: string;
  userId: string;
  bookId: string;
  amount: number;
  paymentId: string;
  purchasedAt: Date;
}

// Get all books
export const getBooks = async (categoryFilter?: string): Promise<Book[]> => {
  let q = query(collection(db, 'books'), orderBy('createdAt', 'desc'), limit(50));
  if (categoryFilter) {
    q = query(collection(db, 'books'), where('category', '==', categoryFilter), orderBy('createdAt', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
};

// Get single book
export const getBook = async (bookId: string): Promise<Book | null> => {
  const docRef = doc(db, 'books', bookId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Book : null;
};

// Add book (for uploads)
export const addBook = async (book: Omit<Book, 'id'>): Promise<string> => {
  const docRef = doc(collection(db, 'books'));
  await setDoc(docRef, { ...book, createdAt: new Date() });
  return docRef.id;
};

// Get featured books
export const getFeaturedBooks = async (): Promise<Book[]> => {
  const q = query(collection(db, 'books'), orderBy('downloads', 'desc'), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
};

// Get user purchases
export const getUserPurchases = async (userId: string): Promise<Purchase[]> => {
  const q = query(collection(db, 'purchases'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
};

// Add purchase
export const addPurchase = async (purchase: Omit<Purchase, 'id'>): Promise<string> => {
  const docRef = doc(collection(db, 'purchases'));
  await setDoc(docRef, { ...purchase, purchasedAt: new Date() });
  return docRef.id;
};

// Check if user purchased book
export const hasPurchased = async (userId: string, bookId: string): Promise<boolean> => {
  const q = query(collection(db, 'purchases'), where('userId', '==', userId), where('bookId', '==', bookId));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// Get categories
export const getCategories = async (): Promise<string[]> => {
  const snapshot = await getDocs(collection(db, 'categories'));
  return snapshot.docs.map(doc => doc.data().name as string);
};
