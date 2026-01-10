import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  orderBy,
  query,
  where,
  increment,
  writeBatch,
  deleteField,
  DocumentData,
  onSnapshot,
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

export interface AIChatRoom {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  coverUrl?: string;
  lastMessage?: string;
  lastRole?: "user" | "assistant";
  lastMessageAt?: Date;
  messageCount: number;
}

const getChatDocId = (userId: string, bookId: string) => `${userId}_${bookId}`;

const asDate = (value: any): Date | undefined => {
  if (!value) return undefined;
  return value.toDate ? value.toDate() : value;
};

export const getAIChatMessages = async (
  userId: string,
  bookId: string
): Promise<AIChatMessage[]> => {
  const chatId = getChatDocId(userId, bookId);
  const q = query(
    collection(db, "aiChats", chatId, "messages"),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as DocumentData;
    return {
      id: docSnap.id,
      userId: data.userId,
      bookId: data.bookId,
      role: data.role,
      content: data.content,
      createdAt: asDate(data.createdAt) as Date,
    } as AIChatMessage;
  });
};

export const getAIChatRoom = async (
  userId: string,
  bookId: string
): Promise<AIChatRoom | null> => {
  const chatId = getChatDocId(userId, bookId);
  const snapshot = await getDoc(doc(db, "aiChats", chatId));
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as DocumentData;
  return {
    id: snapshot.id,
    userId: data.userId,
    bookId: data.bookId,
    title: data.title ?? "Open Bookstore",
    coverUrl: data.coverUrl,
    lastMessage: data.lastMessage,
    lastRole: data.lastRole,
    lastMessageAt: asDate(data.lastMessageAt),
    messageCount: data.messageCount ?? 0,
  };
};

export const getAIChatRooms = async (
  userId: string
): Promise<AIChatRoom[]> => {
  const q = query(collection(db, "aiChats"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const rooms = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as DocumentData;
    return {
      id: docSnap.id,
      userId: data.userId,
      bookId: data.bookId,
      title: data.title ?? "Open Bookstore",
      coverUrl: data.coverUrl,
      lastMessage: data.lastMessage,
      lastRole: data.lastRole,
      lastMessageAt: asDate(data.lastMessageAt),
      messageCount: data.messageCount ?? 0,
    };
  });
  return rooms.sort(
    (a, b) =>
      (b.lastMessageAt?.getTime() ?? 0) -
      (a.lastMessageAt?.getTime() ?? 0)
  );
};

export const subscribeToAIChatRooms = (
  userId: string,
  onChange: (rooms: AIChatRoom[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(collection(db, "aiChats"), where("userId", "==", userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const rooms = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as DocumentData;
        return {
          id: docSnap.id,
          userId: data.userId,
          bookId: data.bookId,
          title: data.title ?? "Open Bookstore",
          coverUrl: data.coverUrl,
          lastMessage: data.lastMessage,
          lastRole: data.lastRole,
          lastMessageAt: asDate(data.lastMessageAt),
          messageCount: data.messageCount ?? 0,
        };
      });
      const sorted = rooms.sort(
        (a, b) =>
          (b.lastMessageAt?.getTime() ?? 0) -
          (a.lastMessageAt?.getTime() ?? 0)
      );
      onChange(sorted);
    },
    (error) => {
      if (onError) {
        onError(error as Error);
      } else {
        console.error("Chat rooms subscription error:", error);
      }
    }
  );
};

export const addAIChatMessage = async (
  userId: string,
  bookId: string,
  role: "user" | "assistant",
  content: string,
  meta?: { title: string; coverUrl?: string }
): Promise<string> => {
  const chatId = getChatDocId(userId, bookId);
  const docRef = await addDoc(collection(db, "aiChats", chatId, "messages"), {
    userId,
    bookId,
    role,
    content,
    createdAt: new Date(),
  });
  const chatMeta: Record<string, unknown> = {
    userId,
    bookId,
    title: meta?.title ?? "Open Bookstore",
    lastMessage: content,
    lastRole: role,
    lastMessageAt: new Date(),
    messageCount: increment(1),
  };
  if (meta?.coverUrl) {
    chatMeta.coverUrl = meta.coverUrl;
  }
  await setDoc(doc(db, "aiChats", chatId), chatMeta, { merge: true });
  return docRef.id;
};

const deleteChatMessages = async (chatId: string) => {
  const messagesRef = collection(db, "aiChats", chatId, "messages");
  const snapshot = await getDocs(messagesRef);
  const chunkSize = 400;
  for (let i = 0; i < snapshot.docs.length; i += chunkSize) {
    const batch = writeBatch(db);
    snapshot.docs.slice(i, i + chunkSize).forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  }
};

export const clearAIChatMessages = async (
  userId: string,
  bookId: string
): Promise<void> => {
  const chatId = getChatDocId(userId, bookId);
  const chatRef = doc(db, "aiChats", chatId);
  const snapshot = await getDoc(chatRef);
  if (!snapshot.exists()) return;
  await deleteChatMessages(chatId);
  await setDoc(
    chatRef,
    {
      messageCount: 0,
      lastMessage: deleteField(),
      lastRole: deleteField(),
      lastMessageAt: deleteField(),
    },
    { merge: true }
  );
};

export const deleteAIChatRoom = async (
  userId: string,
  bookId: string
): Promise<void> => {
  const chatId = getChatDocId(userId, bookId);
  await deleteChatMessages(chatId);
  await deleteDoc(doc(db, "aiChats", chatId));
};

export const deleteAllAIChatRooms = async (
  userId: string
): Promise<void> => {
  const rooms = await getAIChatRooms(userId);
  for (const room of rooms) {
    await deleteAIChatRoom(userId, room.bookId);
  }
};
