import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
}

interface ReviewsContextType {
  getBookReviews: (bookId: string) => Review[];
  getUserReview: (bookId: string, userId: string) => Review | undefined;
  getAverageRating: (bookId: string) => number;
  addReview: (review: Omit<Review, "id" | "date" | "helpful">) => void;
  updateReview: (
    reviewId: string,
    updates: Partial<Pick<Review, "rating" | "text">>
  ) => void;
  deleteReview: (reviewId: string) => void;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

// Mock initial reviews for testing
const initialReviews: Review[] = [
  {
    id: "r1",
    bookId: "1",
    userId: "user1",
    userName: "John D.",
    rating: 5,
    text: "Absolutely loved this book! The concepts are explained clearly and the examples are practical.",
    date: "2026-01-05",
    helpful: 12,
  },
  {
    id: "r2",
    bookId: "1",
    userId: "user2",
    userName: "Sarah M.",
    rating: 4,
    text: "Great read overall. Some chapters could use more depth, but I learned a lot.",
    date: "2026-01-03",
    helpful: 8,
  },
  {
    id: "r3",
    bookId: "1",
    userId: "user3",
    userName: "Mike R.",
    rating: 3,
    text: "Decent book but nothing groundbreaking. Worth reading if you are new to the topic.",
    date: "2026-01-01",
    helpful: 3,
  },
];

export const ReviewsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const getBookReviews = (bookId: string): Review[] => {
    return reviews
      .filter((r) => r.bookId === bookId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getUserReview = (
    bookId: string,
    userId: string
  ): Review | undefined => {
    return reviews.find((r) => r.bookId === bookId && r.userId === userId);
  };

  const getAverageRating = (bookId: string): number => {
    const bookReviews = getBookReviews(bookId);
    if (bookReviews.length === 0) return 0;
    const sum = bookReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / bookReviews.length;
  };

  const addReview = (review: Omit<Review, "id" | "date" | "helpful">) => {
    const newReview: Review = {
      ...review,
      id: `r${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      helpful: 0,
    };
    setReviews((prev) => [...prev, newReview]);
  };

  const updateReview = (
    reviewId: string,
    updates: Partial<Pick<Review, "rating" | "text">>
  ) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, ...updates } : r))
    );
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  return (
    <ReviewsContext.Provider
      value={{
        getBookReviews,
        getUserReview,
        getAverageRating,
        addReview,
        updateReview,
        deleteReview,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = (): ReviewsContextType => {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewsProvider");
  return ctx;
};
