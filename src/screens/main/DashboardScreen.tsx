import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  getFeaturedBooks,
  getCategories,
  Book,
} from "../../services/firestoreService";
import {
  searchBooksWithAI,
  simpleBookSearch,
  AISearchResult,
} from "../../services/aiSearchService";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { DashboardScreenProps } from "../../types/navigation";

type Props = DashboardScreenProps;

// Mock data for demo
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
];

const mockCategories = [
  "All",
  "Fiction",
  "Technology",
  "Self-Help",
  "Business",
  "Science",
];

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, isSeller } = useAuth();
  const { totalItems } = useCart();
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [categories] = useState(mockCategories);

  // AI Search State
  const [aiMode, setAiMode] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState<AISearchResult[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);

  const styles = createStyles(colors);

  // Handle AI Search
  const handleAiSearch = async () => {
    if (!search.trim()) {
      Alert.alert("Empty Query", "Please enter a search query");
      return;
    }

    setAiSearching(true);
    try {
      const results = await searchBooksWithAI(search, mockBooks);
      setAiResults(results);
      setShowAiResults(true);
    } catch (error: any) {
      console.error("AI search error:", error);
      if (error.message?.includes("API key")) {
        Alert.alert(
          "AI Search Unavailable",
          "Gemini API key not configured. Using simple search instead."
        );
      } else {
        Alert.alert("AI Search Failed", "Using simple search instead.");
      }
      // Fallback to simple search
      const fallbackResults = simpleBookSearch(search, mockBooks);
      setBooks(fallbackResults);
    }
    setAiSearching(false);
  };

  // Handle normal search
  const handleSearch = () => {
    if (aiMode) {
      handleAiSearch();
    } else {
      const filtered = simpleBookSearch(search, mockBooks);
      setBooks(filtered);
    }
  };

  const renderBook = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => navigation.navigate("BookDetails", { bookId: item.id })}
    >
      <View style={styles.bookCover}>
        <Ionicons name="book" size={40} color={colors.primary} />
      </View>
      <Text style={styles.bookTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>
        {item.author}
      </Text>
      <View style={styles.bookMeta}>
        <Ionicons name="star" size={12} color={colors.accent} />
        <Text style={styles.rating}>{item.rating}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView style={{ flex: 1 }}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={aiMode ? "Ask AI about books..." : "Search books..."}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {aiSearching ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <TouchableOpacity
              onPress={() => setAiMode(!aiMode)}
              style={[
                styles.aiToggle,
                aiMode && { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons
                name="sparkles"
                size={20}
                color={aiMode ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("BookList", {})}
          >
            <Ionicons name="library" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Browse</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("DownloadsTab", { screen: "DownloadsMain" })
            }
          >
            <Ionicons name="cloud-download" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Downloads</Text>
          </TouchableOpacity>
          {isSeller ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("SellerDashboard")}
            >
              <Ionicons name="stats-chart" size={24} color={colors.primary} />
              <Text style={styles.actionText}>Dashboard</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Polls")}
            >
              <Ionicons name="bar-chart" size={24} color={colors.primary} />
              <Text style={styles.actionText}>Polls</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                cat === "All" && { backgroundColor: colors.primary },
              ]}
              onPress={() =>
                navigation.navigate("BookList", {
                  category: cat === "All" ? undefined : cat,
                })
              }
            >
              <Text
                style={[
                  styles.categoryText,
                  cat === "All" && { color: colors.textLight },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Books */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Books</Text>
          <FlatList
            horizontal
            data={books}
            renderItem={renderBook}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.lg,
      paddingTop: spacing.xxl,
    },
    greeting: { ...typography.h2, color: colors.textPrimary },
    subtitle: { ...typography.body, color: colors.textSecondary },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      ...typography.body,
      color: colors.textPrimary,
    },
    quickActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: spacing.lg,
    },
    actionButton: {
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      width: 96,
    },
    actionText: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    categoriesContainer: {
      paddingHorizontal: spacing.lg,
      marginVertical: spacing.md,
    },
    categoryChip: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.round,
      marginRight: spacing.sm,
    },
    categoryText: { ...typography.bodySmall, color: colors.textPrimary },
    section: { padding: spacing.lg },
    sectionTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    bookCard: { width: 140, marginRight: spacing.md },
    bookCover: {
      width: 140,
      height: 180,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    bookTitle: {
      ...typography.bodySmall,
      color: colors.textPrimary,
      fontWeight: "600",
      marginTop: spacing.sm,
    },
    bookAuthor: { ...typography.caption, color: colors.textSecondary },
    bookMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.xs,
    },
    rating: {
      ...typography.caption,
      color: colors.textSecondary,
      marginLeft: 2,
      marginRight: spacing.sm,
    },
    price: {
      ...typography.bodySmall,
      color: colors.primary,
      fontWeight: "600",
    },
    badge: {
      position: "absolute",
      top: -4,
      right: -8,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    badgeText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
    },
    aiToggle: {
      padding: 8,
      borderRadius: 8,
      marginLeft: 8,
    },
  });
