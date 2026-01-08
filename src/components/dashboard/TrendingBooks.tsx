import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Book } from "../../services/firestoreService";
import { spacing, typography } from "../../theme/colors";

const SCRIBD_ACCENT = "#E31226";
const SCRIBD_INK = "#121212";
const SCRIBD_PAPER = "#F8F6F2";

interface TrendingBooksProps {
  books: Book[];
  onBookPress: (bookId: string) => void;
}

export const TrendingBooks: React.FC<TrendingBooksProps> = ({
  books,
  onBookPress,
}) => {
  const { colors } = useTheme();
  const topBooks = books.slice(0, 3);

  return (
    <View
      style={[
        styles.trendingCard,
        { backgroundColor: SCRIBD_PAPER, borderColor: colors.border },
      ]}
    >
      {topBooks.map((book, index) => (
        <TouchableOpacity
          key={book.id}
          style={[
            styles.trendingRow,
            index < topBooks.length - 1 && styles.trendingRowDivider,
          ]}
          onPress={() => onBookPress(book.id)}
        >
          <View style={styles.trendingRank}>
            <Text style={styles.trendingRankText}>{index + 1}</Text>
          </View>
          <View
            style={[
              styles.trendingCover,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.trendingCoverAccent} />
            <Ionicons name="book-outline" size={22} color={SCRIBD_INK} />
          </View>
          <View style={styles.trendingInfo}>
            <Text
              style={[styles.trendingTitle, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {book.title}
            </Text>
            <Text
              style={[styles.trendingAuthor, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {book.author}
            </Text>
            <View style={styles.trendingMeta}>
              <Ionicons name="star" size={12} color={SCRIBD_ACCENT} />
              <Text
                style={[styles.trendingRating, { color: colors.textSecondary }]}
              >
                {book.rating}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  trendingCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  trendingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  trendingRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  trendingRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SCRIBD_ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  trendingRankText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  trendingCover: {
    width: 50,
    height: 66,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  trendingCoverAccent: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: SCRIBD_ACCENT,
    opacity: 0.12,
  },
  trendingInfo: {
    flex: 1,
    gap: 2,
  },
  trendingTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  trendingAuthor: {
    ...typography.bodySmall,
  },
  trendingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  trendingRating: {
    fontSize: 12,
    fontWeight: "600",
  },
});
