import React, { useEffect, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { AISearchResult } from "../../services/aiSearchService";
import { Book } from "../../services/firestoreService";
import { spacing, typography } from "../../theme/colors";

const SCRIBD_ACCENT = "#E31226";
const SCRIBD_INK = "#121212";
const SCRIBD_PAPER = "#F8F6F2";
const ANIMATION_DURATION = 220;

interface AiSearchBottomSheetProps {
  visible: boolean;
  results: AISearchResult[];
  query: string;
  onClose: () => void;
  onSelect: (book: Book) => void;
  onSave: (book: Book) => void;
  savedIds: Set<string>;
}

export const AiSearchBottomSheet: React.FC<AiSearchBottomSheetProps> = ({
  visible,
  results,
  query,
  onClose,
  onSelect,
  onSave,
  savedIds,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isRendered, setIsRendered] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(420);
  const progress = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.timing(progress, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setIsRendered(false);
    });
  }, [progress, visible]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight + insets.bottom, 0],
  });

  const overlayOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  if (!isRendered) return null;

  const styles = createStyles(colors);
  const cleanedResults = results.filter((item) => item.book);

  return (
    <Modal transparent visible={isRendered} animationType="none">
      <View style={styles.aiSheetRoot}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View
            style={[styles.aiSheetOverlay, { opacity: overlayOpacity }]}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.aiSheet,
            {
              paddingBottom: spacing.lg + insets.bottom,
              transform: [{ translateY }],
            },
          ]}
          onLayout={(event) => setSheetHeight(event.nativeEvent.layout.height)}
        >
          <View style={styles.aiSheetHandle} />
          <View style={styles.aiSheetHeader}>
            <View>
              <Text style={styles.aiSheetTitle}>{t("dashboard.aiResults.title")}</Text>
              <Text style={styles.aiSheetSubtitle} numberOfLines={1}>
                {query ? `"${query}"` : t("dashboard.aiResults.subtitle")}
              </Text>
            </View>
            <TouchableOpacity style={styles.aiSheetClose} onPress={onClose}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {cleanedResults.length === 0 ? (
            <View style={styles.aiEmptyState}>
              <Ionicons name="search-outline" size={36} color={colors.textMuted} />
              <Text style={styles.aiEmptyTitle}>{t("dashboard.aiResults.empty")}</Text>
              <Text style={styles.aiEmptyText}>{t("dashboard.aiResults.emptyHint")}</Text>
            </View>
          ) : (
            <FlatList
              data={cleanedResults}
              keyExtractor={(item) => item.bookId}
              renderItem={({ item }) => {
                if (!item.book) return null;
                const isSaved = savedIds.has(item.book.id);
                return (
                  <TouchableOpacity
                    style={styles.aiResultRow}
                    onPress={() => onSelect(item.book as Book)}
                  >
                    <View style={styles.aiResultCover}>
                      <Ionicons name="book-outline" size={20} color={SCRIBD_INK} />
                    </View>
                    <View style={styles.aiResultInfo}>
                      <Text style={styles.aiResultTitle} numberOfLines={1}>
                        {item.book.title}
                      </Text>
                      <Text style={styles.aiResultAuthor} numberOfLines={1}>
                        {item.book.author}
                      </Text>
                      <Text style={styles.aiResultReason} numberOfLines={2}>
                        {item.reasoning}
                      </Text>
                      <View style={styles.aiResultMeta}>
                        <Ionicons name="sparkles" size={12} color={SCRIBD_ACCENT} />
                        <Text style={styles.aiResultScore}>{item.score}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.aiSaveButton,
                        isSaved && styles.aiSaveButtonActive,
                      ]}
                      onPress={() => onSave(item.book as Book)}
                    >
                      <Ionicons
                        name={isSaved ? "bookmark" : "bookmark-outline"}
                        size={16}
                        color={SCRIBD_ACCENT}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.aiResultsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    aiSheetRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },
    aiSheetOverlay: {
      flex: 1,
      backgroundColor: "#000000",
    },
    aiSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    aiSheetHandle: {
      alignSelf: "center",
      width: 44,
      height: 4,
      borderRadius: 999,
      backgroundColor: colors.border,
      marginBottom: spacing.sm,
    },
    aiSheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.md,
    },
    aiSheetTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      fontFamily: "Georgia",
    },
    aiSheetSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
      maxWidth: 220,
    },
    aiSheetClose: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    aiResultsList: {
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
    aiResultRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      borderRadius: 16,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    aiResultCover: {
      width: 44,
      height: 58,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: SCRIBD_PAPER,
      alignItems: "center",
      justifyContent: "center",
    },
    aiResultInfo: {
      flex: 1,
      gap: 2,
    },
    aiResultTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    aiResultAuthor: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    aiResultReason: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    aiResultMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    aiResultScore: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    aiSaveButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(227, 18, 38, 0.08)",
    },
    aiSaveButtonActive: {
      backgroundColor: "rgba(227, 18, 38, 0.16)",
    },
    aiEmptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xl,
      gap: spacing.sm,
    },
    aiEmptyTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    aiEmptyText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });
