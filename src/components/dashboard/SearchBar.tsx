import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/colors";
import { useTranslation } from "react-i18next";

const SCRIBD_ACCENT = "#E31226";
const SCRIBD_PAPER = "#F8F6F2";

interface SearchBarProps {
  search: string;
  onSearchChange: (text: string) => void;
  onSubmit: () => void;
  aiMode: boolean;
  onAIModeToggle: () => void;
  aiSearching: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  search,
  onSearchChange,
  onSubmit,
  aiMode,
  onAIModeToggle,
  aiSearching,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.searchContainer,
        { backgroundColor: SCRIBD_PAPER, borderColor: colors.border },
      ]}
    >
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        style={[styles.searchInput, { color: colors.textPrimary }]}
        placeholder={
          aiMode
            ? t("dashboard.searchBar.aiPlaceholder")
            : t("dashboard.searchBar.placeholder")
        }
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={onSearchChange}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      {aiSearching ? (
        <ActivityIndicator size="small" color={SCRIBD_ACCENT} />
      ) : (
        <TouchableOpacity
          onPress={onAIModeToggle}
          style={[styles.aiToggle, aiMode && styles.aiToggleActive]}
        >
          <Ionicons
            name="sparkles"
            size={18}
            color={aiMode ? SCRIBD_ACCENT : colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  aiToggle: {
    padding: spacing.xs,
    borderRadius: 8,
  },
  aiToggleActive: {
    backgroundColor: "rgba(227, 18, 38, 0.1)",
  },
});
