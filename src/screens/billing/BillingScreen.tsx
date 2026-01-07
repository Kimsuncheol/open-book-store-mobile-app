import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { getTossCheckoutHtml } from "../../services/tossPaymentsService";
import { addPurchase } from "../../services/firestoreService";
import { spacing, typography } from "../../theme/colors";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "Billing">;

export const BillingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bookId, bookTitle, price } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);

  const styles = createStyles(colors);

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "success") {
        setProcessing(true);
        await addPurchase({
          userId: user?.uid || "",
          bookId,
          amount: price,
          paymentId: data.paymentKey || data.orderId,
          purchasedAt: new Date(),
        });
        Alert.alert(
          "Success",
          "Payment completed! You can now download the book.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else if (data.type === "cancel") {
        Alert.alert("Cancelled", "Payment was cancelled.");
      } else if (data.type === "error") {
        Alert.alert(
          "Error",
          data.message || "Payment failed. Please try again."
        );
      }
    } catch (error) {
      console.error("WebView message error:", error);
    }
    setProcessing(false);
  };

  if (!bookId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Billing</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="card-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyText}>Select a book to purchase</Text>
        </View>
      </View>
    );
  }

  // Generate Toss Payments checkout HTML
  const orderId = `ORDER_${bookId}_${Date.now()}`;
  const html = getTossCheckoutHtml(price, bookTitle, orderId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>
      <WebView
        source={{ html }}
        onMessage={handleWebViewMessage}
        style={styles.webview}
        javaScriptEnabled
      />
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.lg,
      paddingTop: spacing.xxl,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    webview: { flex: 1 },
    emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyText: {
      ...typography.body,
      color: colors.textMuted,
      marginTop: spacing.md,
    },
  });
