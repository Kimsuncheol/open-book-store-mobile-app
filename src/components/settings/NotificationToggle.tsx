import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing, typography, borderRadius } from "../../theme/colors";
import { useTranslation } from "react-i18next";

interface NotificationToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const NotificationToggle: React.FC<NotificationToggleProps> = ({
  value,
  onValueChange,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        {t("settings.notifications")}
      </Text>
      <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
        <View style={styles.settingInfo}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.primary}
          />
          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
            {t("settings.pushNotifications")}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
        />
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
});
