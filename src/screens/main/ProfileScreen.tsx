import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { signOutUser } from "../../services/authService";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "Profile">;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, isSeller } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOutUser() },
    ]);
  };

  const styles = createStyles(colors);

  const allMenuItems = [
    {
      icon: "cloud-download-outline",
      label: "My Downloads",
      onPress: () => navigation.navigate("Downloads"),
    },
    {
      icon: "card-outline",
      label: "Billing & Purchases",
      onPress: () =>
        navigation.navigate("Billing", { bookId: "", bookTitle: "", price: 0 }),
    },
    {
      icon: "cloud-upload-outline",
      label: "Upload Book",
      onPress: () => navigation.navigate("Upload"),
      sellerOnly: true, // Only show for sellers
    },
    {
      icon: "settings-outline",
      label: "Settings",
      onPress: () => navigation.navigate("Settings"),
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => !item.sellerOnly || isSeller);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={colors.textLight} />
        </View>
        <Text style={styles.name}>{user?.displayName || "Reader"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Books</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Downloads</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Purchases</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Ionicons
              name={item.icon as any}
              size={22}
              color={colors.primary}
            />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="outline"
        style={styles.signOutButton}
      />
    </ScrollView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.lg,
      paddingTop: spacing.xxl,
    },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    profileCard: { alignItems: "center", paddingVertical: spacing.xl },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      ...typography.h3,
      color: colors.textPrimary,
      marginTop: spacing.md,
    },
    email: { ...typography.body, color: colors.textSecondary },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: spacing.lg,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    statItem: { alignItems: "center" },
    statValue: { ...typography.h2, color: colors.primary },
    statLabel: { ...typography.caption, color: colors.textSecondary },
    menu: { padding: spacing.lg },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.sm,
    },
    menuLabel: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      marginLeft: spacing.md,
    },
    signOutButton: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  });
