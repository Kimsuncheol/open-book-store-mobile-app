import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useReviews } from "../../context/ReviewsContext";
import { StarRating } from "../../components/StarRating";
import { hasPurchased } from "../../services/firestoreService";
import {
  isBookDownloaded,
  downloadPDF,
  getLocalBookPath,
} from "../../services/storageService";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "BookDetails">;

// Mock book data
const mockBook = {
  id: "1",
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  description:
    "A classic novel about the American Dream, set in the Jazz Age. It follows the mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan.",
  price: 9.99,
  rating: 4.5,
  downloads: 1200,
  pages: 180,
  category: "Fiction",
  pdfUrl: "https://example.com/book.pdf",
};

export const BookDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bookId } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { getBookReviews, getAverageRating, getUserReview, deleteReview } =
    useReviews();
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const styles = createStyles(colors, insets.bottom);
  const PRIMARY = "#8B4513";

  // Get reviews data
  const reviews = getBookReviews(mockBook.id);
  const averageRating = getAverageRating(mockBook.id);
  const userReview = user?.uid ? getUserReview(mockBook.id, user.uid) : null;

  const handlePurchase = () => {
    navigation.navigate("Billing", {
      bookId: mockBook.id,
      bookTitle: mockBook.title,
      price: mockBook.price,
    });
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      await downloadPDF(mockBook.pdfUrl, mockBook.id);
      setDownloaded(true);
      Alert.alert("Success", "Book downloaded successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to download book");
    }
    setLoading(false);
  };

  const handleRead = () => {
    const filePath = getLocalBookPath(mockBook.id);
    navigation.navigate("PDFViewer", {
      bookId: mockBook.id,
      title: mockBook.title,
      filePath,
    });
  };

  const handleAISummary = () => {
    navigation.navigate("AISummary", {
      bookId: mockBook.id,
      title: mockBook.title,
    });
  };

  const handleAddToCart = () => {
    addToCart({
      id: mockBook.id,
      title: mockBook.title,
      author: mockBook.author,
      description: mockBook.description,
      price: mockBook.price,
      rating: mockBook.rating,
      downloads: mockBook.downloads,
      coverUrl: "",
      pdfUrl: mockBook.pdfUrl,
      category: mockBook.category,
      createdAt: new Date(),
      uploadedBy: "",
    });
    Alert.alert(
      "Added to Cart",
      `${mockBook.title} has been added to your cart`
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Book Cover */}
        <View style={styles.coverContainer}>
          <View style={styles.cover}>
            <Ionicons name="book" size={80} color={colors.primary} />
          </View>
        </View>

        {/* Book Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{mockBook.title}</Text>
          <Text style={styles.author}>by {mockBook.author}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color={colors.accent} />
              <Text style={styles.metaText}>{mockBook.rating}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="cloud-download"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.metaText}>{mockBook.downloads}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="document-text" size={16} color={colors.primary} />
              <Text style={styles.metaText}>{mockBook.pages} pages</Text>
            </View>
          </View>

          <Text style={styles.price}>${mockBook.price}</Text>
          <Text style={styles.description}>{mockBook.description}</Text>

          {/* AI Features */}
          <View style={styles.aiSection}>
            <TouchableOpacity style={styles.aiButton} onPress={handleAISummary}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
              <Text style={styles.aiButtonText}>AI Summary</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() =>
                navigation.navigate("AIAsk", {
                  bookId: mockBook.id,
                  title: mockBook.title,
                })
              }
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.aiButtonText}>Ask AI</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text
                style={[styles.reviewsTitle, { color: colors.textPrimary }]}
              >
                Reviews
              </Text>
              {reviews.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("BookReviews", {
                      bookId: mockBook.id,
                      bookTitle: mockBook.title,
                    })
                  }
                >
                  <Text style={[styles.seeAllText, { color: PRIMARY }]}>
                    See All ({reviews.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {reviews.length > 0 ? (
              <>
                {/* Average Rating */}
                <View
                  style={[
                    styles.avgRatingCard,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text
                    style={[
                      styles.avgRatingValue,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {averageRating.toFixed(1)}
                  </Text>
                  <StarRating rating={averageRating} size={16} />
                  <Text
                    style={[
                      styles.avgRatingText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Based on {reviews.length} reviews
                  </Text>
                </View>

                {/* Recent Reviews (max 3) */}
                {reviews.slice(0, 3).map((review) => (
                  <View
                    key={review.id}
                    style={[
                      styles.reviewItem,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <View style={styles.reviewItemHeader}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.reviewerName,
                            { color: colors.textPrimary },
                          ]}
                        >
                          {review.userName}
                        </Text>
                        <StarRating rating={review.rating} size={12} />
                      </View>

                      {/* Edit/Delete for user's review */}
                      {user?.uid === review.userId && (
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate("WriteReview", {
                                bookId: mockBook.id,
                                bookTitle: mockBook.title,
                              })
                            }
                          >
                            <Ionicons
                              name="create-outline"
                              size={18}
                              color={PRIMARY}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                "Delete Review",
                                "Are you sure you want to delete your review?",
                                [
                                  { text: "Cancel", style: "cancel" },
                                  {
                                    text: "Delete",
                                    style: "destructive",
                                    onPress: () => deleteReview(review.id),
                                  },
                                ]
                              );
                            }}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#F44336"
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.reviewText,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={3}
                    >
                      {review.text}
                    </Text>
                  </View>
                ))}
              </>
            ) : (
              <View
                style={[
                  styles.noReviewsCard,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={32}
                  color={colors.textMuted}
                />
                <Text
                  style={[styles.noReviewsText, { color: colors.textMuted }]}
                >
                  No reviews yet
                </Text>
              </View>
            )}

            {/* Write Review Button */}
            <TouchableOpacity
              style={[
                styles.writeReviewBtn,
                {
                  backgroundColor: userReview ? colors.surface : PRIMARY,
                  borderWidth: userReview ? 1 : 0,
                  borderColor: PRIMARY,
                },
              ]}
              onPress={() =>
                navigation.navigate("WriteReview", {
                  bookId: mockBook.id,
                  bookTitle: mockBook.title,
                })
              }
            >
              <Ionicons
                name={userReview ? "create" : "add-circle-outline"}
                size={20}
                color={userReview ? PRIMARY : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.writeReviewText,
                  { color: userReview ? PRIMARY : "#FFFFFF" },
                ]}
              >
                {userReview ? "Edit Your Review" : "Write a Review"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {downloaded ? (
          <Button
            title="Read Now"
            onPress={handleRead}
            style={{ flex: 1 }}
            icon={
              <Ionicons
                name="book-outline"
                size={20}
                color={colors.textLight}
              />
            }
          />
        ) : (
          <>
            <Button
              title="Add to Cart"
              onPress={handleAddToCart}
              variant="outline"
              style={{ flex: 1, marginRight: spacing.sm }}
              icon={
                <Ionicons
                  name="cart-outline"
                  size={20}
                  color={colors.primary}
                />
              }
            />
            <Button
              title={`Buy $${mockBook.price}`}
              onPress={handlePurchase}
              style={{ flex: 1 }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, bottomInset: number) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    backButton: {
      position: "absolute",
      top: spacing.xxl,
      left: spacing.lg,
      zIndex: 10,
    },
    coverContainer: {
      alignItems: "center",
      paddingTop: spacing.xxl + spacing.xl,
    },
    cover: {
      width: 180,
      height: 240,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    infoContainer: { padding: spacing.lg },
    title: { ...typography.h2, color: colors.textPrimary, textAlign: "center" },
    author: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: spacing.xs,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: spacing.lg,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: spacing.md,
    },
    metaText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    price: {
      ...typography.h2,
      color: colors.primary,
      textAlign: "center",
      marginTop: spacing.lg,
    },
    description: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.lg,
      lineHeight: 24,
    },
    aiSection: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: spacing.xl,
    },
    aiButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginHorizontal: spacing.sm,
    },
    aiButtonText: {
      ...typography.bodySmall,
      color: colors.primary,
      marginLeft: spacing.xs,
      fontWeight: "600",
    },
    reviewsSection: { marginTop: spacing.xxl },
    reviewsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    reviewsTitle: { fontSize: 20, fontWeight: "600" },
    seeAllText: { fontSize: 14, fontWeight: "500" },
    avgRatingCard: {
      padding: spacing.lg,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: spacing.md,
    },
    avgRatingValue: { fontSize: 36, fontWeight: "700" },
    avgRatingText: { fontSize: 12, marginTop: 4 },
    reviewItem: {
      padding: spacing.md,
      borderRadius: 12,
      marginBottom: spacing.sm,
    },
    reviewItemHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    reviewerName: { fontSize: 14, fontWeight: "500" },
    reviewText: { fontSize: 14, lineHeight: 20 },
    noReviewsCard: {
      padding: spacing.xl,
      borderRadius: 12,
      alignItems: "center",
    },
    noReviewsText: { marginTop: spacing.sm, fontSize: 14 },
    writeReviewBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.md,
      borderRadius: 12,
      marginTop: spacing.md,
      gap: 8,
    },
    writeReviewText: { fontSize: 14, fontWeight: "600" },
    bottomBar: {
      flexDirection: "row",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: bottomInset - 60,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
