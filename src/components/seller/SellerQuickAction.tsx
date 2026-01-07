import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "../../theme/colors";

interface SellerQuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  colors: any;
  PRIMARY: string;
}

export const SellerQuickAction: React.FC<SellerQuickActionProps> = ({
  icon,
  label,
  onPress,
  colors,
  PRIMARY,
}) => {
  const styles = createStyles(colors, PRIMARY);

  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon as any} size={24} color={PRIMARY} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

const createStyles = (colors: any, PRIMARY: string) =>
  StyleSheet.create({
    quickAction: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 12,
      marginBottom: spacing.sm,
    },
    quickIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: PRIMARY + "20",
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    quickLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: "500",
      color: colors.textPrimary,
    },
  });
