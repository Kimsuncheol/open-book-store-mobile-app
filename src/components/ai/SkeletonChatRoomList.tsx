import React from "react";
import { View, StyleSheet } from "react-native";
import { Shimmer } from "../Shimmer";
import { spacing, borderRadius } from "../../theme/colors";

interface SkeletonChatRoomListProps {
  colors: any;
  count?: number;
}

export const SkeletonChatRoomList: React.FC<SkeletonChatRoomListProps> = ({
  colors,
  count = 4,
}) => {
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={`chat-room-skeleton-${index}`} style={styles.item}>
          <Shimmer style={styles.cover} />
          <View style={styles.content}>
            <Shimmer style={styles.title} />
            <Shimmer style={styles.preview} />
          </View>
          <Shimmer style={styles.time} />
        </View>
      ))}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      padding: spacing.md,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      marginBottom: spacing.md,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cover: {
      width: 52,
      height: 70,
      borderRadius: borderRadius.md,
      backgroundColor: colors.border,
      marginRight: spacing.md,
    },
    content: {
      flex: 1,
    },
    title: {
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.border,
      width: "60%",
      marginBottom: spacing.sm,
    },
    preview: {
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.border,
      width: "80%",
    },
    time: {
      width: 32,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.border,
      marginLeft: spacing.md,
    },
  });
