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
  addDoc,
  increment,
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

// AI chat message
export interface AIChatMessage {
  id: string;
  userId: string;
  bookId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
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
  // Ensure createdAt is a Firestore Timestamp if it's a Date
  const bookData = {
    ...book,
    createdAt: book.createdAt || new Date(),
  };
  await setDoc(docRef, bookData);
  return docRef.id;
};

// Get featured books
export const getFeaturedBooks = async (): Promise<Book[]> => {
  const q = query(collection(db, 'books'), orderBy('downloads', 'desc'), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
};

export const getBookCount = async (): Promise<number> => {
  const snapshot = await getDocs(collection(db, 'books'));
  return snapshot.size;
};

export const getTotalDownloads = async (): Promise<number> => {
  const snapshot = await getDocs(collection(db, 'books'));
  return snapshot.docs.reduce((sum, doc) => sum + (doc.data().downloads || 0), 0);
};

export const getUserUploadCount = async (userId: string): Promise<number> => {
  const q = query(collection(db, 'books'), where('uploadedBy', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.size;
};

export const incrementUserDownloads = async (userId: string, amount = 1): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    await setDoc(docRef, { downloads: 0 }, { merge: true });
  }
  await updateDoc(docRef, { downloads: increment(amount) });
};

export const decrementUserDownloads = async (userId: string): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    await setDoc(docRef, { downloads: 0 }, { merge: true });
  }
  await updateDoc(docRef, { downloads: increment(-1) });
};

export const addUserDownload = async (userId: string, bookId: string): Promise<void> => {
  const docRef = doc(db, 'downloads', userId, 'downloads', bookId);
  await setDoc(docRef, { bookId, downloadedAt: new Date() }, { merge: true });
};

export const getUserDownloadCount = async (userId: string): Promise<number> => {
  const docRef = doc(db, 'users', userId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return 0;
  const data = snapshot.data() as DocumentData;
  return typeof data.downloads === 'number' ? data.downloads : 0;
};

export const removeUserDownload = async (userId: string, bookId: string): Promise<void> => {
  const docRef = doc(db, 'downloads', userId, 'downloads', bookId);
  await deleteDoc(docRef);
};

// Add Saved Book
export const addSavedBook = async (bookId: string, userId: string): Promise<void> => {
  const docRef = doc(db, 'savedBooks', userId, 'savedBooks', bookId);
  await setDoc(docRef, { bookId });
};

// Get saved books
export const getSavedBooks = async (userId: string): Promise<string[]> => {
  const q = query(collection(db, 'savedBooks', userId, 'savedBooks'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().bookId as string);
};

export const getSavedBookDetails = async (userId: string): Promise<Book[]> => {
  const bookIds = await getSavedBooks(userId);
  const bookDocs = await Promise.all(bookIds.map((id) => getBook(id)));
  return bookDocs.filter((book): book is Book => !!book);
};

// Remove saved book
export const removeSavedBook = async (bookId: string, userId: string): Promise<void> => {
  const docRef = doc(db, 'savedBooks', userId, 'savedBooks', bookId);
  await deleteDoc(docRef);
};

// Check if book is saved
export const isBookSaved = async (bookId: string, userId: string): Promise<boolean> => {
  const docRef = doc(db, 'savedBooks', userId, 'savedBooks', bookId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists();
};

// AI chat helpers
const getChatDocId = (userId: string, bookId: string) => `${userId}_${bookId}`;

export const getAIChatMessages = async (
  userId: string,
  bookId: string
): Promise<AIChatMessage[]> => {
  const chatId = getChatDocId(userId, bookId);
  const q = query(collection(db, 'aiChats', chatId, 'messages'), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      userId: data.userId,
      bookId: data.bookId,
      role: data.role,
      content: data.content,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
    } as AIChatMessage;
  });
};

export const addAIChatMessage = async (
  userId: string,
  bookId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<string> => {
  const chatId = getChatDocId(userId, bookId);
  const docRef = await addDoc(collection(db, 'aiChats', chatId, 'messages'), {
    userId,
    bookId,
    role,
    content,
    createdAt: new Date(),
  });
  return docRef.id;
};

export const clearAIChatMessages = async (userId: string, bookId: string): Promise<void> => {
  const chatId = getChatDocId(userId, bookId);
  const q = query(collection(db, 'aiChats', chatId, 'messages'));
  const snapshot = await getDocs(q);
  await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(doc(db, 'aiChats', chatId, 'messages', docSnap.id))));
};
