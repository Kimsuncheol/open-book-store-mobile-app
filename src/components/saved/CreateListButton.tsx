import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius, typography } from "../../theme/colors";

interface CreateListButtonProps {
  onPress: () => void;
  label: string;
  colors: any;
}

export const CreateListButton: React.FC<CreateListButtonProps> = ({
  onPress,
  label,
  colors,
}) => {
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.createButton} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="list-outline"
          size={20}
          color={colors.textPrimary}
          style={styles.listIcon}
        />
        <Ionicons
          name="add-outline"
          size={20}
          color={colors.textPrimary}
          style={styles.addIcon}
        />
      </View>
      <Text style={styles.createButtonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    createButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    createButtonText: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    iconContainer: {
      position: "relative",
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    listIcon: {
      position: "absolute",
      top: 0,
      left: 10,
    },
    addIcon: {
      position: "absolute",
      backgroundColor: colors.background,
      borderRadius: borderRadius.round,
      fontSize: 16,
      zIndex: 500,
      top: 2,
      left: 0,
    },
  });
