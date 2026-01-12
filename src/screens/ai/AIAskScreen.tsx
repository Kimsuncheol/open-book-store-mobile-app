import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  VirtualizedList,
  KeyboardAvoidingView,
  Platform,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { askQuestion } from "../../services/aiService";
import {
  addAIChatMessage,
  getAIChatMessagesPaged,
  getAIChatRoom,
  getBook,
  BookAnalysis,
} from "../../services/firestoreService";
import { spacing } from "../../theme/colors";
import type { AIChatRoomScreenProps as Props } from "../../types/navigation";
import { ChatHeader } from "../../components/ai/ChatHeader";
import { ChatMessage } from "../../components/ai/ChatMessage";
import { ChatInputBar } from "../../components/ai/ChatInputBar";
import { TypingIndicator } from "../../components/ai/TypingIndicator";
import { SkeletonChatMessages } from "../../components/ai/SkeletonChatMessages";
import { DateIndicator } from "../../components/ai/DateIndicator";

interface Message {
  id: string;
  role: "user" | "assistant" | "date" | "typing";
  content: string;
  createdAt?: Date;
  date?: string;
}

const formatDateLabel = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  };
  return date.toLocaleDateString("en-US", options);
};

const insertDateSeparators = (messages: Message[]): Message[] => {
  if (messages.length === 0) return messages;

  const result: Message[] = [];

  // Messages are ordered Newest -> Oldest
  messages.forEach((msg, index) => {
    result.push(msg);

    const currentDate = msg.createdAt ? new Date(msg.createdAt) : new Date();
    const nextMsg = messages[index + 1];

    const currentDateLabel = formatDateLabel(currentDate);
    const nextDateLabel = nextMsg?.createdAt
      ? formatDateLabel(new Date(nextMsg.createdAt))
      : null;

    // If the next message (older) has a different date, or doesn't exist (end of list),
    // we insert a date header for the Current message group.
    if (currentDateLabel !== nextDateLabel) {
      result.push({
        id: `date-${currentDateLabel}-${index}`,
        role: "date",
        content: "",
        date: currentDateLabel,
      });
    }
  });

  return result;
};

const SkeletonGate: React.FC<{ released: boolean; enabled: boolean }> = ({
  released,
  enabled,
}) => {
  const promiseRef = useRef<Promise<void> | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled && resolveRef.current) {
      resolveRef.current();
      resolveRef.current = null;
      promiseRef.current = null;
      return;
    }
    if (released && resolveRef.current) {
      resolveRef.current();
      resolveRef.current = null;
      promiseRef.current = null;
    }
  }, [enabled, released]);

  if (!enabled) {
    return null;
  }

  if (!released) {
    if (!promiseRef.current) {
      promiseRef.current = new Promise<void>((resolve) => {
        resolveRef.current = resolve;
      });
    }
    throw promiseRef.current;
  }

  return null;
};

