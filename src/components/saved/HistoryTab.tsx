import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getReadingHistory } from "../../services/readingHistoryService";
import { ReadingHistoryItem } from "../../types/readingHistory";
import { Shimmer } from "../Shimmer";
import { spacing, borderRadius, typography } from "../../theme/colors";

export const HistoryTab: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const styles = createStyles(colors);
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const historyItems = await getReadingHistory(user.uid);
      setHistory(historyItems);
    } catch (error) {
      console.error("Failed to load reading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderHistoryItem = ({ item }: { item: ReadingHistoryItem }) => {
    const pagesLeft = item.totalPages - item.currentPage;

    return (
      <View style={styles.historyItem}>
        {/* Book Thumbnail */}
        <View style={styles.bookThumbnail}>
          <Ionicons name="book-outline" size={40} color={colors.textPrimary} />
          <View style={styles.pdfBadge}>
            <Text style={styles.pdfText}>PDF</Text>
          </View>
        </View>

        {/* Book Info */}
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.book.title}
          </Text>
          <View style={styles.uploadedBy}>
            <Ionicons name="person" size={14} color={colors.textSecondary} />
            <Text style={styles.uploaderText}>
              Uploaded by {item.book.author}
            </Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressRow}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>{item.percentComplete}%</Text>
            </View>
            <Text style={styles.pagesLeftText}>{pagesLeft} pages left</Text>
          </View>

          {/* Continue Reading Button */}
          <TouchableOpacity style={styles.continueButton}>
            <Text style={styles.continueButtonText}>Continue reading</Text>
          </TouchableOpacity>

          {/* Action Icons */}
          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="download-outline"
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="list-outline"
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="trophy-outline"
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="bookmark-outline"
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="person-outline" size={44} color={colors.textMuted} />
        <Text style={[styles.placeholderTitle, { color: colors.textPrimary }]}>
          Sign in to view history
        </Text>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          Track your reading progress across all your books.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        {[1, 2].map((index) => (
          <View key={`history-skeleton-${index}`} style={styles.historyItem}>
            {/* Book Thumbnail Skeleton */}
            <Shimmer style={styles.skeletonThumbnail} />

            {/* Book Info Skeleton */}
            <View style={styles.bookInfo}>
              <Shimmer style={styles.skeletonTitle} />
              <Shimmer style={styles.skeletonUploader} />

              {/* Progress Row Skeleton */}
              <View style={styles.progressRow}>
                <Shimmer style={styles.skeletonProgressCircle} />
                <Shimmer style={styles.skeletonPagesLeft} />
              </View>

              {/* Continue Button Skeleton */}
              <Shimmer style={styles.skeletonContinueButton} />

              {/* Action Icons Skeleton */}
              <View style={styles.actionIcons}>
                <Shimmer style={styles.skeletonIconButton} />
                <Shimmer style={styles.skeletonIconButton} />
                <Shimmer style={styles.skeletonIconButton} />
                <Shimmer style={styles.skeletonIconButton} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="time-outline" size={44} color={colors.textMuted} />
        <Text style={[styles.placeholderTitle, { color: colors.textPrimary }]}>
          No history yet
        </Text>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          Continue reading to build up your history.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
    listContent: {
      paddingVertical: spacing.md,
    },
    historyItem: {
      flexDirection: "row",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: spacing.md,
    },
    bookThumbnail: {
      width: 90,
      height: 120,
      borderRadius: borderRadius.sm,
      backgroundColor: "#F8F6F2",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      position: "relative",
    },
    pdfBadge: {
      position: "absolute",
      bottom: 6,
      right: 6,
      backgroundColor: colors.background,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    pdfText: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    bookInfo: {
      flex: 1,
      gap: spacing.xs,
    },
    bookTitle: {
      ...typography.body,
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: "600",
      lineHeight: 22,
    },
    uploadedBy: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    uploaderText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 13,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    progressCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 3,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    progressText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    pagesLeftText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 13,
    },
    continueButton: {
      height: 44,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    continueButtonText: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    actionIcons: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
    },
    iconButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    placeholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
      backgroundColor: colors.background,
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
    skeletonThumbnail: {
      width: 90,
      height: 120,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.border,
    },
    skeletonTitle: {
      height: 18,
      width: "85%",
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    skeletonUploader: {
      height: 14,
      width: "60%",
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    skeletonProgressCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.border,
    },
    skeletonPagesLeft: {
      height: 14,
      width: 100,
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    skeletonContinueButton: {
      height: 44,
      borderRadius: borderRadius.md,
      backgroundColor: colors.border,
      marginTop: spacing.sm,
    },
    skeletonIconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.border,
    },
  });
