import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { spacing, typography } from "../../theme/colors";

interface ChatSidebarRoomItemProps {
  title: string;
  onPress: () => void;
  onLongPress?: () => void;
  colors: any;
}

export const ChatSidebarRoomItem: React.FC<ChatSidebarRoomItemProps> = ({
  title,
  onPress,
  onLongPress,
  colors,
}) => {
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing.sm,
    },
    title: {
      ...typography.bodySmall,
      fontWeight: "500",
      color: colors.textPrimary,
    },
  });
