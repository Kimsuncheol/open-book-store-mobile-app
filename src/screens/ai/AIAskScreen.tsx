import React, { useState, useRef } from "react";
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
import { askQuestion, clearConversation } from "../../services/aiService";
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: `Hi! Ask me anything about "${title}".`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const styles = createStyles(colors);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
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
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, something went wrong.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
    setLoading(false);
  };

  const handleClear = () => {
    clearConversation(bookId);
    setMessages([
      {
        id: "0",
        role: "assistant",
        content: `Hi! Ask me anything about "${title}".`,
      },
    ]);
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
            <Text style={styles.headerTitle}>Ask AI</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="trash-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => listRef.current?.scrollToEnd()}
          renderItem={({ item }) => (
            <View
              style={[styles.msgRow, item.role === "user" && styles.msgRowUser]}
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
          )}
        />

        {loading && <Text style={styles.typingText}>AI is typing...</Text>}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask a question..."
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
      // justifyContent: "center",
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
    bubble: {
      maxWidth: "75%",
      padding: spacing.md,
      borderRadius: borderRadius.lg,
    },
    userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    aiBubble: { backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
    msgText: { ...typography.body, color: colors.textPrimary },
    userText: { color: colors.textLight },
    typingText: {
      ...typography.caption,
      color: colors.textMuted,
      paddingHorizontal: spacing.lg,
    },
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
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
