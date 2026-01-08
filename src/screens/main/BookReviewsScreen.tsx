import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
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
import { spacing } from "../../theme/colors";
import type { BookReviewsScreenProps } from "../../types/navigation";

export const BookReviewsScreen: React.FC<BookReviewsScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getBookReviews, getAverageRating, deleteReview } = useReviews();
  const { bookId, bookTitle } = route.params;

  const PRIMARY = "#8B4513";

  const reviews = getBookReviews(bookId);
  const averageRating = getAverageRating(bookId);

  const handleEdit = (reviewId: string) => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to write a review", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign In",
          onPress: () =>
            (navigation.getParent() as any)?.navigate("Auth", {
              screen: "SignIn",
            }),
        },
      ]);
      return;
    }
    navigation.navigate("WriteReview", { bookId, bookTitle });
  };

  const handleDelete = (reviewId: string) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete your review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteReview(reviewId),
        },
      ]
    );
  };

  const renderReview = ({ item }: { item: any }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
      <View style={styles.reviewHeader}>
        <View style={[styles.avatar, { backgroundColor: PRIMARY }]}>
          <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {item.userName}
          </Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {item.date}
          </Text>
        </View>
        <StarRating rating={item.rating} size={14} />
      </View>
      <Text style={[styles.reviewText, { color: colors.textSecondary }]}>
        {item.text}
      </Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.helpfulBtn}>
          <Ionicons
            name="thumbs-up-outline"
            size={16}
            color={colors.textMuted}
          />
          <Text style={[styles.helpfulText, { color: colors.textMuted }]}>
            {item.helpful} helpful
          </Text>
        </TouchableOpacity>

        {/* Show edit/delete for user's own review */}
        {user?.uid === item.userId && (
          <View style={styles.userActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleEdit(item.id)}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Reviews
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (!user) {
              Alert.alert(
                "Sign In Required",
                "Please sign in to write a review",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Sign In",
                    onPress: () =>
                      (navigation.getParent() as any)?.navigate("Auth", {
                        screen: "SignIn",
                      }),
                  },
                ]
              );
              return;
            }
            navigation.navigate("WriteReview", { bookId, bookTitle });
          }}
        >
          <Ionicons name="create-outline" size={24} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: colors.surface }]}>
        <Text style={[styles.avgRating, { color: colors.textPrimary }]}>
          {averageRating.toFixed(1)}
        </Text>
        <StarRating rating={averageRating} size={20} />
        <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
          {reviews.length} reviews
        </Text>
      </View>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: spacing.lg + insets.bottom },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="chatbubbles-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No reviews yet
            </Text>
            <TouchableOpacity
              style={[styles.writeBtn, { backgroundColor: PRIMARY }]}
              onPress={() => {
                if (!user) {
                  Alert.alert(
                    "Sign In Required",
                    "Please sign in to write a review",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Sign In",
                        onPress: () =>
                          (navigation.getParent() as any)?.navigate("Auth", {
                            screen: "SignIn",
                          }),
                      },
                    ]
                  );
                  return;
                }
                navigation.navigate("WriteReview", { bookId, bookTitle });
              }}
            >
              <Text style={styles.writeBtnText}>Be the first to review</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
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
  headerTitle: { fontSize: 18, fontWeight: "600" },
  summary: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: "center",
  },
  avgRating: { fontSize: 48, fontWeight: "700" },
  reviewCount: { fontSize: 14, marginTop: spacing.sm },
  list: { padding: spacing.lg, gap: spacing.md },
  reviewCard: { padding: spacing.md, borderRadius: 12 },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  reviewMeta: { flex: 1, marginLeft: spacing.sm },
  userName: { fontSize: 14, fontWeight: "500" },
  date: { fontSize: 12 },
  reviewText: { fontSize: 14, lineHeight: 20 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  helpfulBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  helpfulText: { fontSize: 12 },
  userActions: { flexDirection: "row", gap: spacing.sm },
  actionBtn: { padding: 4 },
  emptyState: { alignItems: "center", padding: spacing.xxl },
  emptyText: { marginTop: spacing.md, fontSize: 14 },
  writeBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  writeBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
});
