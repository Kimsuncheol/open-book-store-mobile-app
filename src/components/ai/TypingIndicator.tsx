import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Shimmer } from "../Shimmer";
import { spacing, borderRadius } from "../../theme/colors";

interface TypingIndicatorProps {
  colors: any;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ colors }) => {
  const styles = createStyles(colors);

  return (
    <View style={[styles.msgRow, styles.typingRow]}>
      <View style={styles.avatar}>
        <Ionicons name="sparkles" size={16} color={colors.primary} />
      </View>
      <Shimmer style={[styles.skeletonBubble, styles.skeletonBubbleAi]} />
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    msgRow: {
      flexDirection: "row",
      marginBottom: spacing.md,
    },
    typingRow: {
      marginBottom: spacing.sm,
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
    skeletonBubble: {
      height: 28,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.border,
    },
    skeletonBubbleAi: {
      width: "80%",
    },
  });
