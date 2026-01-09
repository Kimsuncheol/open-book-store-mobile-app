import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/colors";

interface SavedTabsProps {
  tabs: readonly string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SavedTabs: React.FC<SavedTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => onTabChange(tab)}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? colors.textPrimary : colors.textMuted },
              ]}
            >
              {tab}
            </Text>
            {isActive && (
              <View
                style={[
                  styles.tabUnderline,
                  { backgroundColor: colors.textPrimary },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  tabItem: {
    paddingVertical: spacing.sm,
    flex: 1,
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  tabUnderline: {
    marginTop: spacing.xs,
    height: 2,
    width: 28,
    borderRadius: 999,
  },
});
