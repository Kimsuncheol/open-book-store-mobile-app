import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { ThemeSelector } from "../../components/settings/ThemeSelector";
import { LanguageSelector } from "../../components/settings/LanguageSelector";
import { NotificationToggle } from "../../components/settings/NotificationToggle";
import { VersionInfo } from "../../components/settings/VersionInfo";
import { spacing, typography } from "../../theme/colors";
import type { SettingsScreenProps } from "../../types/navigation";

type Props = SettingsScreenProps;

import { useLanguage } from "../../context/LanguageContext";

// ...

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [notifications, setNotifications] = React.useState(true);

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("navigation.settings")}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ThemeSelector />
        <LanguageSelector />
        <NotificationToggle
          value={notifications}
          onValueChange={setNotifications}
        />
        <VersionInfo />
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
  });
