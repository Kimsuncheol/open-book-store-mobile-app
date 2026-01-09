import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useSaved } from "../../context/SavedContext";
import {
  addSavedBook,
  Book,
  getBooks,
  removeSavedBook,
} from "../../services/firestoreService";
import { Shimmer } from "../../components/Shimmer";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { BookListScreenProps } from "../../types/navigation";

type Props = BookListScreenProps;

export const BookListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { addToSaved, removeFromSaved, savedItems } = useSaved();
  const category = route.params?.category;
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const styles = createStyles(colors);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const fetched = await getBooks(category);
        setBooks(fetched);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [category]);

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleSave = async (book: Book) => {
    if (savingId === book.id) return;
    setSavingId(book.id);
    try {
      const isSaved = savedItems.some((saved) => saved.book.id === book.id);
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
      setSavingId(null);
    }
  };

  const renderBook = ({
    item,
  }: {
    item: Book | { id: string; skeleton: true };
  }) => {
    if ("skeleton" in item) {
      return (
        <View style={styles.bookRow}>
          <View style={styles.coverWrapper}>
            <Shimmer style={styles.skeletonCover} />
            <Shimmer style={styles.skeletonBadge} />
          </View>
          <View style={styles.bookInfo}>
            <Shimmer style={styles.skeletonLabel} />
            <Shimmer style={styles.skeletonTitle} />
            <Shimmer style={styles.skeletonMeta} />
          </View>
          <Shimmer style={styles.skeletonSave} />
        </View>
      );
    }

    const isSaved = savedItems.some((saved) => saved.book.id === item.id);
    return (
      <TouchableOpacity
        style={styles.bookRow}
        onPress={() => navigation.navigate("BookDetails", { bookId: item.id })}
      >
        <View style={styles.coverWrapper}>
          <View style={styles.bookCover}>
            <Ionicons name="book-outline" size={40} color="#111111" />
          </View>
          <View style={styles.formatBadge}>
            <Text style={styles.formatText}>PDF</Text>
          </View>
        </View>
        <View style={styles.bookInfo}>
          <View style={styles.uploadedRow}>
            <Text style={styles.uploadedLabel}>UPLOADED BY</Text>
            <Ionicons name="person" size={14} color={colors.textMuted} />
          </View>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.pageCount}>
            {item.downloads
              ? Math.max(12, Math.round(item.downloads / 100))
              : 32}{" "}
            pages
          </Text>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => handleToggleSave(item)}
          disabled={savingId === item.id}
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={isSaved ? "#FFFFFF" : colors.textMuted}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const skeletonItems = Array.from({ length: 4 }, (_, index) => ({
    id: `skeleton-${index}`,
    skeleton: true as const,
  }));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category || "All Books"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={loading ? skeletonItems : filteredBooks}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? null : <Text style={styles.emptyText}>No books found</Text>
        }
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F0F0F" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    headerTitle: { ...typography.h3, color: "#FFFFFF", flex: 1 },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#1A1A1A",
      marginHorizontal: spacing.lg,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      ...typography.body,
      color: colors.textPrimary,
    },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
    bookRow: {
      flexDirection: "row",
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: "#202020",
      gap: spacing.md,
    },
    coverWrapper: {
      width: 96,
      height: 128,
    },
    bookCover: {
      flex: 1,
      borderRadius: borderRadius.md,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#2A2A2A",
      alignItems: "center",
      justifyContent: "center",
    },
    formatBadge: {
      position: "absolute",
      right: -2,
      top: 10,
      backgroundColor: "#4A4A4A",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    formatText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
    },
    bookInfo: { flex: 1, justifyContent: "center", gap: 6 },
    uploadedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    uploadedLabel: {
      color: "#B3B3B3",
      fontSize: 12,
      letterSpacing: 1,
      fontWeight: "700",
    },
    bookTitle: {
      ...typography.h3,
      color: "#FFFFFF",
      fontWeight: "700",
    },
    pageCount: {
      ...typography.bodySmall,
      color: "#B3B3B3",
    },
    saveButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    skeletonCover: {
      width: "100%",
      height: "100%",
      borderRadius: borderRadius.md,
      backgroundColor: "#1F1F1F",
    },
    skeletonBadge: {
      position: "absolute",
      right: -2,
      top: 10,
      width: 44,
      height: 22,
      borderRadius: 4,
      backgroundColor: "#2A2A2A",
    },
    skeletonLabel: {
      width: 110,
      height: 12,
      borderRadius: 6,
      backgroundColor: "#2A2A2A",
    },
    skeletonTitle: {
      width: "85%",
      height: 18,
      borderRadius: 6,
      backgroundColor: "#1F1F1F",
    },
    skeletonMeta: {
      width: 90,
      height: 12,
      borderRadius: 6,
      backgroundColor: "#2A2A2A",
    },
    skeletonSave: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "#1F1F1F",
      alignSelf: "center",
    },
    emptyText: {
      ...typography.body,
      color: "#B3B3B3",
      textAlign: "center",
      marginTop: spacing.xl,
    },
  });
