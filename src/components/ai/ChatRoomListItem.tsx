import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { spacing, typography } from "../../theme/colors";
import type { AIChatRoom } from "../../services/aiChatService";

interface ChatRoomListItemProps {
  room: AIChatRoom;
  onPress: () => void;
  onLongPress?: () => void;
  onSwipeDelete: () => void;
  deleteLabel: string;
  colors: any;
}

export const ChatRoomListItem: React.FC<ChatRoomListItemProps> = ({
  room,
  onPress,
  onLongPress,
  onSwipeDelete,
  deleteLabel,
  colors,
}) => {
  const styles = createStyles(colors);
  const swipeRef = useRef<Swipeable | null>(null);
  const [itemWidth, setItemWidth] = useState(0);
  const title = room.title || "Open Bookstore";

  const handleSwipeOpen = (direction: "left" | "right") => {
    if (direction !== "left") return;
    swipeRef.current?.close();
    onSwipeDelete();
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setItemWidth(width);
  };

  const renderRightActions = (
    progressAnimatedValue: any,
    dragAnimatedValue: any
  ) => {
    const opacity = dragAnimatedValue.interpolate({
      inputRange: [-itemWidth, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    const scale = dragAnimatedValue.interpolate({
      inputRange: [-itemWidth, 0],
      outputRange: [1, 0.8],
      extrapolate: "clamp",
    });

    return (
      <View style={[styles.deleteAction, { width: itemWidth }]}>
        <Animated.View
          style={[styles.deleteContent, { transform: [{ scale }], opacity }]}
        >
          <Ionicons name="trash-outline" size={20} color={colors.textLight} />
          <Text style={styles.deleteText}>{deleteLabel}</Text>
        </Animated.View>
      </View>
    );
  };
  const renderLeftActions = () => (
    <View style={styles.deleteAction}>
      <Ionicons name="trash-outline" size={18} color={colors.textLight} />
      <Text style={styles.deleteText}>{deleteLabel}</Text>
    </View>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeOpen}
      overshootRight={false}
      friction={2}
      overshootFriction={8}
      rightThreshold={40}
      renderLeftActions={renderLeftActions}
      overshootLeft={false}
    >
      <TouchableOpacity
        style={styles.item}
        onPress={onPress}
        onLongPress={onLongPress}
        onLayout={handleLayout}
      >
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    item: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.sm,
    },
    title: {
      ...typography.bodySmall,
      fontWeight: "500",
      color: colors.text,
      paddingRight: spacing.sm,
      flex: 1,
    },
    deleteAction: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.error,
    },
    deleteContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    deleteText: {
      ...typography.caption,
      color: colors.textLight,
      marginLeft: spacing.xs,
      fontWeight: "600",
    },
  });
