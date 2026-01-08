import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Book, getBooks } from "../../services/firestoreService";
import {
  searchBooksWithAI,
  simpleBookSearch,
  AISearchResult,
} from "../../services/aiSearchService";
import { spacing, typography } from "../../theme/colors";
import type { DashboardScreenProps } from "../../types/navigation";

type Props = DashboardScreenProps;

// Removed mock data - now fetches from Firestore

const SCRIBD_ACCENT = "#E31226";
const SCRIBD_INK = "#121212";
const SCRIBD_PAPER = "#F8F6F2";

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isSubscribed, user } = useAuth();
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Search State
  const [aiMode, setAiMode] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState<AISearchResult[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);

  const styles = createStyles(colors);

  // Fetch books from Firestore
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const fetchedBooks = await getBooks();
        setBooks(fetchedBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Handle AI Search
  const handleAiSearch = async () => {
    if (!search.trim()) {
      Alert.alert("Empty Query", "Please enter a search query");
      return;
    }

    setAiSearching(true);
    try {
      const results = await searchBooksWithAI(search, books);
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
      const fallbackResults = simpleBookSearch(search, books);
      setBooks(fallbackResults);
    }
    setAiSearching(false);
  };

  // Handle normal search
  const handleSearch = () => {
    if (aiMode) {
      handleAiSearch();
    } else {
      const filtered = simpleBookSearch(search, books);
      setBooks(filtered);
    }
  };

  const renderBook = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => navigation.navigate("BookDetails", { bookId: item.id })}
    >
      <View style={styles.bookCover}>
        <View style={styles.bookCoverAccent} />
        <Ionicons name="book-outline" size={40} color={SCRIBD_INK} />
      </View>
      <Text style={styles.bookTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>
        {item.author}
      </Text>
      <View style={styles.bookMeta}>
        <Ionicons name="star" size={12} color={SCRIBD_ACCENT} />
        <Text style={styles.rating}>{item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  const TrendingNowView: React.FC<{
    books: Book[];
    onPress: (bookId: string) => void;
  }> = ({ books: trendingBooks, onPress }) => {
    const top = trendingBooks.slice(0, 3);

    return (
      <View style={styles.trendingCard}>
        {top.map((book, index) => (
          <TouchableOpacity
            key={book.id}
            style={[
              styles.trendingRow,
              index < top.length - 1 && styles.trendingRowDivider,
            ]}
            onPress={() => onPress(book.id)}
          >
            <View style={styles.trendingRank}>
              <Text style={styles.trendingRankText}>{index + 1}</Text>
            </View>
            <View style={styles.trendingCover}>
              <View style={styles.trendingCoverAccent} />
              <Ionicons name="book-outline" size={22} color={SCRIBD_INK} />
            </View>
            <View style={styles.trendingInfo}>
              <Text style={styles.trendingTitle} numberOfLines={1}>
                {book.title}
              </Text>
              <Text style={styles.trendingAuthor} numberOfLines={1}>
                {book.author}
              </Text>
              <View style={styles.trendingMeta}>
                <Ionicons name="star" size={12} color={SCRIBD_ACCENT} />
                <Text style={styles.trendingRating}>{book.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.backgroundAccent} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={
              isDark
                ? require("../../../assets/scribd_logo_darkmode.png")
                : require("../../../assets/scribd_logo.png")
            }
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
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
            <ActivityIndicator size="small" color={SCRIBD_ACCENT} />
          ) : (
            <TouchableOpacity
              onPress={() => setAiMode(!aiMode)}
              style={[styles.aiToggle, aiMode && styles.aiToggleActive]}
            >
              <Ionicons
                name="sparkles"
                size={18}
                color={aiMode ? SCRIBD_ACCENT : colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {!isSubscribed && (
          <View style={styles.subscribeCard}>
            <View style={styles.subscribeContent}>
              <Text style={styles.subscribeEyebrow}>SUBSCRIPTION</Text>
              <Text style={styles.subscribeTitle}>Unlimited borrowing</Text>
              <Text style={styles.subscribeSubtitle}>
                Subscribe once, read everywhere with no extra cost.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => {
                if (!user) {
                  Alert.alert(
                    "Sign In Required",
                    "Please sign in to view subscription plans.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Sign In",
                        onPress: () =>
                          navigation.navigate("Auth", { screen: "SignIn" }),
                      },
                    ]
                  );
                  return;
                }
                navigation.navigate("ProfileTab", { screen: "Subscription" });
              }}
            >
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured for you</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("BookList", {})}
            >
              <Text style={styles.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={books}
            renderItem={renderBook}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.bookList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending now</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Trending")}>
              <Text style={styles.sectionLink}>More</Text>
            </TouchableOpacity>
          </View>
          <TrendingNowView
            books={[...books].reverse()}
            onPress={(bookId) => navigation.navigate("BookDetails", { bookId })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    backgroundAccent: {
      position: "absolute",
      top: -160,
      right: -120,
      width: 320,
      height: 320,
      borderRadius: 999,
      backgroundColor: SCRIBD_ACCENT,
      opacity: 0.08,
    },
    header: {
      alignItems: "flex-start",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },
    logo: {
      width: 200,
      height: 60,
      resizeMode: "cover",
      marginBottom: spacing.md,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: SCRIBD_PAPER,
      marginHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      ...typography.body,
      color: colors.textPrimary,
    },
    subscribeCard: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      padding: spacing.lg,
      borderRadius: 20,
      backgroundColor: SCRIBD_PAPER,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
    },
    subscribeContent: {
      gap: 4,
    },
    subscribeEyebrow: {
      fontSize: 11,
      letterSpacing: 1.6,
      color: colors.textMuted,
      fontWeight: "700",
    },
    subscribeTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
      fontFamily: "Georgia",
    },
    subscribeSubtitle: {
      ...typography.body,
      color: colors.textSecondary,
    },
    subscribeButton: {
      alignSelf: "flex-start",
      backgroundColor: SCRIBD_ACCENT,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 999,
    },
    subscribeButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 14,
      letterSpacing: 0.4,
    },
    sectionHeader: {
      paddingHorizontal: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      justifyContent: "space-between",
    },
    section: { paddingVertical: spacing.lg },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
      fontFamily: "Georgia",
    },
    sectionLink: {
      ...typography.bodySmall,
      color: SCRIBD_ACCENT,
      fontWeight: "600",
    },
    bookList: {
      paddingLeft: spacing.lg,
      paddingRight: spacing.lg,
    },
    bookCard: {
      width: 150,
      marginRight: spacing.md,
    },
    bookCover: {
      width: 150,
      height: 200,
      backgroundColor: SCRIBD_PAPER,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    bookCoverAccent: {
      position: "absolute",
      bottom: -40,
      right: -50,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: SCRIBD_ACCENT,
      opacity: 0.12,
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
    aiToggle: {
      padding: 8,
      borderRadius: 12,
      marginLeft: 8,
      backgroundColor: "transparent",
    },
    aiToggleActive: {
      backgroundColor: "rgba(227, 18, 38, 0.12)",
    },
    trendingCard: {
      backgroundColor: SCRIBD_PAPER,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginHorizontal: spacing.lg,
      overflow: "hidden",
    },
    trendingRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    trendingRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    trendingRank: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "rgba(227, 18, 38, 0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    trendingRankText: {
      color: SCRIBD_ACCENT,
      fontWeight: "700",
      fontSize: 12,
    },
    trendingCover: {
      width: 44,
      height: 58,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    trendingCoverAccent: {
      position: "absolute",
      bottom: -18,
      right: -18,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: SCRIBD_ACCENT,
      opacity: 0.12,
    },
    trendingInfo: {
      flex: 1,
      gap: 2,
    },
    trendingTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    trendingAuthor: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    trendingMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    trendingRating: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
