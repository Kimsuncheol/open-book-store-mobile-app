import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, ThemeMode } from "../../context/ThemeContext";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "Settings">;

const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "sunny" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "phone-portrait" },
];

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, themeMode, setThemeMode } = useTheme();
  const [notifications, setNotifications] = React.useState(true);

  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.themeSelector}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.themeOption,
                themeMode === option.value && styles.themeOptionActive,
              ]}
              onPress={() => setThemeMode(option.value)}
            >
              <Ionicons
                name={option.icon as any}
                size={24}
                color={
                  themeMode === option.value
                    ? colors.textLight
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.themeLabel,
                  themeMode === option.value && styles.themeLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.primary}
            />
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={colors.primary}
            />
            <Text style={styles.settingLabel}>Version</Text>
          </View>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
      </View>
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
    section: { padding: spacing.lg },
    sectionTitle: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: spacing.md,
    },
    themeSelector: { flexDirection: "row", gap: spacing.sm },
    themeOption: {
      flex: 1,
      alignItems: "center",
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: "transparent",
    },
    themeOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    themeLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    themeLabelActive: { color: colors.textLight },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
    },
    settingInfo: { flexDirection: "row", alignItems: "center" },
    settingLabel: {
      ...typography.body,
      color: colors.textPrimary,
      marginLeft: spacing.md,
    },
    versionText: { ...typography.body, color: colors.textMuted },
  });
