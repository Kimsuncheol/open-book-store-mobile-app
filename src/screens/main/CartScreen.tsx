import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { Button } from "../../components/Button";
import { spacing } from "../../theme/colors";
import type { CartScreenProps } from "../../types/navigation";

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useCart();
  const [paymentLoading, setPaymentLoading] = React.useState(false);

  const PRIMARY = "#8B4513";

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add items to cart before checkout");
      return;
    }

    setPaymentLoading(true);
    try {
      // TODO: Integrate PayPal payment
      Alert.alert("Success", "Payment integration coming soon!", [
        { text: "OK", onPress: () => clearCart() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Payment failed");
    }
    setPaymentLoading(false);
  };

  const renderCartItem = ({ item }: { item: (typeof cartItems)[0] }) => (
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
        <Text style={[styles.bookPrice, { color: PRIMARY }]}>
          ${item.book.price.toFixed(2)}
        </Text>
      </View>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={[
            styles.qtyButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => updateQuantity(item.book.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.quantity, { color: colors.textPrimary }]}>
          {item.quantity}
        </Text>
        <TouchableOpacity
          style={[
            styles.qtyButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => updateQuantity(item.book.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => removeFromCart(item.book.id)}
        style={styles.removeBtn}
      >
        <Ionicons name="trash-outline" size={20} color="#F44336" />
      </TouchableOpacity>
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
              Shopping Cart
            </Text>
            {cartItems.length > 0 && (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Clear Cart", "Remove all items?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Clear", style: "destructive", onPress: clearCart },
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
            {cartItems.length === 0 && <View style={{ width: 24 }} />}
          </View>

          {/* Cart Items */}
          {cartItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="cart-outline"
                size={64}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Your cart is empty
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Add some books to get started
              </Text>
              <TouchableOpacity
                style={[styles.browseBtn, { backgroundColor: PRIMARY }]}
                onPress={() =>
                  navigation.navigate("DashboardTab", {
                    screen: "BookList",
                    params: {},
                  })
                }
              >
                <Text style={styles.browseBtnText}>Browse Books</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FlatList
                data={cartItems}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.book.id}
                contentContainerStyle={styles.list}
              />

              {/* Total & Checkout */}
              <View
                style={[
                  styles.footer,
                  {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                  },
                ]}
              >
                <View style={styles.totalRow}>
                  <Text
                    style={[styles.totalLabel, { color: colors.textSecondary }]}
                  >
                    Total
                  </Text>
                  <Text
                    style={[styles.totalPrice, { color: colors.textPrimary }]}
                  >
                    ${totalPrice.toFixed(2)}
                  </Text>
                </View>
                <Button
                  title="Checkout with Toss Payments"
                  onPress={handleCheckout}
                  loading={paymentLoading}
                  icon={
                    <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                  }
                />
              </View>
            </>
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
    bookTitle: { fontSize: 14, fontWeight: "500" },
    bookAuthor: { fontSize: 12, marginTop: 2 },
    bookPrice: { fontSize: 16, fontWeight: "600", marginTop: 4 },
    quantityControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    qtyButton: {
      width: 28,
      height: 28,
      borderRadius: 6,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    quantity: {
      fontSize: 14,
      fontWeight: "500",
      minWidth: 24,
      textAlign: "center",
    },
    removeBtn: { marginLeft: spacing.sm, padding: spacing.sm },
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
    footer: { padding: spacing.lg, borderTopWidth: 1 },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    totalLabel: { fontSize: 16 },
    totalPrice: { fontSize: 24, fontWeight: "700" },
  });
