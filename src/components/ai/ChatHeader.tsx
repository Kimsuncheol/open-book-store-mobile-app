import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography } from "../../theme/colors";

interface ChatHeaderProps {
  onBack: () => void;
  onMenuPress?: () => void;
  menuLabel?: string;
  title: string;
  subtitle: string;
  colors: any;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onBack,
  onMenuPress,
  menuLabel,
  title,
  subtitle,
  colors,
}) => {
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {onMenuPress ? (
        <TouchableOpacity
          onPress={onMenuPress}
          accessibilityLabel={menuLabel}
        >
          <Ionicons name="menu" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },
    headerTitle: {
      ...typography.h3,
      color: colors.textPrimary,
    },
    headerSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });
