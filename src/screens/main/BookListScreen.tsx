import React, { useState } from "react";
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
import { Book } from "../../services/firestoreService";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BookListScreenProps } from "../../types/navigation";

type Props = BookListScreenProps;

const mockBooks: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "",
    coverUrl: "",
    pdfUrl: "",
    price: 9.99,
    category: "Fiction",
    rating: 4.5,
    downloads: 1200,
    createdAt: new Date(),
    uploadedBy: "",
  },
  {
    id: "2",
    title: "Clean Code",
    author: "Robert C. Martin",
    description: "",
    coverUrl: "",
    pdfUrl: "",
    price: 29.99,
    category: "Technology",
    rating: 4.8,
    downloads: 2500,
    createdAt: new Date(),
    uploadedBy: "",
  },
  {
    id: "3",
    title: "Atomic Habits",
    author: "James Clear",
    description: "",
    coverUrl: "",
    pdfUrl: "",
    price: 14.99,
    category: "Self-Help",
    rating: 4.9,
    downloads: 5000,
    createdAt: new Date(),
    uploadedBy: "",
  },
  {
    id: "4",
    title: "The Lean Startup",
    author: "Eric Ries",
    description: "",
    coverUrl: "",
    pdfUrl: "",
    price: 19.99,
    category: "Business",
    rating: 4.6,
    downloads: 3200,
    createdAt: new Date(),
    uploadedBy: "",
  },
];

export const BookListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const category = route.params?.category;
  const [search, setSearch] = useState("");
  const [books] = useState(
    category ? mockBooks.filter((b) => b.category === category) : mockBooks
  );

  const styles = createStyles(colors);

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  const renderBook = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => navigation.navigate("BookDetails", { bookId: item.id })}
    >
      <View style={styles.bookCover}>
        <Ionicons name="book" size={32} color={colors.primary} />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>
        <View style={styles.bookMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.accent} />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.price}>${item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
        data={filteredBooks}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No books found</Text>
        }
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.lg,
      paddingTop: spacing.xs,
    },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
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
    list: { padding: spacing.lg },
    bookItem: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
    },
    bookCover: {
      width: 60,
      height: 80,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    bookInfo: { flex: 1, marginLeft: spacing.md, justifyContent: "center" },
    bookTitle: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    bookAuthor: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 2,
    },
    bookMeta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: spacing.sm,
    },
    ratingContainer: { flexDirection: "row", alignItems: "center" },
    rating: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    price: { ...typography.body, color: colors.primary, fontWeight: "700" },
    emptyText: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: spacing.xl,
    },
  });
