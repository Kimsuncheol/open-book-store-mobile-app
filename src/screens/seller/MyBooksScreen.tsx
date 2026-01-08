import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { spacing } from "../../theme/colors";
import type { MyBooksScreenProps } from "../../types/navigation";

interface Book {
  id: string;
  title: string;
  price: number;
  salesCount: number;
  status: "active" | "draft";
}

export const MyBooksScreen: React.FC<MyBooksScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const PRIMARY = "#8B4513";

  useEffect(() => {
    // TODO: Fetch seller's books from Firestore
    setBooks([
      {
        id: "1",
        title: "Introduction to React Native",
        price: 19.99,
        salesCount: 45,
        status: "active",
      },
      {
        id: "2",
        title: "Advanced TypeScript Patterns",
        price: 29.99,
        salesCount: 32,
        status: "active",
      },
      {
        id: "3",
        title: "Mobile App Design Guide",
        price: 24.99,
        salesCount: 0,
        status: "draft",
      },
    ]);
    setLoading(false);
  }, []);

  const handleDelete = (bookId: string) => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setBooks(books.filter((b) => b.id !== bookId)),
      },
    ]);
  };

  const renderBook = ({ item }: { item: Book }) => (
    <View style={[styles.bookCard, { backgroundColor: colors.surface }]}>
      <View style={styles.bookInfo}>
        <Text
          style={[styles.bookTitle, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <View style={styles.bookMeta}>
          <Text style={[styles.price, { color: PRIMARY }]}>
            ${item.price.toFixed(2)}
          </Text>
          <Text style={[styles.sales, { color: colors.textSecondary }]}>
            {item.salesCount} sales
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "active" ? "#4CAF50" : "#FF9800",
              },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            navigation.navigate("BookDetails", { bookId: item.id })
          }
        >
          <Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          My Books
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Upload")}>
          <Ionicons name="add-circle" size={28} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      {books.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="library-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No Books Yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Upload your first book to start selling
          </Text>
          <TouchableOpacity
            style={[styles.uploadBtn, { backgroundColor: PRIMARY }]}
            onPress={() => navigation.navigate("Upload")}
          >
            <Text style={styles.uploadBtnText}>Upload Book</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBook}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  list: { padding: spacing.lg, gap: spacing.md },
  bookCard: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  bookInfo: { flex: 1 },
  bookTitle: { fontSize: 16, fontWeight: "500", marginBottom: 4 },
  bookMeta: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  price: { fontSize: 14, fontWeight: "600" },
  sales: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  actions: { flexDirection: "row", gap: spacing.sm },
  actionBtn: { padding: spacing.sm },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyTitle: { fontSize: 20, fontWeight: "600", marginTop: spacing.lg },
  emptyText: { fontSize: 14, marginTop: spacing.sm, textAlign: "center" },
  uploadBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  uploadBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
