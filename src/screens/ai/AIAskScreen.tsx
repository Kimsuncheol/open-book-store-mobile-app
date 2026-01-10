import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { askQuestion } from "../../services/aiService";
import {
  addAIChatMessage,
  getAIChatMessagesPage,
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
  let lastDate: string | null = null;

  messages.forEach((msg, index) => {
    if (msg.createdAt) {
      const msgDate = new Date(msg.createdAt);
      const dateLabel = formatDateLabel(msgDate);

      if (dateLabel !== lastDate) {
        result.push({
          id: `date-${index}`,
          role: "date",
          content: "",
          date: dateLabel,
        });
        lastDate = dateLabel;
      }
    }
    result.push(msg);
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
  const [historyCursor, setHistoryCursor] = useState<any>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [bookAnalysis, setBookAnalysis] = useState<BookAnalysis | undefined>(
    undefined
  );
  const [bookCoverUrl, setBookCoverUrl] = useState<string | undefined>(
    undefined
  );
  const listRef = useRef<FlatList>(null);
  const listLayoutHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const autoScrollInProgressRef = useRef(false);
  const initialScrollTriggeredRef = useRef(false);
  const historyLoadingRef = useRef(true);
  const prependInProgressRef = useRef(false);
  const pageSize = 20;

  const styles = createStyles(colors);
  const skeletonFallback = <SkeletonChatMessages colors={colors} />;

  useEffect(() => {
    historyLoadingRef.current = historyLoading;
  }, [historyLoading]);

  useEffect(() => {
    let isMounted = true;
    const initialCount = route.params?.messageCount;
    const hasHistory =
      typeof initialCount === "number" ? initialCount > 0 : false;
    setShowSkeleton(hasHistory);
    setHistoryFlagReady(typeof initialCount === "number");
    setHistoryLoading(true);
    setInitialScrollDone(false);
    setSkeletonReleased(false);
    setHistoryCursor(null);
    setHasMoreHistory(true);
    setLoadingOlder(false);
    setBookCoverUrl(route.params?.coverUrl);
    setMessages([
      {
        id: "0",
        role: "assistant",
        content: t("aiAsk.intro", { title }),
      },
    ]);
    listLayoutHeightRef.current = 0;
    contentHeightRef.current = 0;
    autoScrollInProgressRef.current = false;
    initialScrollTriggeredRef.current = false;
    const loadMessages = async () => {
      try {
        const { messages: history, nextCursor } = await getAIChatMessagesPage(
          userId,
          bookId,
          pageSize
        );
        if (!isMounted) return;
        if (history.length > 0) {
          setMessages(
            history.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              createdAt: msg.createdAt,
            }))
          );
          setHistoryCursor(nextCursor);
          setHasMoreHistory(history.length === pageSize);
        } else {
          setHasMoreHistory(false);
        }
      } catch {
        // Ignore load errors to keep the chat usable
      } finally {
        if (isMounted) setHistoryLoading(false);
      }
    };
    loadMessages();
    return () => {
      isMounted = false;
    };
  }, [bookId, route.params?.messageCount, userId]);

  useEffect(() => {
    if (
      historyLoading ||
      !initialScrollDone ||
      skeletonReleased ||
      !showSkeleton
    ) {
      return;
    }
    const timer = setTimeout(() => {
      setSkeletonReleased(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [historyLoading, initialScrollDone, skeletonReleased, showSkeleton]);

  useEffect(() => {
    let isMounted = true;
    if (historyFlagReady || !historyLoading) return undefined;
    const loadChatRoom = async () => {
      try {
        const room = await getAIChatRoom(userId, bookId);
        if (!isMounted || !historyLoadingRef.current) return;
        const hasHistory = (room?.messageCount ?? 0) > 0;
        setShowSkeleton(hasHistory);
      } catch {
        // Ignore room lookup errors
      } finally {
        if (isMounted && historyLoadingRef.current) {
          setHistoryFlagReady(true);
        }
      }
    };
    loadChatRoom();
    return () => {
      isMounted = false;
    };
  }, [bookId, historyFlagReady, historyLoading, userId]);

  // Fetch book analysis for context
  useEffect(() => {
    if (bookId === "general") return;
    const fetchBookAnalysis = async () => {
      try {
        const book = await getBook(bookId);
        if (book?.analyze) {
          setBookAnalysis(book.analyze);
        }
        setBookCoverUrl(book?.coverUrl ?? route.params?.coverUrl);
      } catch (error) {
        console.error("Error fetching book analysis:", error);
      }
    };
    fetchBookAnalysis();
  }, [bookId]);

  const loadOlderMessages = useCallback(async () => {
    if (!hasMoreHistory || loadingOlder || !historyCursor) return;
    prependInProgressRef.current = true;
    setLoadingOlder(true);
    try {
      const { messages: older, nextCursor } = await getAIChatMessagesPage(
        userId,
        bookId,
        pageSize,
        historyCursor
      );
      if (older.length > 0) {
        setMessages((prev) => [
          ...older.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
          })),
          ...prev,
        ]);
        setHistoryCursor(nextCursor);
        if (!nextCursor || older.length < pageSize) {
          setHasMoreHistory(false);
        }
      } else {
        setHasMoreHistory(false);
      }
    } catch (error) {
      console.error("Failed to load older messages:", error);
    } finally {
      setLoadingOlder(false);
      prependInProgressRef.current = false;
    }
  }, [bookId, hasMoreHistory, historyCursor, loadingOlder, pageSize, userId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
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
      setMessages((prev) => [...prev, aiMsg]);
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
      setMessages((prev) => [...prev, errorMsg]);
    }
    setLoading(false);
  };

  const maybeCompleteInitialScroll = (contentHeight: number) => {
    const layoutHeight = listLayoutHeightRef.current;
    if (layoutHeight > 0 && contentHeight <= layoutHeight + spacing.sm) {
      autoScrollInProgressRef.current = false;
      setInitialScrollDone(true);
      return true;
    }
    return false;
  };

  const handleListLayout = (event: LayoutChangeEvent) => {
    listLayoutHeightRef.current = event.nativeEvent.layout.height;
    if (
      !historyLoading &&
      initialScrollTriggeredRef.current &&
      !initialScrollDone
    ) {
      maybeCompleteInitialScroll(contentHeightRef.current);
    }
  };

  const handleContentSizeChange = (_width: number, height: number) => {
    contentHeightRef.current = height;
    if (historyLoading || loadingOlder || prependInProgressRef.current) return;
    listRef.current?.scrollToEnd({ animated: true });
    if (!initialScrollTriggeredRef.current) {
      initialScrollTriggeredRef.current = true;
      if (!maybeCompleteInitialScroll(height)) {
        autoScrollInProgressRef.current = true;
      }
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (
      !historyLoading &&
      contentOffset.y <= spacing.sm &&
      hasMoreHistory &&
      !loadingOlder
    ) {
      loadOlderMessages();
    }

    if (!autoScrollInProgressRef.current || initialScrollDone) return;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - spacing.sm
    ) {
      autoScrollInProgressRef.current = false;
      setInitialScrollDone(true);
    }
  };

  // Return the main view - don't include bottom edge since tab navigator handles it
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 30}
      >
        <ChatHeader
          onBack={() => navigation.goBack()}
          onMenuPress={() => navigation.navigate("AIAskMain")}
          menuLabel={t("aiAsk.menuListTitle")}
          title={t("aiAsk.title")}
          subtitle={title}
          colors={colors}
        />

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            data={
              loading
                ? [
                    ...insertDateSeparators(messages),
                    { id: "typing", role: "typing" as const },
                  ]
                : insertDateSeparators(messages)
            }
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.messages}
            maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
            onLayout={handleListLayout}
            onContentSizeChange={handleContentSizeChange}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => {
              if (item.role === "typing") {
                return <TypingIndicator colors={colors} />;
              }
              if (item.role === "date") {
                return <DateIndicator date={item.date || ""} colors={colors} />;
              }
              return <ChatMessage message={item} colors={colors} />;
            }}
          />
          <React.Suspense fallback={skeletonFallback}>
            <SkeletonGate released={skeletonReleased} enabled={showSkeleton} />
          </React.Suspense>
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
