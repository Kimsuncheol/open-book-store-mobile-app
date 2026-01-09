import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing, typography, borderRadius } from "../../theme/colors";
import { useTranslation } from "react-i18next";

export const VersionInfo: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        {t("settings.about")}
      </Text>
      <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
        <View style={styles.settingInfo}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={colors.primary}
          />
          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
            {t("settings.version")}
          </Text>
        </View>
        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          1.0.0
        </Text>
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    ...typography.body,
    marginLeft: spacing.md,
  },
  versionText: {
    ...typography.body,
  },
});
