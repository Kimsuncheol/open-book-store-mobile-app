import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import type { ProfileStackParamList } from "../types/navigation";

// Screen imports
import { ProfileScreen } from "../screens/main/ProfileScreen";
import { SettingsScreen } from "../screens/main/SettingsScreen";
import { AccountScreen } from "../screens/main/AccountScreen";
import { SubscriptionScreen } from "../screens/main/SubscriptionScreen";
import { SubscriptionBillingScreen } from "../screens/main/SubscriptionBillingScreen";
import { DownloadsScreen } from "../screens/main/DownloadsScreen";

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="Account"
        component={AccountScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="SubscriptionBilling"
        component={SubscriptionBillingScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="Downloads"
        component={DownloadsScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );
}
