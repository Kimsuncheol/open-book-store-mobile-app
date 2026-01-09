import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/colors";

interface SavedTabViewsProps {
  activeTab: "Titles" | "Lists" | "Notebook" | "History";
  titlesView: React.ReactNode;
}

export const SavedTabViews: React.FC<SavedTabViewsProps> = ({
  activeTab,
  titlesView,
}) => {
  const { colors } = useTheme();

  if (activeTab === "Titles") {
    return <>{titlesView}</>;
  }

  const placeholders = {
    Lists: {
      icon: "list-outline",
      title: "Create your first list",
      text: "Organize saved books into themed lists you can return to later.",
    },
    Notebook: {
      icon: "bookmarks-outline",
      title: "No notes yet",
      text: "Highlights, bookmarks, and notes will show up here.",
    },
    History: {
      icon: "time-outline",
      title: "No history yet",
      text: "Continue reading to build up your history.",
    },
  } as const;

  const content = placeholders[activeTab];

  return (
    <View style={styles.placeholder}>
      <Ionicons
        name={content.icon}
        size={44}
        color={colors.textMuted}
      />
      <Text style={[styles.placeholderTitle, { color: colors.textPrimary }]}>
        {content.title}
      </Text>
      <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
        {content.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  placeholderText: {
    fontSize: 14,
    textAlign: "center",
  },
});
