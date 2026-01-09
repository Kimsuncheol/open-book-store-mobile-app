import { Book } from "../services/firestoreService";

export interface BookList {
  id: string;
  name: string;
  createdAt: Date;
  bookIds: string[];
  userId: string;
}

export interface BookListWithBooks extends BookList {
  books: Book[];
}
