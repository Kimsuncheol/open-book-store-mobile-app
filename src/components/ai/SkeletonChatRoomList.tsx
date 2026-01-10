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
          <Shimmer style={styles.title} />
        </View>
      ))}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      paddingTop: spacing.sm,
    },
    item: {
      marginBottom: spacing.md,
    },
    title: {
      height: 14,
      borderRadius: borderRadius.md,
      backgroundColor: colors.border,
      width: "75%",
    },
  });
