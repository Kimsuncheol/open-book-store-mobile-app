import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing, borderRadius, typography } from "../../theme/colors";

type NotebookFilter = "Bookmarks" | "Highlights" | "Notes";

export const NotebookTab: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [activeFilter, setActiveFilter] = useState<NotebookFilter>("Bookmarks");

  const filters: NotebookFilter[] = ["Bookmarks", "Highlights", "Notes"];

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Empty State */}
      <ScrollView
        contentContainerStyle={styles.emptyContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Highlighter Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="create-outline" size={80} color={colors.textMuted} />
        </View>

        <Text style={styles.emptyTitle}>
          You haven't annotated anything yet
        </Text>

        <Text style={styles.emptySubtitle}>
          While reading on Scribd, you can:
        </Text>

        {/* Features List */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons
              name="create-outline"
              size={24}
              color={colors.textSecondary}
            />
            <Text style={styles.featureText}>Highlight important passages</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons
              name="document-text-outline"
              size={24}
              color={colors.textSecondary}
            />
            <Text style={styles.featureText}>Take notes as you're reading</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons
              name="bookmark-outline"
              size={24}
              color={colors.textSecondary}
            />
            <Text style={styles.featureText}>Bookmark your favorite pages</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    filterContainer: {
      flexDirection: "row",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterTab: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "transparent",
    },
    filterTabActive: {
      backgroundColor: colors.surface,
      borderColor: colors.textSecondary,
    },
    filterText: {
      ...typography.body,
      color: colors.textSecondary,
      fontWeight: "500",
      fontSize: 14,
    },
    filterTextActive: {
      color: colors.textPrimary,
      fontWeight: "600",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xl,
    },
    iconContainer: {
      marginBottom: spacing.lg,
      opacity: 0.5,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    emptySubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: spacing.xl,
    },
    featuresList: {
      width: "100%",
      gap: spacing.lg,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    featureText: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: 15,
      flex: 1,
    },
  });
