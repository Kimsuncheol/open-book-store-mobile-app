import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, ThemeMode } from "../../context/ThemeContext";
import { spacing, typography, borderRadius } from "../../theme/colors";

const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "sunny" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "phone-portrait" },
];

export const ThemeSelector: React.FC = () => {
  const { colors, themeMode, setThemeMode } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        Appearance
      </Text>
      <View style={styles.themeSelector}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            accessibilityRole="button"
            style={[
              styles.themeOption,
              { backgroundColor: colors.surface, borderColor: "transparent" },
              themeMode === option.value && [
                styles.themeOptionActive,
                {
                  borderColor: colors.primary,
                  backgroundColor: colors.primary,
                },
              ],
            ]}
            onPress={() => setThemeMode(option.value)}
          >
            <Ionicons
              name={option.icon as any}
              size={24}
              color={
                themeMode === option.value
                  ? colors.textLight
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.themeLabel,
                { color: colors.textSecondary },
                themeMode === option.value && { color: colors.textLight },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  themeSelector: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  themeOptionActive: {},
  themeLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
