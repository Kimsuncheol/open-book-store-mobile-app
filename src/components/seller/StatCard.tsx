import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "../../theme/colors";

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
  colors: any;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color,
  colors,
}) => {
  const styles = createStyles(colors);

  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={28} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 12,
      alignItems: "center",
      margin: spacing.xs,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: spacing.xs,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });
