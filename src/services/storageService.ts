import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system/legacy';
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
  try {
    console.log('uploadPDF - Starting upload');
    console.log('uploadPDF - URI:', uri);
    console.log('uploadPDF - FileName:', fileName);
    console.log('uploadPDF - UserId:', userId);
    
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('uploadPDF - Blob created, size:', blob.size, 'type:', blob.type);
    
    const storageRef = ref(storage, `books/${userId}/${fileName}`);
    console.log('uploadPDF - Storage ref created:', storageRef.fullPath);
    
    const uploadResult = await uploadBytes(storageRef, blob);
    console.log('uploadPDF - Upload complete');
    
    const downloadURL = await getDownloadURL(storageRef);
    console.log('uploadPDF - Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('uploadPDF - Error details:', error);
    if (error instanceof Error) {
      console.error('uploadPDF - Error message:', error.message);
      console.error('uploadPDF - Error stack:', error.stack);
    }
    throw error;
  }
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
