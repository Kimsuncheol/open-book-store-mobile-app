import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { spacing, typography, borderRadius } from "../../theme/colors";
import { useTranslation } from "react-i18next";

export const LanguageSelector: React.FC = () => {
  const { colors } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
        {t("settings.language")}
      </Text>
      <View style={styles.languageSelector}>
        <TouchableOpacity
          style={[
            styles.languageOption,
            { backgroundColor: colors.surface, borderColor: "transparent" },
            language === "en" && [
              styles.languageOptionActive,
              { borderColor: colors.primary, backgroundColor: colors.primary },
            ],
          ]}
          onPress={() => changeLanguage("en")}
        >
          <Text
            style={[
              styles.languageLabel,
              { color: colors.textSecondary },
              language === "en" && { color: colors.textLight },
            ]}
          >
            {t("settings.english")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.languageOption,
            { backgroundColor: colors.surface, borderColor: "transparent" },
            language === "ko" && [
              styles.languageOptionActive,
              { borderColor: colors.primary, backgroundColor: colors.primary },
            ],
          ]}
          onPress={() => changeLanguage("ko")}
        >
          <Text
            style={[
              styles.languageLabel,
              { color: colors.textSecondary },
              language === "ko" && { color: colors.textLight },
            ]}
          >
            {t("settings.korean")}
          </Text>
        </TouchableOpacity>
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
  languageSelector: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  languageOption: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  languageOptionActive: {},
  languageLabel: {
    ...typography.body,
    fontWeight: "600",
  },
});
