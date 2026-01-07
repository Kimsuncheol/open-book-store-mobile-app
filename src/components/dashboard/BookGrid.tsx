import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius } from "../../theme/colors";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  rating: number;
}

interface BookGridProps {
  books: Book[];
  navigation: any;
  colors: any;
}

export const BookGrid: React.FC<BookGridProps> = ({
  books,
  navigation,
  colors,
}) => {
  const styles = createStyles(colors);

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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Featured Books</Text>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.bookGrid}
        scrollEnabled={false}
      />
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    section: { padding: spacing.lg, paddingTop: 0 },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    bookGrid: { gap: spacing.md },
    bookCard: {
      flex: 1,
      margin: spacing.xs,
      alignItems: "center",
    },
    bookCover: {
      width: 140,
      height: 180,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    bookTitle: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: "600",
      marginTop: spacing.sm,
      textAlign: "center",
    },
    bookAuthor: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
    },
    bookMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.xs,
    },
    rating: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 2,
      marginRight: spacing.sm,
    },
    price: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "600",
    },
  });
