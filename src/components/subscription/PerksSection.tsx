import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing, typography } from "../../theme/colors";

const SCRIBD_ACCENT = "#E31226";

interface Perk {
  icon: string;
  label: string;
}

interface PerksSectionProps {
  perks: Perk[];
}

export const PerksSection: React.FC<PerksSectionProps> = ({ perks }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.perksCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        What you get
      </Text>
      {perks.map((perk) => (
        <View key={perk.label} style={styles.perkRow}>
          <View style={styles.perkIcon}>
            <Ionicons name={perk.icon as any} size={18} color={SCRIBD_ACCENT} />
          </View>
          <Text style={[styles.perkText, { color: colors.textPrimary }]}>
            {perk.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  perksCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
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
  },
});
