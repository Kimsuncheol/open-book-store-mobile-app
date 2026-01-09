import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useSaved } from "../../context/SavedContext";
import { Button } from "../../components/Button";
import {
  searchBooksWithAI,
  simpleBookSearch,
  AISearchResult,
} from "../../services/aiSearchService";
import { Book } from "../../services/firestoreService";
import { addUserDownload, incrementUserDownloads } from "../../services/firestoreService";
import { downloadPDF } from "../../services/storageService";
import { spacing } from "../../theme/colors";
import type { SavedScreenProps } from "../../types/navigation";
import { useLanguage } from "../../context/LanguageContext";

export const SavedScreen: React.FC<SavedScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { savedItems, removeFromSaved, clearSaved, loadSavedBooks } = useSaved();
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const { t } = useLanguage();

  // Search State
  const [search, setSearch] = React.useState("");
  const [aiMode, setAiMode] = React.useState(false);
  const [aiSearching, setAiSearching] = React.useState(false);
  const [filteredItems, setFilteredItems] = React.useState(savedItems);

  const PRIMARY = "#8B4513";

  // Update filtered items when savedItems change
  React.useEffect(() => {
    if (!search.trim()) {
      setFilteredItems(savedItems);
    }
  }, [savedItems, search]);

  React.useEffect(() => {
    if (user) {
      loadSavedBooks(user.uid).catch((error) =>
        console.error("Error loading saved books:", error)
      );
    } else {
      clearSaved();
    }
  }, [user, loadSavedBooks, clearSaved]);

  // Handle AI Search
  const handleAiSearch = async () => {
    if (!search.trim()) {
      setFilteredItems(savedItems);
      return;
    }

    setAiSearching(true);
    try {
      // Convert saved items to Book array for AI search
      const books: Book[] = savedItems.map((item) => item.book);
      const results = await searchBooksWithAI(search, books);

      // Filter saved items based on AI results
      const resultBookIds = new Set(results.map((r) => r.bookId));
      const filtered = savedItems.filter((item) =>
        resultBookIds.has(item.book.id)
      );
      setFilteredItems(filtered);
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
      const books: Book[] = savedItems.map((item) => item.book);
      const fallbackResults = simpleBookSearch(search, books);
      const filtered = savedItems.filter((item) =>
        fallbackResults.some((book) => book.id === item.book.id)
      );
      setFilteredItems(filtered);
    }
    setAiSearching(false);
  };

  // Handle normal search
  const handleSearch = () => {
    if (!search.trim()) {
      setFilteredItems(savedItems);
      return;
    }

    if (aiMode) {
      handleAiSearch();
    } else {
      const books: Book[] = savedItems.map((item) => item.book);
      const searchResults = simpleBookSearch(search, books);
      const filtered = savedItems.filter((item) =>
        searchResults.some((book) => book.id === item.book.id)
      );
      setFilteredItems(filtered);
    }
  };

  const handleDownload = async (book: Book) => {
    if (downloadingId === book.id) return;
    if (!book.pdfUrl) {
      Alert.alert("Download", "This book doesn't have a downloadable file.");
      return;
    }
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to download books.");
      return;
    }
    setDownloadingId(book.id);
    try {
      await downloadPDF(book.pdfUrl, book.id);
      await incrementUserDownloads(user.uid);
      await addUserDownload(user.uid, book.id);
      Alert.alert("Download", "Downloaded successfully.");
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert("Download", "Failed to download the book.");
    } finally {
      setDownloadingId(null);
    }
  };

  const renderSavedItem = ({ item }: { item: (typeof savedItems)[0] }) => (
    <View style={[styles.cartItem, { backgroundColor: colors.surface }]}>
      <View style={[styles.bookIcon, { backgroundColor: PRIMARY + "20" }]}>
        <Ionicons name="book-outline" size={32} color={PRIMARY} />
      </View>

      <View style={styles.itemInfo}>
        <Text
          style={[styles.bookTitle, { color: colors.textPrimary }]}
          numberOfLines={2}
        >
          {item.book.title}
        </Text>
        <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>
          {item.book.author}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.readBtn, { backgroundColor: PRIMARY }]}
            onPress={() =>
              navigation.navigate("DashboardTab", {
                screen: "PDFViewer",
                params: {
                  bookId: item.book.id,
                  title: item.book.title,
                  filePath: "", // Will be handled by PDFViewer
                },
              })
            }
          >
            <Ionicons name="book-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Read Now</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surface, borderColor: PRIMARY },
                downloadingId === item.book.id && styles.iconBtnDisabled,
              ]}
              onPress={() => handleDownload(item.book)}
              disabled={downloadingId === item.book.id}
            >
              <Ionicons name="download-outline" size={18} color={PRIMARY} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => removeFromSaved(item.book.id)}
            >
              <Ionicons
                name="bookmark"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const styles = createStyles(colors);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      {/* Auth Required State */}
      {!user ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="lock-closed-outline"
            size={64}
            color={colors.textMuted}
          />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Sign In Required
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Please sign in to access your cart
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, { backgroundColor: PRIMARY }]}
            onPress={() =>
              (navigation.getParent() as any)?.navigate("Auth", {
                screen: "SignIn",
              })
            }
          >
            <Text style={styles.browseBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ width: 24 }} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              {t("saved.title")}
            </Text>
            {savedItems.length > 0 && (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Clear Cart", "Remove all items?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear",
                      style: "destructive",
                      onPress: clearSaved,
                    },
                  ])
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            )}
            {savedItems.length === 0 && <View style={{ width: 24 }} />}
          </View>

          {/* Search Bar */}
          {savedItems.length > 0 && (
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder={
                  aiMode
                    ? "Ask AI to find items in your cart..."
                    : "Search cart items..."
                }
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={(text) => {
                  setSearch(text);
                  if (!text.trim()) {
                    setFilteredItems(savedItems);
                  }
                }}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {aiSearching ? (
                <ActivityIndicator size="small" color={PRIMARY} />
              ) : (
                <TouchableOpacity
                  onPress={() => setAiMode(!aiMode)}
                  style={[styles.aiToggle, aiMode && styles.aiToggleActive]}
                >
                  <Ionicons
                    name="sparkles"
                    size={18}
                    color={aiMode ? PRIMARY : colors.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Cart Items */}
          {savedItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="cart-outline"
                size={64}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                {t("saved.emptySaved")}
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t("saved.emptySavedText")}
              </Text>
              <TouchableOpacity
                style={[styles.browseBtn, { backgroundColor: PRIMARY }]}
                onPress={() =>
                  navigation.navigate("DashboardTab", {
                    screen: "DashboardMain",
                  })
                }
              >
                <Text style={styles.browseBtnText}>{t("saved.browseBtn")}</Text>
              </TouchableOpacity>
            </View>
          ) : filteredItems.length === 0 && search.trim() ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={64}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No Results Found
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Try adjusting your search query
              </Text>
              <TouchableOpacity
                style={[styles.browseBtn, { backgroundColor: PRIMARY }]}
                onPress={() => {
                  setSearch("");
                  setFilteredItems(savedItems);
                }}
              >
                <Text style={styles.browseBtnText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderSavedItem}
              keyExtractor={(item) => item.book.id}
              contentContainerStyle={styles.list}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.lg,
    },
    headerTitle: { fontSize: 20, fontWeight: "600" },
    list: { padding: spacing.lg, gap: spacing.md },
    cartItem: {
      flexDirection: "row",
      padding: spacing.md,
      borderRadius: 12,
      alignItems: "center",
    },
    bookIcon: {
      width: 60,
      height: 60,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    itemInfo: { flex: 1, marginLeft: spacing.md },
    bookTitle: { fontSize: 14, fontWeight: "500", marginBottom: 4 },
    bookAuthor: { fontSize: 12, marginBottom: spacing.sm },
    actionButtons: {
      marginTop: spacing.xs,
      gap: spacing.xs,
    },
    readBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      gap: 6,
    },
    secondaryActions: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    iconBtn: {
      flex: 1,
      height: 36,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    iconBtnDisabled: {
      opacity: 0.5,
    },
    actionBtnText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#FFFFFF",
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },
    emptyTitle: { fontSize: 20, fontWeight: "600", marginTop: spacing.lg },
    emptyText: { fontSize: 14, marginTop: spacing.sm, textAlign: "center" },
    browseBtn: {
      marginTop: spacing.xl,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: 12,
    },
    browseBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      fontSize: 14,
    },
    aiToggle: {
      padding: 8,
      borderRadius: 12,
      marginLeft: 8,
      backgroundColor: "transparent",
    },
    aiToggleActive: {
      backgroundColor: "rgba(139, 69, 19, 0.12)",
    },
  });
