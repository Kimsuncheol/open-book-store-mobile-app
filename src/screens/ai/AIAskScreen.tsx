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
} from "../../services/firestoreService";
import { Shimmer } from "../../components/Shimmer";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { AIAskScreenProps as Props } from "../../types/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

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
  const listRef = useRef<FlatList>(null);

  const styles = createStyles(colors);

  useEffect(() => {
    let isMounted = true;
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
          : `Content from ${title}`
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

  // Return the main view with safe area insets
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
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

        <FlatList
          ref={listRef}
          data={
            historyLoading && messages.length === 1
              ? [
                  { id: "s-1", role: "assistant", content: "", skeleton: true },
                  { id: "s-2", role: "user", content: "", skeleton: true },
                  { id: "s-3", role: "assistant", content: "", skeleton: true },
                ]
              : messages
          }
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => listRef.current?.scrollToEnd()}
          renderItem={({ item }) => {
            if ((item as any).skeleton) {
              return (
                <View
                  style={[
                    styles.msgRow,
                    item.role === "user" && styles.msgRowUser,
                  ]}
                >
                  {item.role === "assistant" && (
                    <Shimmer style={styles.avatarSkeleton} />
                  )}
                  <Shimmer
                    style={[
                      styles.skeletonBubble,
                      item.role === "user"
                        ? styles.skeletonBubbleUser
                        : styles.skeletonBubbleAi,
                    ]}
                  />
                </View>
              );
            }

            return (
              <View
                style={[
                  styles.msgRow,
                  item.role === "user" && styles.msgRowUser,
                ]}
              >
                {item.role === "assistant" && (
                  <View style={styles.avatar}>
                    <Ionicons name="sparkles" size={16} color={colors.primary} />
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
            );
          }}
        />

        {loading && <Text style={styles.typingText}>{t("aiAsk.typing")}</Text>}

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
    typingText: {
      ...typography.caption,
      color: colors.textMuted,
      paddingHorizontal: spacing.lg,
    },
    inputBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
