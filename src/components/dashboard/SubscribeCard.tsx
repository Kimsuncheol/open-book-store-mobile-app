import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { spacing, typography } from "../../theme/colors";

const SCRIBD_ACCENT = "#E31226";
const SCRIBD_PAPER = "#F8F6F2";

interface SubscribeCardProps {
  onPress: () => void;
}

export const SubscribeCard: React.FC<SubscribeCardProps> = ({ onPress }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.subscribeCard,
        { backgroundColor: SCRIBD_PAPER, borderColor: colors.border },
      ]}
    >
      <View style={styles.subscribeContent}>
        <Text style={[styles.subscribeEyebrow, { color: colors.textMuted }]}>
          SUBSCRIPTION
        </Text>
        <Text style={[styles.subscribeTitle, { color: colors.textPrimary }]}>
          Unlimited borrowing
        </Text>
        <Text
          style={[styles.subscribeSubtitle, { color: colors.textSecondary }]}
        >
          Subscribe once, read everywhere with no extra cost.
        </Text>
      </View>
      <TouchableOpacity style={styles.subscribeButton} onPress={onPress}>
        <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  subscribeCard: {
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  subscribeContent: {
    gap: 4,
  },
  subscribeEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  subscribeTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Georgia",
  },
  subscribeSubtitle: {
    ...typography.body,
    marginTop: 4,
  },
  subscribeButton: {
    backgroundColor: SCRIBD_ACCENT,
    paddingVertical: spacing.sm + 2,
    borderRadius: 999,
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
