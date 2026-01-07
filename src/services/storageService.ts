import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import { storage } from '../config/firebase';

// Get the documents directory path
const getDocumentsDir = (): string => {
  // @ts-ignore - documentDirectory exists at runtime
  return (FileSystem.documentDirectory || '') as string;
};

const BOOKS_DIR = () => `${getDocumentsDir()}books/`;

// Upload PDF to Firebase Storage
export const uploadPDF = async (
  uri: string,
  fileName: string,
  userId: string
): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `books/${userId}/${fileName}`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
};

// Download PDF to local storage
export const downloadPDF = async (
  url: string,
  bookId: string
): Promise<string> => {
  const booksDir = BOOKS_DIR();
  const localPath = `${booksDir}${bookId}.pdf`;
  
  // Ensure directory exists
  const dirInfo = await FileSystem.getInfoAsync(booksDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
  }

  const downloadResult = await FileSystem.downloadAsync(url, localPath);
  return downloadResult.uri;
};

// Check if book is downloaded
export const isBookDownloaded = async (bookId: string): Promise<boolean> => {
  const localPath = `${BOOKS_DIR()}${bookId}.pdf`;
  const info = await FileSystem.getInfoAsync(localPath);
  return info.exists;
};

// Get local path for book
export const getLocalBookPath = (bookId: string): string => {
  return `${BOOKS_DIR()}${bookId}.pdf`;
};

// Delete downloaded book
export const deleteDownloadedBook = async (bookId: string): Promise<void> => {
  const localPath = `${BOOKS_DIR()}${bookId}.pdf`;
  const info = await FileSystem.getInfoAsync(localPath);
  if (info.exists) {
    await FileSystem.deleteAsync(localPath);
  }
};

// Get all downloaded books
export const getDownloadedBooks = async (): Promise<string[]> => {
  const booksDir = BOOKS_DIR();
  const dirInfo = await FileSystem.getInfoAsync(booksDir);
  if (!dirInfo.exists) return [];
  
  const files = await FileSystem.readDirectoryAsync(booksDir);
  return files.filter(f => f.endsWith('.pdf')).map(f => f.replace('.pdf', ''));
};
