import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { spacing, typography } from "../../theme/colors";

interface DateIndicatorProps {
  date: string;
  colors: any;
}

export const DateIndicator: React.FC<DateIndicatorProps> = ({
  date,
  colors,
}) => {
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.dateText}>{date}</Text>
      <View style={styles.line} />
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dateText: {
      ...typography.caption,
      color: colors.textMuted,
      marginHorizontal: spacing.sm,
      fontWeight: "500",
    },
  });
