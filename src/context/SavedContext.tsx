import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Book, getSavedBookDetails } from "../services/firestoreService";

export interface SavedItem {
  book: Book;
  quantity: number;
}

interface CartContextType {
  savedItems: SavedItem[];
  addToSaved: (book: Book) => void;
  removeFromSaved: (bookId: string) => void;
  removeMultipleFromSaved: (bookIds: string[]) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearSaved: () => void;
  loadSavedBooks: (userId: string) => Promise<void>;
  totalPrice: number;
  totalItems: number;
}

const SavedContext = createContext<CartContextType | undefined>(undefined);

export const SavedProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  const addToSaved = useCallback((book: Book) => {
    setSavedItems((prev) => {
      const existingItem = prev.find((item) => item.book.id === book.id);
      if (existingItem) {
        return prev.map((item) =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { book, quantity: 1 }];
    });
  }, []);

  const removeFromSaved = useCallback((bookId: string) => {
    setSavedItems((prev) => prev.filter((item) => item.book.id !== bookId));
  }, []);

  const removeMultipleFromSaved = useCallback((bookIds: string[]) => {
    if (bookIds.length === 0) return;
    const ids = new Set(bookIds);
    setSavedItems((prev) => prev.filter((item) => !ids.has(item.book.id)));
  }, []);

  const updateQuantity = useCallback(
    (bookId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromSaved(bookId);
        return;
      }
      setSavedItems((prev) =>
        prev.map((item) =>
          item.book.id === bookId ? { ...item, quantity } : item
        )
      );
    },
    [removeFromSaved]
  );

  const clearSaved = useCallback(() => {
    setSavedItems([]);
  }, []);

  const loadSavedBooks = useCallback(async (userId: string) => {
    const books = await getSavedBookDetails(userId);
    setSavedItems(books.map((book) => ({ book, quantity: 1 })));
  }, []);

  const totalPrice = savedItems.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );

  const totalItems = savedItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SavedContext.Provider
      value={{
        savedItems,
        addToSaved,
        removeFromSaved,
        removeMultipleFromSaved,
        updateQuantity,
        clearSaved,
        loadSavedBooks,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = (): CartContextType => {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
