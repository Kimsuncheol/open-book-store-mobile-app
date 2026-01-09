import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
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
import {
  searchBooksWithAI,
  simpleBookSearch,
  AISearchResult,
} from "../../services/aiSearchService";
import { spacing, typography } from "../../theme/colors";
import type { DashboardScreenProps } from "../../types/navigation";
import { useTranslation } from "react-i18next";
import { BookDetailsBottomSheet } from "./BookDetailsBottomSheet";
import { Shimmer } from "../../components/Shimmer";
import { SearchBar } from "../../components/dashboard/SearchBar";
import { AiSearchBottomSheet } from "../../components/dashboard/AiSearchBottomSheet";

type Props = DashboardScreenProps;

// Removed mock data - now fetches from Firestore

const SCRIBD_ACCENT = "#E31226";
const SCRIBD_INK = "#121212";
const SCRIBD_PAPER = "#F8F6F2";

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isSubscribed, user } = useAuth();
  const { addToSaved, removeFromSaved, savedItems } = useSaved();
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // AI Search State
  const [aiMode, setAiMode] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState<AISearchResult[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const styles = createStyles(colors);
  const feedItems = books.slice(0, 8);
  const newReleaseItems = books.slice(0, 8);
  const moreItems = books.slice(8, 16);
  const topRatedItems = [...books]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);

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
    setShowAiResults(true);
    try {
      const results = await searchBooksWithAI(search, books);
      setAiResults(results);
    } catch (error: any) {
      console.error("AI search error:", error);
      setAiResults([]);
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

  const handleAiToggle = () => {
    const nextMode = !aiMode;
    setAiMode(nextMode);
    if (!nextMode) {
      setShowAiResults(false);
    }
  };

  // Handle normal search
  const handleSearch = () => {
    if (aiMode) {
      handleAiSearch();
    } else {
      setShowAiResults(false);
      const filtered = simpleBookSearch(search, books);
      setBooks(filtered);
    }
  };

  const openBookSheet = (book: Book) => {
    setSelectedBook(book);
    setIsSheetVisible(true);
  };

  const handleSaveBook = async (book: Book) => {
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

  const renderBook = ({ item }: { item: Book }) => {
    const isSaved = savedItems.some((saved) => saved.book.id === item.id);

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => openBookSheet(item)}
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
          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaved && { backgroundColor: "rgba(227, 18, 38, 0.12)" },
            ]}
            onPress={() => handleSaveBook(item)}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={14}
              color={SCRIBD_ACCENT}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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

        <View style={styles.searchWrapper}>
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            onSubmit={handleSearch}
            aiMode={aiMode}
            onAIModeToggle={handleAiToggle}
            aiSearching={aiSearching}
          />
        </View>

        {!isSubscribed && (
          <View style={styles.subscribeCard}>
            <View style={styles.subscribeContent}>
              <Text style={styles.subscribeEyebrow}>
                {t("subscription.title")}
              </Text>
              <Text style={styles.subscribeTitle}>
                {t("subscription.unlimited")}
              </Text>
              <Text style={styles.subscribeSubtitle}>
                {t("subscription.subscribeOnce")}
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
              <Text style={styles.subscribeButtonText}>
                {t("subscription.subscribe")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shimmer style={styles.skeletonSectionTitle} />
              <Shimmer style={styles.skeletonSectionLink} />
            </View>
            <View style={styles.skeletonRow}>
              {Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={`featured-skeleton-${index}`}
                  style={styles.skeletonCard}
                >
                  <Shimmer style={styles.skeletonCover} />
                  <Shimmer style={styles.skeletonLine} />
                  <Shimmer style={styles.skeletonLineSmall} />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {t("dashboard.featuredForYou")}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("BookList", {})}
                >
                  <Text style={styles.sectionLink}>{t("dashboard.more")}</Text>
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
                <Text style={styles.sectionTitle}>
                  {t("dashboard.trendingNow")}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("BookList", {})}
                >
                  <Text style={styles.sectionLink}>{t("dashboard.more")}</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                data={[...books].reverse()}
                renderItem={renderBook}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.bookList}
                showsHorizontalScrollIndicator={false}
              />
            </View>

            {feedItems.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {t("dashboard.feed.title")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("BookList", {})}
                  >
                    <Text style={styles.sectionLink}>
                      {t("dashboard.more")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={feedItems}
                  renderItem={renderBook}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.bookList}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            {newReleaseItems.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {t("dashboard.newReleases")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("BookList", {})}
                  >
                    <Text style={styles.sectionLink}>
                      {t("dashboard.more")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={newReleaseItems}
                  renderItem={renderBook}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.bookList}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            {moreItems.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {t("dashboard.moreForYou")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("BookList", {})}
                  >
                    <Text style={styles.sectionLink}>
                      {t("dashboard.more")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={moreItems}
                  renderItem={renderBook}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.bookList}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            {topRatedItems.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {t("dashboard.topRated")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("BookList", {})}
                  >
                    <Text style={styles.sectionLink}>
                      {t("dashboard.more")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={topRatedItems}
                  renderItem={renderBook}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.bookList}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>

      <BookDetailsBottomSheet
        visible={isSheetVisible}
        book={selectedBook}
        isSaved={
          selectedBook
            ? savedItems.some((saved) => saved.book.id === selectedBook.id)
            : false
        }
        onClose={() => setIsSheetVisible(false)}
        onSave={handleSaveBook}
        onRead={(book) => {
          setIsSheetVisible(false);
          navigation.navigate("BookDetails", { bookId: book.id });
        }}
      />
      <AiSearchBottomSheet
        visible={showAiResults}
        results={aiResults}
        query={search}
        onClose={() => setShowAiResults(false)}
        onSelect={(book) => {
          setShowAiResults(false);
          openBookSheet(book);
        }}
        onSave={handleSaveBook}
        savedIds={new Set(savedItems.map((item) => item.book.id))}
      />
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
    searchWrapper: {
      marginHorizontal: spacing.md,
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
    skeletonSectionTitle: {
      width: 140,
      height: 18,
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    skeletonSectionLink: {
      width: 48,
      height: 14,
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    skeletonRow: {
      flexDirection: "row",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    skeletonCard: {
      width: 150,
      borderRadius: 18,
      backgroundColor: colors.surface,
      padding: spacing.md,
      gap: spacing.sm,
    },
    skeletonCover: {
      width: "100%",
      height: 140,
      borderRadius: 14,
      backgroundColor: colors.border,
    },
    skeletonLine: {
      width: "90%",
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.border,
    },
    skeletonLineSmall: {
      width: "60%",
      height: 10,
      borderRadius: 6,
      backgroundColor: colors.border,
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
    saveButton: {
      marginLeft: "auto",
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(227, 18, 38, 0.08)",
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
    trendingSaveButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(227, 18, 38, 0.08)",
    },
    trendingSaveButtonActive: {
      backgroundColor: "rgba(227, 18, 38, 0.16)",
    },
  });
