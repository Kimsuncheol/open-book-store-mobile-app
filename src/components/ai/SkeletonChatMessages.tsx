import React from "react";
import { View, StyleSheet } from "react-native";
import { Shimmer } from "../Shimmer";
import { spacing, borderRadius } from "../../theme/colors";

interface SkeletonChatMessagesProps {
  colors: any;
}

export const SkeletonChatMessages: React.FC<SkeletonChatMessagesProps> = ({
  colors,
}) => {
  const styles = createStyles(colors);

  return (
    <View style={styles.skeletonOverlay}>
      <View style={styles.messages}>
        <View style={styles.msgRow}>
          <Shimmer style={styles.avatarSkeleton} />
          <Shimmer style={[styles.skeletonBubble, styles.skeletonBubbleAi]} />
        </View>
        <View style={[styles.msgRow, styles.msgRowUser]}>
          <Shimmer style={[styles.skeletonBubble, styles.skeletonBubbleUser]} />
        </View>
        <View style={styles.msgRow}>
          <Shimmer style={styles.avatarSkeleton} />
          <Shimmer style={[styles.skeletonBubble, styles.skeletonBubbleAi]} />
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    skeletonOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background,
      zIndex: 1,
    },
    messages: {
      padding: spacing.md,
    },
    msgRow: {
      flexDirection: "row",
      marginBottom: spacing.md,
    },
    msgRowUser: {
      justifyContent: "flex-end",
    },
    avatarSkeleton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.border,
      marginRight: spacing.sm,
    },
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
  });
