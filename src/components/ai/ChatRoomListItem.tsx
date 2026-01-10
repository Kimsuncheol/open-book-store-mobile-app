import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius, typography } from "../../theme/colors";
import type { AIChatRoom } from "../../services/aiChatService";

interface ChatRoomListItemProps {
  room: AIChatRoom;
  onPress: () => void;
  onMenuPress: () => void;
  colors: any;
  emptyPreview: string;
  nowLabel: string;
  menuLabel: string;
}

const formatTimestamp = (date?: Date, nowLabel = "Now") => {
  if (!date) return "";
  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return nowLabel;
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h`;
  if (diffMs < day * 7) return `${Math.floor(diffMs / day)}d`;

  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  return `${month}/${dayOfMonth}`;
};

export const ChatRoomListItem: React.FC<ChatRoomListItemProps> = ({
  room,
  onPress,
  onMenuPress,
  colors,
  emptyPreview,
  nowLabel,
  menuLabel,
}) => {
  const styles = createStyles(colors);
  const timeLabel = formatTimestamp(room.lastMessageAt, nowLabel);
  const isGeneral = room.bookId === "general";

  return (
    <View style={styles.item}>
      <TouchableOpacity style={styles.main} onPress={onPress}>
        <View style={styles.cover}>
          {room.coverUrl ? (
            <Image
              source={{ uri: room.coverUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name={isGeneral ? "sparkles" : "book-outline"}
              size={24}
              color={colors.textSecondary}
            />
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {room.title}
          </Text>
          <Text style={styles.preview} numberOfLines={1}>
            {room.lastMessage || emptyPreview}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.meta}>
        <Text style={styles.time}>{timeLabel}</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
          accessibilityLabel={menuLabel}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={18}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
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
    main: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    cover: {
      width: 52,
      height: 70,
      borderRadius: borderRadius.md,
      backgroundColor: colors.borderLight,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      marginRight: spacing.md,
    },
    coverImage: {
      width: "100%",
      height: "100%",
    },
    content: {
      flex: 1,
    },
    title: {
      ...typography.bodySmall,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    preview: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    meta: {
      alignItems: "flex-end",
      marginLeft: spacing.sm,
    },
    time: {
      ...typography.caption,
      color: colors.textMuted,
    },
    menuButton: {
      marginTop: spacing.xs,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
  });
