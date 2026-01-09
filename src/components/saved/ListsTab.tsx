import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getUserLists, getListWithBooks } from "../../services/listsService";
import { BookListWithBooks } from "../../types/lists";
import { CreateListModal } from "../modals/CreateListModal";
import { spacing, borderRadius, typography } from "../../theme/colors";

export const ListsTab: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const styles = createStyles(colors);
  const [lists, setLists] = useState<BookListWithBooks[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user]);

  const loadLists = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userLists = await getUserLists(user.uid);
      // Fetch detailed list data with books
      const listsWithBooks = await Promise.all(
        userLists.map((list) => getListWithBooks(user.uid, list.id))
      );
      setLists(
        listsWithBooks.filter((list) => list !== null) as BookListWithBooks[]
      );
    } catch (error) {
      console.error("Failed to load lists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleListCreated = () => {
    loadLists();
  };

  const renderListItem = ({ item }: { item: BookListWithBooks }) => {
    const bookCount = item.bookIds.length;
    const displayBooks = item.books.slice(0, 2); // Show first 2 book covers

    return (
      <TouchableOpacity style={styles.listItem}>
        {/* Book Thumbnails Container - Top Section */}
        <View style={styles.bookThumbnailsContainer}>
          {displayBooks.length > 0 ? (
            displayBooks.map((book, index) => (
              <View key={book.id} style={styles.bookCover}>
                <Ionicons
                  name="book-outline"
                  size={40}
                  color={colors.textPrimary}
                />
              </View>
            ))
          ) : (
            <View style={styles.emptyBookCover}>
              <Ionicons
                name="book-outline"
                size={40}
                color={colors.textMuted}
              />
            </View>
          )}
        </View>

        {/* List Info - Bottom Section */}
        <View style={styles.listInfoContainer}>
          <Text style={styles.listName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.listCount}>
            {t("lists.itemCount", { count: bookCount })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="person-outline" size={44} color={colors.textMuted} />
        <Text style={[styles.placeholderTitle, { color: colors.textPrimary }]}>
          Sign in to create lists
        </Text>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          Lists help you organize your saved books by themes or topics.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Create a List Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add-outline" size={20} color={colors.textPrimary} />
        <Text style={styles.createButtonText}>{t("lists.createAList")}</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : lists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.listCountText}>0 List</Text>
        </View>
      ) : (
        <>
          <Text style={styles.listCountText}>
            {lists.length} {lists.length === 1 ? "List" : "Lists"}
          </Text>
          <FlatList
            data={lists}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}

      <CreateListModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onListCreated={handleListCreated}
        userId={user?.uid || ""}
      />
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    createButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      gap: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    createButtonText: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    listCountText: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      ...typography.body,
      color: colors.textSecondary,
      fontSize: 14,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyContainer: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    listItem: {
      flexDirection: "column",
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    bookThumbnailsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
      backgroundColor: colors.background,
      gap: spacing.sm,
    },
    bookCover: {
      width: 80,
      height: 100,
      borderRadius: borderRadius.sm,
      backgroundColor: "#F8F6F2",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyBookCover: {
      width: 80,
      height: 100,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    listInfoContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
    },
    listName: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: "600",
      marginBottom: 4,
    },
    listCount: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    placeholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
    },
    placeholderTitle: {
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
    },
    placeholderText: {
      fontSize: 14,
      textAlign: "center",
    },
  });
