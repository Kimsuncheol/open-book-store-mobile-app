import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { Book } from "../../services/firestoreService";
import { spacing, typography } from "../../theme/colors";

const SCRIBD_ACCENT = "#E31226";
const SCRIBD_PAPER = "#F8F6F2";
const ANIMATION_DURATION = 220;

interface BookDetailsBottomSheetProps {
  visible: boolean;
  book: Book | null;
  isSaved?: boolean;
  onClose: () => void;
  onSave: (book: Book) => void;
  onRead?: (book: Book) => void;
  onDownload?: (book: Book) => void;
}

export const BookDetailsBottomSheet: React.FC<BookDetailsBottomSheetProps> = ({
  visible,
  book,
  isSaved = false,
  onClose,
  onSave,
  onRead,
  onDownload,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isRendered, setIsRendered] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(340);
  const progress = useRef(new Animated.Value(0)).current;

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

  const translateY = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [sheetHeight + insets.bottom, 0],
      }),
    [insets.bottom, progress, sheetHeight]
  );

  const overlayOpacity = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.45],
      }),
    [progress]
  );

  if (!isRendered || !book) return null;

  const styles = createStyles(colors);

  return (
    <Modal transparent visible={isRendered} animationType="none">
      <View style={styles.modalRoot}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View
            style={[styles.overlay, { opacity: overlayOpacity }]}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: spacing.lg + insets.bottom,
              transform: [{ translateY }],
            },
          ]}
          onLayout={(event) => setSheetHeight(event.nativeEvent.layout.height)}
        >
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View style={styles.cover}>
              <Ionicons name="book-outline" size={36} color={colors.textPrimary} />
            </View>
            <View style={styles.titleBlock}>
              <Text style={styles.title} numberOfLines={2}>
                {book.title}
              </Text>
              <Text style={styles.author} numberOfLines={1}>
                {book.author}
              </Text>
              <View style={styles.metaRow}>
                <Ionicons name="star" size={12} color={SCRIBD_ACCENT} />
                <Text style={styles.metaText}>{book.rating}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{book.category}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description} numberOfLines={4}>
            {book.description || "A fresh pick from Scribd readers right now."}
          </Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: SCRIBD_ACCENT }]}
              onPress={() => onSave(book)}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.primaryButtonText}>
                {isSaved ? "Saved" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.readButton,
              { borderColor: "transparent", backgroundColor: "#2E9B4C" },
            ]}
            onPress={() => onRead?.(book)}
          >
            <Text style={styles.readButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },
    overlay: {
      flex: 1,
      backgroundColor: "#000000",
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    handle: {
      alignSelf: "center",
      width: 44,
      height: 4,
      borderRadius: 999,
      backgroundColor: colors.border,
      marginBottom: spacing.sm,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },
    cover: {
      width: 64,
      height: 84,
      borderRadius: 14,
      backgroundColor: SCRIBD_PAPER,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    titleBlock: {
      flex: 1,
      gap: 4,
    },
    title: {
      ...typography.h3,
      color: colors.textPrimary,
      fontFamily: "Georgia",
    },
    author: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    metaText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    metaDot: {
      color: colors.textMuted,
    },
    closeButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    description: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    actionsRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    readButton: {
      height: 48,
      borderRadius: 999,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    readButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 15,
    },
    primaryButton: {
      flex: 1,
      height: 46,
      borderRadius: 999,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 14,
    },
    secondaryButton: {
      flex: 1,
      height: 46,
      borderRadius: 999,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.background,
    },
    secondaryButtonText: {
      color: colors.textPrimary,
      fontWeight: "600",
      fontSize: 14,
    },
  });
