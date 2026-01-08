import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import type { TrendingScreenProps } from "../../types/navigation";
import { spacing } from "../../theme/colors";
import type { Book } from "../../services/firestoreService";

const SCRIBD_ACCENT = "#E31226";
const SCRIBD_INK = "#121212";
const SCRIBD_PAPER = "#F8F6F2";

const mockTrending: Book[] = [
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
    title: "Deep Work",
    author: "Cal Newport",
    description: "",
    coverUrl: "",
    pdfUrl: "",
    price: 12.99,
    category: "Business",
    rating: 4.6,
    downloads: 3100,
    createdAt: new Date(),
    uploadedBy: "",
  },
];

export const TrendingScreen: React.FC<TrendingScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.backgroundAccent} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trending now</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.trendingCard}>
          {mockTrending.map((book, index) => (
            <TouchableOpacity
              key={book.id}
              style={[
                styles.trendingRow,
                index < mockTrending.length - 1 && styles.trendingRowDivider,
              ]}
              onPress={() =>
                navigation.navigate("BookDetails", { bookId: book.id })
              }
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
              <View style={styles.trendingPrice}>
                <Text style={styles.trendingPriceText}>${book.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
      fontFamily: "Georgia",
    },
    scrollContent: {
      paddingBottom: spacing.xl,
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
    trendingPrice: {
      alignItems: "flex-end",
    },
    trendingPriceText: {
      color: SCRIBD_ACCENT,
      fontWeight: "600",
      fontSize: 13,
    },
  });
