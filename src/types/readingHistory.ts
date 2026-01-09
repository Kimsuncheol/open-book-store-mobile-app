import { Book } from "../services/firestoreService";

export interface ReadingProgress {
  id: string;
  bookId: string;
  userId: string;
  currentPage: number;
  totalPages: number;
  lastReadAt: Date;
  percentComplete: number;
}

export interface ReadingHistoryItem extends ReadingProgress {
  book: Book;
}