export const AIAskScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const bookId = route.params?.bookId || "general";
  const title = route.params?.title || t("aiAsk.generalTitle");
  const { user } = useAuth();
  const userId = user?.uid || "guest";
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: t("aiAsk.intro", { title }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyFlagReady, setHistoryFlagReady] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [skeletonReleased, setSkeletonReleased] = useState(false);
  const [bookAnalysis, setBookAnalysis] = useState<BookAnalysis | undefined>(
    undefined
  );
  const [bookCoverUrl, setBookCoverUrl] = useState<string | undefined>(
    undefined
  );
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // ... (deps)

  // const listRef = useRef<FlatList>(null); // Removed unused ref
  const isLoadingMoreRef = useRef(false);

  const styles = createStyles(colors);
  // Removed skeleton logic

  useEffect(() => {
    isLoadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  // Removed historyLoading effect and scroll logic

  useEffect(() => {
    let isMounted = true;

    // Initial fetch
    setBookCoverUrl(route.params?.coverUrl);

    // Default welcome message
    const welcomeMsg: Message = {
      id: "0",
      role: "assistant",
      content: t("aiAsk.intro", { title }),
      createdAt: new Date(),
    };

    // Start with strictly the welcome message if no history yet?
    // Actually we fetch history. If history exists, we show it.
    // If empty history, show welcome.

    const loadMessages = async () => {
      try {
        const { messages: history, lastVisible: last } =
          await getAIChatMessagesPaged(userId, bookId, 20);
        if (!isMounted) return;

        setLastVisible(last);
        setHasMoreMessages(history.length >= 20);

        if (history.length > 0) {
          // history is [Oldest, ..., Newest] from service
          // We want [Newest, ..., Oldest]
          const reversedHistory = [...history].reverse();

          setMessages(
            reversedHistory.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              createdAt: msg.createdAt,
            }))
          );
        } else {
          setMessages([welcomeMsg]);
        }
      } catch {
        if (isMounted) setMessages([welcomeMsg]);
      }
    };
    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [bookId, route.params?.messageCount, userId, title]);

  // Removed timeout effect for skeleton release
  // Removed explicit room check for skeleton

  // ... (keep book analysis effect)

  const handleLoadMore = async () => {
    if (loadingMore || !hasMoreMessages || !lastVisible) return;

    setLoadingMore(true);
    try {
      const { messages: olderMessages, lastVisible: nextLast } =
        await getAIChatMessagesPaged(userId, bookId, 20, lastVisible);

      if (olderMessages.length < 20) {
        setHasMoreMessages(false);
      }

      setLastVisible(nextLast);

      if (olderMessages.length > 0) {
        // olderMessages is [Oldest ... Older] (chronological subset)
        // We want to append them as [Older ... Oldest] to the end of our Newest->Oldest list.
        const reversedOlder = [...olderMessages].reverse();

        setMessages((prev) => [
          ...prev,
          ...reversedOlder.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
          })),
        ]);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };
    // Newest messages at START of array for inverted list
    setMessages((prev) => [userMsg, ...prev]);
    addAIChatMessage(userId, bookId, "user", userMsg.content, {
      title,
      coverUrl: bookCoverUrl,
    }).catch(() => undefined);
    setInput("");
    setLoading(true);

    try {
      const response = await askQuestion(
        bookId,
        userMsg.content,
        title === "Open Bookstore"
          ? "General Assistant"
          : `Content from ${title}`,
        bookAnalysis
      );
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        createdAt: new Date(),
      };
      setMessages((prev) => [aiMsg, ...prev]);
      addAIChatMessage(userId, bookId, "assistant", response, {
        title,
        coverUrl: bookCoverUrl,
      }).catch(() => undefined);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("aiAsk.error"),
        createdAt: new Date(),
      };
      setMessages((prev) => [errorMsg, ...prev]);
    }
    setLoading(false);
  };

  // Removed scroll handlers

  // Prepare data for inverted list
  // The 'messages' state should store [newest, ..., oldest]
  // BUT the current state seems to store [oldest, ..., newest] based on existing logic.
  // Wait, let's fix state management.
  // Logic:
  // - Initial load: fetches newest 20. Store as [oldest ... newest]?
  // No, valid inverted list usually wants [newest ... oldest].
  // Let's refactor setMessages usage entirely.

  // Actually, to minimize diff risk, I will keep messages as [oldest, ..., newest]
  // and just reverse them in the render prop + handle new messages by appending?
  // Inverted list takes data[0] as bottom-most.
  // So data needs to be [newest, ..., oldest].
  //
  // REFACTOR STRATEGY:
  // 1. messages state will store [newest, ..., oldest].
  // 2. Initial load: gets newest 20 (paged). API likely returns [oldest ... newest]?
  //    Check getAIChatMessagesPaged. Usually firestore returns ordered queries.
  //    If it returns [oldest, ..., newest] (chronological), we need to reverse it.

  // Let's check `insertDateSeparators`. It iterates and inserts. Expects chrono order?
  // `insertDateSeparators` iterates, checks date diff.
  // If we pass reversed array, date separators logic might break.
  // BETTER IDEA:
  // Keep `messages` state as [oldest, ..., newest] (CHRONOLOGICAL).
  // Render: `data={[...insertDateSeparators(messages)].reverse()}`
  // Let's stick to that for minimal logic change.

  // No need to reverse result. messages is [Newest...Oldest]
  // We prepend Typing indicator if loading.
  // In Inverted list (0=Bottom), Typing indicator should be at Bottom (Index 0).
  // So data = [Typing, Newest, ..., Oldest]

  const renderMessages = loading
    ? [
        { id: "typing", role: "typing" as const },
        ...insertDateSeparators(messages),
      ]
    : insertDateSeparators(messages);

  const getItem = (data: Message[], index: number) => data[index];
  const getItemCount = (data: Message[]) => data.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 30}
      >
        <ChatHeader
          onMenuPress={() => navigation.navigate("AIAskMain")}
          menuLabel={t("aiAsk.menuListTitle")}
          title={t("aiAsk.title")}
          subtitle={title}
          colors={colors}
        />

        <View style={styles.listContainer}>
          <VirtualizedList
            // ref={listRef} // VirtualizedList ref type mismatch with FlatList ref if we kept it.
            data={renderMessages}
            getItem={getItem}
            getItemCount={getItemCount}
            keyExtractor={(item: Message) => item.id}
            inverted
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={5}
            ListFooterComponent={
              // Top of screen in inverted
              loadingMore ? (
                <View style={{ padding: 10 }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : null
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.messages}
            renderItem={({ item }: { item: Message }) => {
              if (item.role === "typing") {
                return <TypingIndicator colors={colors} />;
              }
              if (item.role === "date") {
                return <DateIndicator date={item.date || ""} colors={colors} />;
              }
              return <ChatMessage message={item as any} colors={colors} />;
            }}
          />
        </View>

        <ChatInputBar
          value={input}
          onChangeText={setInput}
          onSend={handleSend}
          placeholder={t("aiAsk.placeholder")}
          loading={loading}
          colors={colors}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
// ... styles
const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    listContainer: {
      flex: 1,
    },
    messages: {
      padding: spacing.md,
    },
  });
