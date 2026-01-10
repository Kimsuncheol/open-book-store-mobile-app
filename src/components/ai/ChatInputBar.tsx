import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography, borderRadius } from "../../theme/colors";
import { VoiceInputButton } from "../common/VoiceInputButton";

interface ChatInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder: string;
  loading: boolean;
  colors: any;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  value,
  onChangeText,
  onSend,
  placeholder,
  loading,
  colors,
}) => {
  const styles = createStyles(colors);

  return (
    <View style={styles.inputBar}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline
        />
        <View style={styles.inputAccessory}>
          <VoiceInputButton
            onResult={(text) => onChangeText(value ? `${value} ${text}` : text)}
            colors={colors}
            size={20}
          />
        </View>
      </View>
      <TouchableOpacity
        style={[styles.sendBtn, !value.trim() && styles.sendBtnDisabled]}
        onPress={onSend}
        disabled={!value.trim() || loading}
      >
        <Ionicons
          name="send"
          size={20}
          color={value.trim() ? colors.textLight : colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      gap: spacing.sm,
    },
    inputContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      paddingRight: spacing.xs,
    },
    input: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      maxHeight: 100,
    },
    inputAccessory: {
      paddingBottom: spacing.xs,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: {
      backgroundColor: colors.border,
    },
  });
