import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useSaved } from "../../context/SavedContext";
import {
  addSavedBook,
  getBook,
  incrementUserDownloads,
  addUserDownload,
  removeSavedBook,
  Book,
} from "../../services/firestoreService";
import { downloadPDF } from "../../services/storageService";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { BookDetailsScreenProps as Props } from "../../types/navigation";
import { AddToListModal } from "../../components/modals/AddToListModal";
import { CreateListModal } from "../../components/modals/CreateListModal";

const COVER_BG = "#F8F6F2";

export const BookDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { addToSaved, removeFromSaved, savedItems } = useSaved();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [showCreateListModal, setShowCreateListModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadBook = async () => {
      try {
        const result = await getBook(route.params.bookId);
        if (isMounted) setBook(result);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadBook();
    return () => {
      isMounted = false;
    };
  }, [route.params.bookId]);

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>Book not found.</Text>
      </View>
    );
  }

  const isSaved = savedItems.some((item) => item.book.id === book.id);

  const handleDownload = async () => {
    if (!book || downloading) return;
    if (!book.pdfUrl) {
      Alert.alert("Download", "This book doesn't have a downloadable file.");
      return;
    }
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to download books.");
      return;
    }
    setDownloading(true);
    try {
      await downloadPDF(book.pdfUrl, book.id);
      await incrementUserDownloads(user.uid);
      await addUserDownload(user.uid, book.id);
      Alert.alert("Download", "Downloaded successfully.");
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert("Download", "Failed to download the book.");
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!book || saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        removeFromSaved(book.id);
        if (user) {
          await removeSavedBook(book.id, user.uid);
        }
      } else {
        addToSaved(book);
        if (user) {
          await addSavedBook(book.id, user.uid);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddToList = () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to add books to lists.");
      return;
    }
    setShowAddToListModal(true);
  };

  const handleOpenCreateList = () => {
    setShowCreateListModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing.xl + insets.bottom },
        ]}
      >
        <View style={styles.cover}>
          <Ionicons name="book-outline" size={48} color={colors.textPrimary} />
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={12} color={colors.primary} />
            <Text style={styles.metaText}>{book.rating}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{book.category}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          {book.description || "No description available."}
        </Text>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => Alert.alert("Reader", "Reader screen is unavailable.")}
        >
          <Text style={styles.ctaText}>Read Now</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDownload}
            disabled={downloading}
          >
            <Ionicons
              name="download-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleSave}
            disabled={saving}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={colors.textPrimary}
            />
            <Text style={styles.actionText}>{isSaved ? "Saved" : "Save"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddToList}
          >
            <Ionicons
              name="list-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={styles.actionText}>Add to List</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {user && book && (
        <>
          <AddToListModal
            visible={showAddToListModal}
            onClose={() => setShowAddToListModal(false)}
            bookId={book.id}
            userId={user.uid}
            onCreateNewList={handleOpenCreateList}
          />
          <CreateListModal
            visible={showCreateListModal}
            onClose={() => setShowCreateListModal(false)}
            onListCreated={() => {
              // Optionally reload lists or show success
            }}
            userId={user.uid}
          />
        </>
      )}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      ...typography.h3,
      color: colors.textPrimary,
      marginHorizontal: spacing.sm,
    },
    headerSpacer: {
      width: 36,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      gap: spacing.md,
    },
    cover: {
      width: 120,
      height: 160,
      borderRadius: borderRadius.lg,
      backgroundColor: COVER_BG,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: "center",
    },
    metaBlock: {
      alignItems: "center",
      gap: 6,
    },
    title: {
      ...typography.h2,
      color: colors.textPrimary,
      textAlign: "center",
    },
    author: {
      ...typography.body,
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
    sectionTitle: {
      ...typography.h4,
      color: colors.textPrimary,
    },
    description: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    cta: {
      height: 48,
      borderRadius: 999,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
    },
    ctaText: {
      color: colors.textLight,
      fontWeight: "700",
      fontSize: 15,
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    actionButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: 6,
    },
    actionText: {
      ...typography.caption,
      color: colors.textPrimary,
      fontWeight: "600",
      textAlign: "center",
    },
  });
