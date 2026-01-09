import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/colors";
import { Shimmer } from "../Shimmer";
import type { SavedItem } from "../../context/SavedContext";

const SavedList = React.lazy(() => import("../../screens/main/SavedList"));

interface TitlesTabProps {
  savedItems: SavedItem[];
  filteredItems: SavedItem[];
  loadingSaved: boolean;
  search: string;
  aiMode: boolean;
  aiSearching: boolean;
  PRIMARY: string;
  skeletonItems: number[];
  onSearchChange: (text: string) => void;
  onSearchSubmit: () => void;
  onAIModeToggle: () => void;
  onBrowsePress: () => void;
  onClearSearch: () => void;
  renderSavedItem: (item: { item: SavedItem }) => React.ReactElement;
  downloadingId: string | null;
  t: (key: string) => string;
}

export const TitlesTab: React.FC<TitlesTabProps> = ({
  savedItems,
  filteredItems,
  loadingSaved,
  search,
  aiMode,
  aiSearching,
  PRIMARY,
  skeletonItems,
  onSearchChange,
  onSearchSubmit,
  onAIModeToggle,
  onBrowsePress,
  onClearSearch,
  renderSavedItem,
  downloadingId,
  t,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors, PRIMARY);

  return (
    <>
      {/* Search Bar */}
      {savedItems.length > 0 && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={
              aiMode
                ? "Ask AI to find items in your cart..."
                : "Search cart items..."
            }
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
          />
          {aiSearching ? (
            <ActivityIndicator size="small" color={PRIMARY} />
          ) : (
            <TouchableOpacity
              onPress={onAIModeToggle}
              style={[styles.aiToggle, aiMode && styles.aiToggleActive]}
            >
              <Ionicons
                name="sparkles"
                size={18}
                color={aiMode ? PRIMARY : colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* saved books */}
      {loadingSaved ? (
        <View style={styles.list}>
          {skeletonItems.map((index) => (
            <View
              key={`saved-skeleton-${index}`}
              style={[styles.cartItem, styles.skeletonCard]}
            >
              <Shimmer style={styles.skeletonIcon} />
              <View style={styles.itemInfo}>
                <Shimmer style={styles.skeletonTitle} />
                <Shimmer style={styles.skeletonAuthor} />
                <View style={styles.skeletonActions}>
                  <Shimmer style={styles.skeletonPrimary} />
                  <View style={styles.skeletonSecondary}>
                    <Shimmer style={styles.skeletonIconBtn} />
                    <Shimmer style={styles.skeletonIconBtn} />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : savedItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {t("saved.emptySaved")}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("saved.emptySavedText")}
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, { backgroundColor: PRIMARY }]}
            onPress={onBrowsePress}
          >
            <Text style={styles.browseBtnText}>{t("saved.browseBtn")}</Text>
          </TouchableOpacity>
        </View>
      ) : filteredItems.length === 0 && search.trim() ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No Results Found
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Try adjusting your search query
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, { backgroundColor: PRIMARY }]}
            onPress={onClearSearch}
          >
            <Text style={styles.browseBtnText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <React.Suspense
          fallback={
            <View style={styles.listFallback}>
              <ActivityIndicator size="small" color={PRIMARY} />
            </View>
          }
        >
          <SavedList
            data={filteredItems}
            renderItem={renderSavedItem}
            keyExtractor={(item) => item.book.id}
            contentContainerStyle={styles.list}
            extraData={{ downloadingId }}
          />
        </React.Suspense>
      )}
    </>
  );
};

const createStyles = (colors: any, PRIMARY: string) =>
  StyleSheet.create({
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FAF9F6",
      marginHorizontal: spacing.lg,
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      fontSize: 14,
    },
    aiToggle: {
      padding: 8,
      borderRadius: 12,
      marginLeft: 8,
      backgroundColor: "transparent",
    },
    aiToggleActive: {
      backgroundColor: "rgba(139, 69, 19, 0.12)",
    },
    list: { padding: spacing.lg, gap: spacing.md },
    listFallback: {
      padding: spacing.lg,
      alignItems: "center",
    },
    cartItem: {
      flexDirection: "row",
      padding: spacing.md,
      borderRadius: 16,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skeletonCard: {
      opacity: 0.6,
    },
    skeletonIcon: {
      width: 60,
      height: 60,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    itemInfo: { flex: 1, gap: spacing.xs },
    skeletonTitle: {
      height: 16,
      width: "80%",
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    skeletonAuthor: {
      height: 14,
      width: "60%",
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    skeletonActions: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    skeletonPrimary: {
      height: 32,
      flex: 1,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    skeletonSecondary: {
      flexDirection: "row",
      gap: spacing.xs,
    },
    skeletonIconBtn: {
      width: 32,
      height: 32,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
    },
    emptyText: {
      fontSize: 14,
      textAlign: "center",
    },
    browseBtn: {
      marginTop: spacing.md,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: 999,
    },
    browseBtnText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },
  });
