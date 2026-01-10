import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { askQuestion } from "../../services/aiService";
import {
  addAIChatMessage,
  getAIChatMessages,
  getBook,
  BookAnalysis,
} from "../../services/firestoreService";
import { Shimmer } from "../../components/Shimmer";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { AIAskScreenProps as Props } from "../../types/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SkeletonGate: React.FC<{ released: boolean }> = ({ released }) => {
  const promiseRef = useRef<Promise<void> | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (released && resolveRef.current) {
      resolveRef.current();
      resolveRef.current = null;
      promiseRef.current = null;
    }
  }, [released]);

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
  const bookId = route.params?.bookId || "general";
  const title = route.params?.title || "Open Bookstore";
  const { colors } = useTheme();
  const { t } = useLanguage();
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
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [skeletonReleased, setSkeletonReleased] = useState(false);
  const [bookAnalysis, setBookAnalysis] = useState<BookAnalysis | undefined>(
    undefined
  );
  const listRef = useRef<FlatList>(null);
  const listLayoutHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const autoScrollInProgressRef = useRef(false);
  const initialScrollTriggeredRef = useRef(false);

  const styles = createStyles(colors);
  const skeletonFallback = (
    <View style={styles.skeletonOverlay}>
      <View style={styles.messages}>
        <View style={styles.msgRow}>
          <Shimmer style={styles.avatarSkeleton} />
          <Shimmer
            style={[styles.skeletonBubble, styles.skeletonBubbleAi]}
          />
        </View>
        <View style={[styles.msgRow, styles.msgRowUser]}>
          <Shimmer
            style={[styles.skeletonBubble, styles.skeletonBubbleUser]}
          />
        </View>
        <View style={styles.msgRow}>
          <Shimmer style={styles.avatarSkeleton} />
          <Shimmer
            style={[styles.skeletonBubble, styles.skeletonBubbleAi]}
          />
        </View>
      </View>
    </View>
  );

  useEffect(() => {
    let isMounted = true;
    setHistoryLoading(true);
    setInitialScrollDone(false);
    setSkeletonReleased(false);
    listLayoutHeightRef.current = 0;
    contentHeightRef.current = 0;
    autoScrollInProgressRef.current = false;
    initialScrollTriggeredRef.current = false;
    const loadMessages = async () => {
      try {
        const history = await getAIChatMessages(userId, bookId);
        if (!isMounted) return;
        if (history.length > 0) {
          setMessages(
            history.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
            }))
          );
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
  }, [bookId, userId]);

  useEffect(() => {
    if (historyLoading || !initialScrollDone || skeletonReleased) return;
    const timer = setTimeout(() => {
      setSkeletonReleased(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [historyLoading, initialScrollDone, skeletonReleased]);

  // Fetch book analysis for context
  useEffect(() => {
    if (bookId === "general") return;
    const fetchBookAnalysis = async () => {
      try {
        const book = await getBook(bookId);
        if (book?.analyze) {
          setBookAnalysis(book.analyze);
        }
      } catch (error) {
        console.error("Error fetching book analysis:", error);
      }
    };
    fetchBookAnalysis();
  }, [bookId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    addAIChatMessage(userId, bookId, "user", userMsg.content).catch(
      () => undefined
    );
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
      };
      setMessages((prev) => [...prev, aiMsg]);
      addAIChatMessage(userId, bookId, "assistant", response).catch(
        () => undefined
      );
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("aiAsk.error"),
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
    if (historyLoading) return;
    listRef.current?.scrollToEnd({ animated: true });
    if (!initialScrollTriggeredRef.current) {
      initialScrollTriggeredRef.current = true;
      if (!maybeCompleteInitialScroll(height)) {
        autoScrollInProgressRef.current = true;
      }
    }
  };

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (!autoScrollInProgressRef.current || initialScrollDone) return;
    const { layoutMeasurement, contentOffset, contentSize } =
      event.nativeEvent;
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{t("aiAsk.title")}</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.messages}
            onLayout={handleListLayout}
            onContentSizeChange={handleContentSizeChange}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.msgRow,
                  item.role === "user" && styles.msgRowUser,
                ]}
              >
                {item.role === "assistant" && (
                  <View style={styles.avatar}>
                    <Ionicons
                      name="sparkles"
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    item.role === "user" ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      item.role === "user" && styles.userText,
                    ]}
                  >
                    {item.content}
                  </Text>
                </View>
              </View>
            )}
          />
          <React.Suspense fallback={skeletonFallback}>
            <SkeletonGate released={skeletonReleased} />
          </React.Suspense>
        </View>

        {/* Typing indicator */}
        {loading && (
          <View style={[styles.msgRow, styles.typingRow]}>
            <View style={styles.avatar}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
            <Shimmer
              style={[
                styles.skeletonBubble,
                styles.skeletonBubbleAi,
                styles.typingBubble,
              ]}
            />
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={t("aiAsk.placeholder")}
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
          >
            <Ionicons
              name="send"
              size={20}
              color={input.trim() ? colors.textLight : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
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
    content: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerInfo: { flex: 1, marginLeft: spacing.md },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    headerSubtitle: { ...typography.caption, color: colors.textMuted },
    listContainer: { flex: 1 },
    messages: { padding: spacing.md },
    msgRow: { flexDirection: "row", marginBottom: spacing.md },
    msgRowUser: { justifyContent: "flex-end" },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    avatarSkeleton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.border,
      marginRight: spacing.sm,
    },
    bubble: {
      maxWidth: "75%",
      padding: spacing.md,
      borderRadius: borderRadius.lg,
    },
    userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    aiBubble: { backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
    msgText: { ...typography.body, color: colors.textPrimary },
    userText: { color: colors.textLight },
    skeletonBubble: {
      height: 44,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.border,
    },
    skeletonBubbleUser: {
      width: "60%",
    },
    skeletonBubbleAi: {
      width: "75%",
    },
    typingRow: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    typingBubble: {
      height: 32,
    },
    skeletonOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background,
      zIndex: 1,
    },
    inputBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      maxHeight: 100,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: spacing.sm,
    },
    sendBtnDisabled: { backgroundColor: colors.border },
  });
