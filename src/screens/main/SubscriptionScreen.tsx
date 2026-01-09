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
import type { SubscriptionScreenProps } from "../../types/navigation";
import { spacing, typography } from "../../theme/colors";
import { cancelSubscription } from "../../services/subscriptionService";

const SCRIBD_ACCENT = "#E31226";
const SCRIBD_PAPER = "#F8F6F2";

type PlanType = "monthly" | "annual";

import { useLanguage } from "../../context/LanguageContext";

// ...

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user, subscriptionStatus, isSubscribed } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly");
  const styles = createStyles(colors);

  const perks = [
    { icon: "library-outline", label: t("subscription.perks.unlimited") },
    { icon: "cloud-download-outline", label: t("subscription.perks.offline") },
    { icon: "sparkles-outline", label: t("subscription.perks.ai") },
    { icon: "card-outline", label: t("subscription.perks.fees") },
  ];

  const handleContinueToBilling = () => {
    if (!user) {
      Alert.alert(
        t("subscription.title"), // "Subscription" or a better title like "Sign In"
        t("auth.signIn") + " required", // Simplified for now or add key
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("auth.signIn"),
            onPress: () =>
              (navigation.getParent() as any)?.navigate("Auth", {
                screen: "SignIn",
              }),
          },
        ]
      );
      return;
    }
    navigation.navigate("SubscriptionBilling", { plan: selectedPlan } as any);
  };

  const handleCancelSubscription = () => {
    if (!user) return;

    const endDate = subscriptionStatus.endDate;
    const endDateStr = endDate ? endDate.toLocaleDateString() : "unknown";

    Alert.alert(
      t("subscription.cancelSubscription"),
      `Your subscription will remain active until ${endDateStr}.`, // TODO: localize message with interpolation
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("subscription.cancelSubscription"),
          style: "destructive",
          onPress: async () => {
            try {
              await cancelSubscription(user.uid);
              Alert.alert(
                "Subscription Cancelled", // TODO: localize
                `You'll have access until ${endDateStr}`
              );
              navigation.goBack();
            } catch (error) {
              Alert.alert(t("common.error"), "Failed to cancel subscription");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.backgroundAccent} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("ProfileMain");
            }
          }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("subscription.title")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isSubscribed && (
          <View style={styles.currentPlanCard}>
            <Text style={styles.currentPlanTitle}>
              {t("subscription.currentPlan")}
            </Text>
            <Text style={styles.currentPlanDetails}>
              {subscriptionStatus.plan === "annual"
                ? t("subscription.annual")
                : t("subscription.monthly")}{" "}
              {t("subscription.title")}
            </Text>
            {subscriptionStatus.endDate && (
              <Text style={styles.currentPlanDate}>
                {subscriptionStatus.status === "cancelled"
                  ? "Active until" // TODO: localize
                  : "Renews on"}
                : {subscriptionStatus.endDate.toLocaleDateString()}
              </Text>
            )}
            {subscriptionStatus.status !== "cancelled" && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.cancelButtonText}>
                  {t("subscription.cancelSubscription")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!isSubscribed && (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroEyebrow}>OPENBOOKSTORE</Text>
              <Text style={styles.heroTitle}>
                {t("subscription.readWithoutLimits")}
              </Text>
              <Text style={styles.heroSubtitle}>
                {t("subscription.oneSubscription")}
              </Text>
            </View>

            {/* Plan Selection */}
            <View style={styles.plansContainer}>
              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === "monthly" && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan("monthly")}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>
                    {t("subscription.monthly")}
                  </Text>
                  {selectedPlan === "monthly" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={SCRIBD_ACCENT}
                    />
                  )}
                </View>
                <Text style={styles.planPrice}>₩9,900</Text>
                <Text style={styles.planPeriod}>
                  {t("subscription.perMonth")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === "annual" && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan("annual")}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>
                    {t("subscription.annual")}
                  </Text>
                  {selectedPlan === "annual" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={SCRIBD_ACCENT}
                    />
                  )}
                </View>
                <Text style={styles.planPrice}>₩99,000</Text>
                <Text style={styles.planPeriod}>
                  {t("subscription.perYear")}
                </Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveText}>{t("subscription.save")}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.perksCard}>
              <Text style={styles.sectionTitle}>
                {t("subscription.whatYouGet")}
              </Text>
              {perks.map((perk) => (
                <View key={perk.label} style={styles.perkRow}>
                  <View style={styles.perkIcon}>
                    <Ionicons
                      name={perk.icon as any}
                      size={18}
                      color={SCRIBD_ACCENT}
                    />
                  </View>
                  <Text style={styles.perkText}>{perk.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleContinueToBilling}
            >
              <Text style={styles.ctaButtonText}>
                {t("subscription.continueToBilling")}
              </Text>
            </TouchableOpacity>
            <Text style={styles.disclaimer}>
              {t("subscription.disclaimer", {
                plan:
                  selectedPlan === "monthly"
                    ? t("subscription.monthly")
                    : t("subscription.annual"),
              })}
            </Text>
          </>
        )}
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
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.lg,
    },
    currentPlanCard: {
      backgroundColor: SCRIBD_PAPER,
      borderRadius: 18,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currentPlanTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.textMuted,
      letterSpacing: 1,
    },
    currentPlanDetails: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: spacing.xs,
    },
    currentPlanDate: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    cancelButton: {
      marginTop: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: "center",
    },
    cancelButtonText: {
      color: SCRIBD_ACCENT,
      fontWeight: "600",
      fontSize: 14,
    },
    heroCard: {
      backgroundColor: SCRIBD_PAPER,
      borderRadius: 22,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    heroEyebrow: {
      fontSize: 11,
      letterSpacing: 2,
      color: colors.textMuted,
      fontWeight: "700",
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
      fontFamily: "Georgia",
    },
    heroSubtitle: {
      ...typography.body,
      color: colors.textSecondary,
    },
    plansContainer: {
      flexDirection: "row",
      gap: spacing.md,
    },
    planCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.md,
      borderWidth: 2,
      borderColor: colors.border,
    },
    planCardSelected: {
      borderColor: SCRIBD_ACCENT,
      backgroundColor: "rgba(227, 18, 38, 0.05)",
    },
    planHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    planTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    planPrice: {
      fontSize: 24,
      fontWeight: "700",
      color: SCRIBD_ACCENT,
      marginTop: spacing.sm,
    },
    planPeriod: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    saveBadge: {
      alignSelf: "flex-start",
      backgroundColor: SCRIBD_ACCENT,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
      marginTop: spacing.sm,
    },
    saveText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    perksCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.md,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
      fontFamily: "Georgia",
    },
    perkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    perkIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(227, 18, 38, 0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    perkText: {
      ...typography.body,
      color: colors.textPrimary,
    },
    ctaButton: {
      backgroundColor: SCRIBD_ACCENT,
      paddingVertical: spacing.md,
      borderRadius: 999,
      alignItems: "center",
    },
    ctaButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 16,
      letterSpacing: 0.4,
    },
    disclaimer: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "center",
    },
  });
