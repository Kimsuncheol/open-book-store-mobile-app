import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius, typography } from "../../theme/colors";

interface ChatSidebarSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onActionPress?: () => void;
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  colors: any;
}

export const ChatSidebarSearch: React.FC<ChatSidebarSearchProps> = ({
  value,
  onChangeText,
  placeholder,
  onActionPress,
  actionLabel,
  actionIcon = "create-outline",
  colors,
}) => {
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      {onActionPress ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onActionPress}
          accessibilityLabel={actionLabel}
        >
          <Ionicons name={actionIcon} size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.borderLight,
      borderRadius: borderRadius.round,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    input: {
      flex: 1,
      marginLeft: spacing.sm,
      paddingVertical: 0,
      ...typography.bodySmall,
      color: colors.textPrimary,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: spacing.sm,
      backgroundColor: colors.borderLight,
    },
  });
