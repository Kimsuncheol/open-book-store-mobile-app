import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  PaymentWidgetProvider,
  usePaymentWidget,
  AgreementWidget,
  PaymentMethodWidget,
} from "@tosspayments/widget-sdk-react-native";
import type {
  AgreementWidgetControl,
  PaymentMethodWidgetControl,
} from "@tosspayments/widget-sdk-react-native";
import type { SubscriptionBillingScreenProps } from "../../types/navigation";
import { spacing, typography } from "../../theme/colors";
import { updateSubscriptionStatus } from "../../services/subscriptionService";

const SCRIBD_ACCENT = "#E31226";
const SCRIBD_PAPER = "#F8F6F2";

// Test credentials from TossPayments documentation
const TOSS_CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export const SubscriptionBillingScreen: React.FC<
  SubscriptionBillingScreenProps
> = ({ navigation, route }) => {
  const { user } = useAuth();
  const plan = (route.params as any)?.plan || "monthly";
  const amount = plan === "annual" ? 99000 : 9900;
  const planLabel = plan === "annual" ? "Annual" : "Monthly";
  // Generate customer key from user ID for TossPayments
  const customerKey = user?.uid || "guest_user";

  return (
    <PaymentWidgetProvider
      clientKey={TOSS_CLIENT_KEY}
      customerKey={customerKey}
    >
      <CheckoutPage
        navigation={navigation}
        user={user}
        plan={plan}
        amount={amount}
        planLabel={planLabel}
      />
    </PaymentWidgetProvider>
  );
};

function CheckoutPage({
  navigation,
  user,
  plan,
  amount,
  planLabel,
}: {
  navigation: any;
  user: any;
  plan: any;
  amount: number;
  planLabel: string;
}) {
  const { colors } = useTheme();
  const paymentWidgetControl = usePaymentWidget();
  const [paymentMethodWidgetControl, setPaymentMethodWidgetControl] =
    useState<PaymentMethodWidgetControl | null>(null);
  const [agreementWidgetControl, setAgreementWidgetControl] =
    useState<AgreementWidgetControl | null>(null);

  const styles = createStyles(colors);

  const handlePayment = async () => {
    if (paymentWidgetControl == null || agreementWidgetControl == null) {
      Alert.alert("Error", "Payment information is not initialized yet.");
      return;
    }

    const agreement = await agreementWidgetControl.getAgreementStatus();
    if (agreement.agreedRequiredTerms !== true) {
      Alert.alert(
        "Agreement Required",
        "Please agree to the terms to continue."
      );
      return;
    }

    const orderId = `subscription_${Date.now()}`;

    paymentWidgetControl
      .requestPayment?.({
        orderId,
        orderName: "OPENBOOK Monthly Subscription",
      })
      .then(async (result) => {
        if (result?.success) {
          // Payment success - Update subscription status
          try {
            if (user) {
              const startDate = new Date();
              const endDate = new Date();

              // Set end date based on plan
              if (plan === "annual") {
                endDate.setFullYear(endDate.getFullYear() + 1); // 1 year
              } else {
                endDate.setDate(endDate.getDate() + 30); // 30 days
              }

              await updateSubscriptionStatus(
                user.uid,
                "subscribed",
                plan,
                startDate,
                endDate,
                orderId
              );

              Alert.alert(
                "Payment Successful",
                "Your subscription has been activated!\n\nYou now have unlimited access to all books.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Navigate back to profile or dashboard
                      navigation.navigate("ProfileTab", {
                        screen: "ProfileMain",
                      });
                    },
                  },
                ]
              );
            }
          } catch (error) {
            console.error("Failed to update subscription status:", error);
            Alert.alert(
              "Warning",
              "Payment processed but there was an issue updating your subscription. Please contact support."
            );
          }
        } else if (result?.fail) {
          // Payment failed
          Alert.alert(
            "Payment Failed",
            result.fail.message || "An error occurred during payment."
          );
        }
      })
      .catch((error) => {
        Alert.alert("Payment Error", "An unexpected error occurred.");
        console.error("Payment error:", error);
      });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.backgroundAccent} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Subscription");
            }
          }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Subscription Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>OPENBOOK Monthly</Text>
            <Text style={styles.summaryPrice}>₩9,900/month</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Total Due Today</Text>
            <Text style={styles.summaryTotalPrice}>₩9,900</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.widgetContainer}>
            <PaymentMethodWidget
              selector="payment-methods"
              onLoadEnd={() => {
                paymentWidgetControl
                  .renderPaymentMethods(
                    "payment-methods",
                    { value: 9900 },
                    {
                      variantKey: "DEFAULT",
                    }
                  )
                  .then((control) => {
                    setPaymentMethodWidgetControl(control);
                  });
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Agreement</Text>
          <View style={styles.widgetContainer}>
            <AgreementWidget
              selector="agreement"
              onLoadEnd={() => {
                paymentWidgetControl
                  .renderAgreement("agreement", {
                    variantKey: "DEFAULT",
                  })
                  .then((control) => {
                    setAgreementWidgetControl(control);
                  });
              }}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text style={styles.payButtonText}>Subscribe Now</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By subscribing, you agree to automatic monthly billing. You can cancel
          anytime from your account settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

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
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.lg,
    },
    summaryCard: {
      backgroundColor: SCRIBD_PAPER,
      borderRadius: 18,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
      fontFamily: "Georgia",
      marginBottom: spacing.xs,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryLabel: {
      ...typography.body,
      color: colors.textSecondary,
    },
    summaryPrice: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.xs,
    },
    summaryTotal: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    summaryTotalPrice: {
      fontSize: 18,
      fontWeight: "700",
      color: SCRIBD_ACCENT,
    },
    section: {
      gap: spacing.sm,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.textPrimary,
      letterSpacing: 0.5,
    },
    widgetContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      minHeight: 100,
    },
    payButton: {
      backgroundColor: SCRIBD_ACCENT,
      paddingVertical: spacing.md,
      borderRadius: 999,
      alignItems: "center",
      marginTop: spacing.md,
    },
    payButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 16,
      letterSpacing: 0.4,
    },
    disclaimer: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 18,
    },
  });
