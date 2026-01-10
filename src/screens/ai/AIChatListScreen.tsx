import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import {
  clearAIChatMessages,
  deleteAIChatRoom,
  subscribeToAIChatRooms,
  getAIChatRooms,
} from "../../services/firestoreService";
import type { AIChatRoom } from "../../services/aiChatService";
import type { AIChatListScreenProps as Props } from "../../types/navigation";
import { ChatSidebarSearch } from "../../components/ai/ChatSidebarSearch";

import { ChatRoomListItem } from "../../components/ai/ChatRoomListItem";
import { SkeletonChatRoomList } from "../../components/ai/SkeletonChatRoomList";
import { ChatOptionsSheet } from "../../components/ai/ChatOptionsSheet";
import { spacing, typography, borderRadius } from "../../theme/colors";

export const AIChatListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const userId = user?.uid || "guest";
  const [rooms, setRooms] = useState<AIChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeRoom, setActiveRoom] = useState<AIChatRoom | null>(null);
  const styles = createStyles(colors);

  useEffect(() => {
    const unsubscribe = subscribeToAIChatRooms(
      userId,
      (data) => {
        setRooms(data);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to chat rooms:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userId]);

  const loadRooms = useCallback(
    async (withLoading = false) => {
      if (withLoading) setLoading(true);
      try {
        const data = await getAIChatRooms(userId);
        setRooms(data);
      } catch (error) {
        console.error("Failed to load chat rooms:", error);
      } finally {
        if (withLoading) setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    loadRooms(true);
  }, [loadRooms]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  const handleNewChat = () => {
    navigation.navigate("AIChatRoom", {
      bookId: "general",
      title: t("aiAsk.generalTitle"),
      messageCount: 0,
    });
  };

  const handleOpenRoom = (room: AIChatRoom) => {
    navigation.navigate("AIChatRoom", {
      bookId: room.bookId,
      title: room.title,
      coverUrl: room.coverUrl,
      messageCount: room.messageCount,
    });
  };

  const openRoomMenu = (room: AIChatRoom) => {
    setActiveRoom(room);
    setMenuVisible(true);
  };

  const handleDeleteRoom = async (room: AIChatRoom) => {
    setRooms((prev) => prev.filter((item) => item.bookId !== room.bookId));
    try {
      await deleteAIChatRoom(userId, room.bookId);
    } catch (error) {
      console.error("Failed to delete chat:", error);
      loadRooms(true);
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_evt, gestureState) => {
      const { dx, dy } = gestureState;
      return dx < -30 && Math.abs(dy) < 20;
    },
    onPanResponderRelease: (_evt, gestureState) => {
      if (gestureState.dx < -50) {
        navigation.replace("AIChatRoom", {
          bookId: "general",
          title: t("aiAsk.generalTitle"),
          messageCount: 0,
        });
      }
    },
  });

  const confirmClearRoom = (room: AIChatRoom) => {
    Alert.alert(t("aiAsk.menuClearTitle"), t("aiAsk.menuClearText"), [
      { text: t("aiAsk.menuCancel"), style: "cancel" },
      {
        text: t("aiAsk.menuClearConfirm"),
        style: "destructive",
        onPress: async () => {
          try {
            await clearAIChatMessages(userId, room.bookId);
            await loadRooms(true);
          } catch (error) {
            console.error("Failed to clear chat:", error);
          }
        },
      },
    ]);
  };

  const confirmDeleteRoom = (room: AIChatRoom) => {
    Alert.alert(t("aiAsk.menuDeleteTitle"), t("aiAsk.menuDeleteText"), [
      { text: t("aiAsk.menuCancel"), style: "cancel" },
      {
        text: t("aiAsk.menuDeleteConfirm"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAIChatRoom(userId, room.bookId);
            await loadRooms(true);
          } catch (error) {
            console.error("Failed to delete chat:", error);
          }
        },
      },
    ]);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRooms = normalizedQuery
    ? rooms.filter((room) => {
        const titleMatch = room.title?.toLowerCase().includes(normalizedQuery);
        const previewMatch = room.lastMessage
          ?.toLowerCase()
          .includes(normalizedQuery);
        return Boolean(titleMatch || previewMatch);
      })
    : rooms;

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchRow}>
        <ChatSidebarSearch
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("aiAsk.searchPlaceholder")}
          onActionPress={handleNewChat}
          actionLabel={t("aiAsk.newChat")}
          colors={colors}
        />
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={() =>
            navigation.replace("AIChatRoom", {
              bookId: "general",
              title: t("aiAsk.generalTitle"),
              messageCount: 0,
            })
          }
          accessibilityLabel={t("aiAsk.backToChat")}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {filteredRooms.length > 0 ? (
        <Text style={styles.sectionLabel}>{t("aiAsk.chatListTitle")}</Text>
      ) : null}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>{t("aiAsk.chatListEmpty")}</Text>
      <Text style={styles.emptyText}>{t("aiAsk.chatListEmptyText")}</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleNewChat}>
        <Ionicons
          name="sparkles"
          size={18}
          color={colors.textLight}
          style={styles.emptyButtonIcon}
        />
        <Text style={styles.emptyButtonText}>{t("aiAsk.chatListAction")}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: AIChatRoom }) => (
    <ChatRoomListItem
      room={item}
      onPress={() => handleOpenRoom(item)}
      onLongPress={() => openRoomMenu(item)}
      onSwipeDelete={() => handleDeleteRoom(item)}
      deleteLabel={t("aiAsk.menuDelete")}
      colors={colors}
    />
  );

  const listEmptyComponent = loading ? (
    <SkeletonChatRoomList colors={colors} />
  ) : (
    renderEmptyState()
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
      {...panResponder.panHandlers}
    >
      <FlatList
        data={loading ? [] : filteredRooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={listEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />

      <ChatOptionsSheet
        visible={menuVisible}
        title={activeRoom?.title}
        subtitle={t("aiAsk.menuChatActions")}
        colors={colors}
        onClose={() => {
          setMenuVisible(false);
          setActiveRoom(null);
        }}
        actions={
          activeRoom
            ? [
                {
                  label: t("aiAsk.menuOpen"),
                  icon: "chatbubble-ellipses-outline",
                  onPress: () => {
                    setMenuVisible(false);
                    handleOpenRoom(activeRoom);
                  },
                },
                {
                  label: t("aiAsk.menuClear"),
                  icon: "trash-outline",
                  onPress: () => {
                    setMenuVisible(false);
                    confirmClearRoom(activeRoom);
                  },
                },
                {
                  label: t("aiAsk.menuDelete"),
                  icon: "close-circle-outline",
                  destructive: true,
                  onPress: () => {
                    setMenuVisible(false);
                    confirmDeleteRoom(activeRoom);
                  },
                },
              ]
            : []
        }
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    collapseButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: spacing.sm,
      backgroundColor: colors.borderLight,
    },

    sectionLabel: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    list: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xl,
    },
    emptyTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      marginTop: spacing.md,
    },
    emptyText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: spacing.sm,
    },
    emptyButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: borderRadius.round,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      marginTop: spacing.lg,
    },
    emptyButtonIcon: {
      marginRight: spacing.sm,
    },
    emptyButtonText: {
      ...typography.bodySmall,
      fontWeight: "600",
      color: colors.textLight,
    },
  });
