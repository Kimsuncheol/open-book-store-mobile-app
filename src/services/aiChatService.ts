import {
  collection,
  doc,
  getDocs,
  addDoc,
  orderBy,
  query,
  DocumentData,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface AIChatMessage {
  id: string;
  userId: string;
  bookId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const getChatDocId = (userId: string, bookId: string) => `${userId}_${bookId}`;

export const getAIChatMessages = async (
  userId: string,
  bookId: string
): Promise<AIChatMessage[]> => {
  const chatId = getChatDocId(userId, bookId);
  const q = query(collection(db, "aiChats", chatId, "messages"), orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as DocumentData;
    return {
      id: docSnap.id,
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
  role: "user" | "assistant",
  content: string
): Promise<string> => {
  const chatId = getChatDocId(userId, bookId);
  const docRef = await addDoc(collection(db, "aiChats", chatId, "messages"), {
    userId,
    bookId,
    role,
    content,
    createdAt: new Date(),
  });
  return docRef.id;
};
