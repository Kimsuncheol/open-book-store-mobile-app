import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Book } from "../../services/firestoreService";

const SCRIBD_ACCENT = "#E31226";
const SCRIBD_INK = "#121212";
const SCRIBD_PAPER = "#F8F6F2";

interface BookCardProps {
  book: Book;
  onPress: () => void;
  onSave: () => void;
  isSaved: boolean;
  isSaving: boolean;
  colors: any;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onPress,
  onSave,
  isSaved,
  isSaving,
  colors,
}) => {
  return (
    <TouchableOpacity style={styles.bookCard} onPress={onPress}>
      <View style={styles.bookCover}>
        <View style={styles.bookCoverAccent} />
        <Ionicons name="book-outline" size={40} color={SCRIBD_INK} />
      </View>
      <Text
        style={[styles.bookTitle, { color: colors.textPrimary }]}
        numberOfLines={2}
      >
        {book.title}
      </Text>
      <Text
        style={[styles.bookAuthor, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {book.author}
      </Text>
      <View style={styles.bookMeta}>
        <Ionicons name="star" size={12} color={SCRIBD_ACCENT} />
        <Text style={[styles.rating, { color: colors.textSecondary }]}>
          {book.rating}
        </Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            isSaved && { backgroundColor: "rgba(227, 18, 38, 0.12)" },
          ]}
          onPress={onSave}
          disabled={isSaving}
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

const styles = StyleSheet.create({
  bookCard: {
    width: 150,
    marginRight: 12,
  },
  bookCover: {
    width: 150,
    height: 200,
    backgroundColor: SCRIBD_PAPER,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8E6E3",
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
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  bookAuthor: {
    fontSize: 12,
  },
  bookMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    marginLeft: 2,
    marginRight: 8,
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
});
