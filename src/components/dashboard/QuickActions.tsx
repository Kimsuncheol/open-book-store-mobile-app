import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "../../theme/colors";

interface QuickActionsProps {
  navigation: any;
  isSeller: boolean;
  colors: any;
  PRIMARY: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  navigation,
  isSeller,
  colors,
  PRIMARY,
}) => {
  const styles = createStyles(colors);

  return (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate("BookList", {})}
      >
        <Ionicons name="library" size={24} color={colors.primary} />
        <Text style={styles.actionText}>Browse</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate("Downloads")}
      >
        <Ionicons name="cloud-download" size={24} color={colors.primary} />
        <Text style={styles.actionText}>Downloads</Text>
      </TouchableOpacity>

      {isSeller ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("SellerDashboard")}
        >
          <Ionicons name="stats-chart" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Dashboard</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("Polls")}
        >
          <Ionicons name="bar-chart" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Polls</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate("Settings")}
      >
        <Ionicons name="settings" size={24} color={colors.primary} />
        <Text style={styles.actionText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    quickActions: {
      flexDirection: "row",
      justifyContent: "space-around",
      padding: spacing.md,
    },
    actionButton: {
      alignItems: "center",
      padding: spacing.sm,
    },
    actionText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });
