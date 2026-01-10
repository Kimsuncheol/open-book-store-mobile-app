import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import {
  clearAIChatMessages,
  deleteAIChatRoom,
  deleteAllAIChatRooms,
  getAIChatRooms,
} from "../../services/firestoreService";
import type { AIChatRoom } from "../../services/aiChatService";
import type { AIChatListScreenProps as Props } from "../../types/navigation";
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [screenMenuVisible, setScreenMenuVisible] = useState(false);
  const [activeRoom, setActiveRoom] = useState<AIChatRoom | null>(null);
  const styles = createStyles(colors);

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

  useFocusEffect(
    useCallback(() => {
      loadRooms();
    }, [loadRooms])
  );

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

  const confirmClearRoom = (room: AIChatRoom) => {
    Alert.alert(
      t("aiAsk.menuClearTitle"),
      t("aiAsk.menuClearText"),
      [
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
      ]
    );
  };

  const confirmDeleteRoom = (room: AIChatRoom) => {
    Alert.alert(
      t("aiAsk.menuDeleteTitle"),
      t("aiAsk.menuDeleteText"),
      [
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
      ]
    );
  };

  const confirmDeleteAll = () => {
    Alert.alert(
      t("aiAsk.menuDeleteAllTitle"),
      t("aiAsk.menuDeleteAllText"),
      [
        { text: t("aiAsk.menuCancel"), style: "cancel" },
        {
          text: t("aiAsk.menuDeleteConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllAIChatRooms(userId);
              await loadRooms(true);
            } catch (error) {
              console.error("Failed to delete all chats:", error);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: AIChatRoom }) => (
    <ChatRoomListItem
      room={item}
      colors={colors}
      nowLabel={t("aiAsk.now")}
      emptyPreview={t("aiAsk.chatListEmptyPreview")}
      menuLabel={t("aiAsk.menuMore")}
      onPress={() => handleOpenRoom(item)}
      onMenuPress={() => openRoomMenu(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t("aiAsk.chatListTitle")}</Text>
          <Text style={styles.subtitle}>{t("aiAsk.chatListSubtitle")}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.newButton} onPress={handleNewChat}>
            <Ionicons
              name="add"
              size={18}
              color={colors.textLight}
              style={styles.newButtonIcon}
            />
            <Text style={styles.newButtonText}>{t("aiAsk.newChat")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setScreenMenuVisible(true)}
            accessibilityLabel={t("aiAsk.menuMore")}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={18}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <SkeletonChatRoomList colors={colors} />
      ) : rooms.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="chatbubbles-outline"
            size={48}
            color={colors.textMuted}
          />
          <Text style={styles.emptyTitle}>{t("aiAsk.chatListEmpty")}</Text>
          <Text style={styles.emptyText}>{t("aiAsk.chatListEmptyText")}</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleNewChat}>
            <Ionicons
              name="sparkles"
              size={18}
              color={colors.textLight}
              style={styles.emptyButtonIcon}
            />
            <Text style={styles.emptyButtonText}>
              {t("aiAsk.chatListAction")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

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

      <ChatOptionsSheet
        visible={screenMenuVisible}
        title={t("aiAsk.menuListTitle")}
        subtitle={t("aiAsk.menuListSubtitle")}
        colors={colors}
        onClose={() => setScreenMenuVisible(false)}
        actions={[
          {
            label: t("aiAsk.menuNewChat"),
            icon: "add-circle-outline",
            onPress: () => {
              setScreenMenuVisible(false);
              handleNewChat();
            },
          },
          {
            label: t("aiAsk.menuRefresh"),
            icon: "refresh",
            onPress: () => {
              setScreenMenuVisible(false);
              loadRooms(true);
            },
          },
          ...(rooms.length > 0
            ? [
                {
                  label: t("aiAsk.menuDeleteAll"),
                  icon: "trash",
                  destructive: true,
                  onPress: () => {
                    setScreenMenuVisible(false);
                    confirmDeleteAll();
                  },
                },
              ]
            : []),
        ]}
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      ...typography.h3,
      color: colors.textPrimary,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    newButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: borderRadius.round,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    newButtonIcon: {
      marginRight: spacing.xs,
    },
    newButtonText: {
      ...typography.bodySmall,
      fontWeight: "600",
      color: colors.textLight,
    },
    menuButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: spacing.sm,
      backgroundColor: colors.borderLight,
    },
    list: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
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
