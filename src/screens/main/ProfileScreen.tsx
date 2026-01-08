import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { signOutUser, deleteUserAccount } from "../../services/authService";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { ProfileScreenProps } from "../../types/navigation";

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, isSeller } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOutUser() },
    ]);
  };

  const handleSignIn = () => {};

  const styles = createStyles(colors);

  const allMenuItems = [
    {
      icon: "cloud-download-outline",
      label: "My Downloads",
      onPress: () => {
        if (!user) {
          Alert.alert(
            "Sign In Required",
            "Please sign in to view your downloads",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign In",
                onPress: () =>
                  (navigation.getParent() as any)?.navigate("Auth", {
                    screen: "SignIn",
                  }),
              },
            ]
          );
          return;
        }
        navigation.navigate("Downloads");
      },
    },
    {
      icon: "card-outline",
      label: "Billing & Purchases",
      onPress: () => {
        if (!user) {
          Alert.alert(
            "Sign In Required",
            "Please sign in to view billing and purchases",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign In",
                onPress: () =>
                  (navigation.getParent() as any)?.navigate("Auth", {
                    screen: "SignIn",
                  }),
              },
            ]
          );
          return;
        }
        navigation.navigate("CartTab", {
          screen: "Billing",
          params: { bookId: "", bookTitle: "", price: 0 },
        });
      },
    },
    {
      icon: "cloud-upload-outline",
      label: "Upload Book",
      onPress: () =>
        navigation.navigate("DashboardTab", {
          screen: "Upload",
        }),
      sellerOnly: true, // Only show for sellers
    },
    {
      icon: "settings-outline",
      label: "Settings",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      icon: "person-outline",
      label: "Account",
      onPress: () => {
        if (!user) {
          Alert.alert(
            "Sign In Required",
            "Please sign in to access account settings",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign In",
                onPress: () =>
                  (navigation.getParent() as any)?.navigate("Auth", {
                    screen: "SignIn",
                  }),
              },
            ]
          );
          return;
        }
        navigation.navigate("Account");
      },
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => !item.sellerOnly || isSeller);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView>
        <View style={styles.header}>
          <View style={{ width: 24 }} />
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
        {user ? (
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            style={styles.signOutButton}
          />
        ) : (
          // navigate to sign in
          <Button
            title="Sign In"
            onPress={() =>
              (navigation.getParent() as any)?.navigate("Auth", {
                screen: "SignIn",
              })
            }
            variant="outline"
            style={styles.signInButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
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
      paddingTop: spacing.xs,
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
    signInButton: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  });
