import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/colors";

const SCRIBD_ACCENT = "#E31226";

type PlanType = "monthly" | "annual";

interface PlanCardProps {
  type: PlanType;
  price: number;
  period: string;
  isSelected: boolean;
  onSelect: () => void;
  showSaveBadge?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  type,
  price,
  period,
  isSelected,
  onSelect,
  showSaveBadge,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        {
          backgroundColor: colors.surface,
          borderColor: isSelected ? SCRIBD_ACCENT : colors.border,
        },
        isSelected && styles.planCardSelected,
      ]}
      onPress={onSelect}
    >
      <View style={styles.planHeader}>
        <Text style={[styles.planTitle, { color: colors.textPrimary }]}>
          {type === "monthly" ? "Monthly" : "Annual"}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={SCRIBD_ACCENT} />
        )}
      </View>
      <Text style={[styles.planPrice, { color: SCRIBD_ACCENT }]}>
        ₩{price.toLocaleString()}
      </Text>
      <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>
        {period}
      </Text>
      {showSaveBadge && (
        <View style={styles.saveBadge}>
          <Text style={styles.saveText}>Save 17%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  planCard: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 2,
  },
  planCardSelected: {
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
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  planPeriod: {
    fontSize: 12,
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
});
