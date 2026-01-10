import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography, borderRadius } from "../../theme/colors";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
  colors: any;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  colors,
}) => {
  const styles = createStyles(colors);

  return (
    <View style={[styles.msgRow, message.role === "user" && styles.msgRowUser]}>
      {message.role === "assistant" && (
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={16} color={colors.primary} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          message.role === "user" ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[styles.msgText, message.role === "user" && styles.userText]}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    msgRow: {
      flexDirection: "row",
      marginBottom: spacing.md,
    },
    msgRowUser: {
      justifyContent: "flex-end",
    },
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
    userBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    aiBubble: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 4,
    },
    msgText: {
      ...typography.body,
      color: colors.textPrimary,
    },
    userText: {
      color: colors.textLight,
    },
  });
