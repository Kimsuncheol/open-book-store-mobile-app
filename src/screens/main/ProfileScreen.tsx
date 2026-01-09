import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { signOutUser, deleteUserAccount } from "../../services/authService";
import {
  getBookCount,
  getUserDownloadCount,
  getUserUploadCount,
} from "../../services/firestoreService";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { ProfileScreenProps } from "../../types/navigation";

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    books: 0,
    downloads: 0,
    uploads: 0,
  });

  const handleSignOut = () => {
    Alert.alert(t("auth.signOut"), "Are you sure you want to sign out?", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.signOut"),
        style: "destructive",
        onPress: () => signOutUser(),
      },
    ]);
  };

  const handleSignIn = () => {};

  const styles = createStyles(colors);

  const loadStats = useCallback(async () => {
    try {
      const [books, downloads, uploads] = await Promise.all([
        getBookCount(),
        user ? getUserDownloadCount(user.uid) : Promise.resolve(0),
        user ? getUserUploadCount(user.uid) : Promise.resolve(0),
      ]);
      setStats({ books, downloads, uploads });
    } catch (error) {
      console.error("Failed to load profile stats:", error);
    }
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const allMenuItems = [
    {
      icon: "cloud-download-outline",
      label: t("profile.myDownloads"),
      onPress: () => {
        if (!user) {
          Alert.alert(
            "Sign In Required", // TODO: Add translation
            "Please sign in to view your downloads", // TODO: Add translation
            [
              { text: t("common.cancel"), style: "cancel" },
              {
                text: t("auth.signIn"),
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
      icon: "sparkles-outline",
      label: t("navigation.subscription"),
      onPress: () => navigation.navigate("Subscription"),
    },
    {
      icon: "cloud-upload-outline",
      label: t("profile.uploadBook"),
      onPress: () => {
        if (!user) {
          Alert.alert("Sign In Required", "Please sign in to upload books", [
            { text: t("common.cancel"), style: "cancel" },
            {
              text: t("auth.signIn"),
              onPress: () =>
                (navigation.getParent() as any)?.navigate("Auth", {
                  screen: "SignIn",
                }),
            },
          ]);
          return;
        }
        navigation.navigate("DashboardTab", {
          screen: "Upload",
        });
      },
    },
    {
      icon: "settings-outline",
      label: t("navigation.settings"),
      onPress: () => navigation.navigate("Settings"),
    },
    {
      icon: "person-outline",
      label: t("profile.account"),
      onPress: () => {
        if (!user) {
          Alert.alert(
            "Sign In Required",
            "Please sign in to access account settings",
            [
              { text: t("common.cancel"), style: "cancel" },
              {
                text: t("auth.signIn"),
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>{t("navigation.profile")}</Text>
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
            <Text style={styles.statValue}>{stats.books}</Text>
            <Text style={styles.statLabel}>{t("profile.books")}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.downloads}</Text>
            <Text style={styles.statLabel}>{t("profile.downloads")}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.uploads}</Text>
            <Text style={styles.statLabel}>{t("profile.uploads")}</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {allMenuItems.map((item, index) => (
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
            title={t("auth.signOut")}
            onPress={handleSignOut}
            variant="outline"
            style={styles.signOutButton}
          />
        ) : (
          // navigate to sign in
          <Button
            title={t("auth.signIn")}
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
