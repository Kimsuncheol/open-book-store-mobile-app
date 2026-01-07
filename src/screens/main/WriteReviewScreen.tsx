import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useReviews } from "../../context/ReviewsContext";
import { StarRating } from "../../components/StarRating";
import { Button } from "../../components/Button";
import { spacing } from "../../theme/colors";
import type { WriteReviewScreenProps } from "../../types/navigation";

export const WriteReviewScreen: React.FC<WriteReviewScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getUserReview, addReview, updateReview } = useReviews();
  const { bookId, bookTitle } = route.params;
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  const PRIMARY = "#8B4513";

  // Check if user already has a review
  useEffect(() => {
    if (user?.uid) {
      const userReview = getUserReview(bookId, user.uid);
      if (userReview) {
        setExistingReview(userReview);
        setRating(userReview.rating);
        setReviewText(userReview.text);
      }
    }
  }, [bookId, user]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a star rating");
      return;
    }
    if (reviewText.trim().length < 10) {
      Alert.alert("Review Too Short", "Please write at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      if (existingReview) {
        // Update existing review
        updateReview(existingReview.id, { rating, text: reviewText.trim() });
        Alert.alert("Success", "Your review has been updated!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        // Add new review
        addReview({
          bookId,
          userId: user?.uid || "anonymous",
          userName: user?.displayName || "Anonymous",
          rating,
          text: reviewText.trim(),
        });
        Alert.alert("Success", "Your review has been submitted!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to submit review");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {existingReview ? "Edit Review" : "Write Review"}
        </Text>
        <View style={{ width: 28 }} />
        </View>

        {/* Book Title */}
        <Text style={[styles.bookTitle, { color: colors.textSecondary }]}>
          {bookTitle}
        </Text>

        {/* Star Rating */}
        <View style={styles.ratingSection}>
          <Text style={[styles.ratingLabel, { color: colors.textPrimary }]}>
            Your Rating
          </Text>
          <StarRating
            rating={rating}
            size={40}
            editable
            onRatingChange={setRating}
          />
          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
            {rating === 0
              ? "Tap to rate"
              : `${rating} star${rating > 1 ? "s" : ""}`}
          </Text>
        </View>

        {/* Review Text */}
        <View style={styles.reviewSection}>
          <Text style={[styles.reviewLabel, { color: colors.textPrimary }]}>
            Your Review
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            placeholder="Share your thoughts about this book..."
            placeholderTextColor={colors.textMuted}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textMuted }]}>
            {reviewText.length} characters
          </Text>
        </View>

        {/* Submit Button */}
        <View style={{ paddingBottom: insets.bottom }}>
          <Button
            title="Submit Review"
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  content: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  bookTitle: { fontSize: 14, textAlign: "center", marginBottom: spacing.xl },
  ratingSection: { alignItems: "center", marginBottom: spacing.xl },
  ratingLabel: { fontSize: 16, fontWeight: "500", marginBottom: spacing.md },
  ratingText: { fontSize: 14, marginTop: spacing.sm },
  reviewSection: { flex: 1, marginBottom: spacing.lg },
  reviewLabel: { fontSize: 16, fontWeight: "500", marginBottom: spacing.sm },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
  },
  charCount: { fontSize: 12, textAlign: "right", marginTop: 4 },
});
