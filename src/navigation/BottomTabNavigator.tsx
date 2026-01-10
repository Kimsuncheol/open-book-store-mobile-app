import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import type { BottomTabParamList } from "../types/navigation";

// Stack navigator imports
import { DashboardStackNavigator } from "./DashboardStackNavigator";
import { ProfileStackNavigator } from "./ProfileStackNavigator";
import { SavedStackNavigator } from "./SavedStackNavigator";
import { AIAskStackNavigator } from "./AIAskStackNavigator";

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          marginTop: 8,
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: t("navigation.profile"),
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="person-circle-outline"
              size={size}
              color={focused ? "#007AFF" : colors.textSecondary}
            />
          ),
        }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: t("navigation.home"),
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={focused ? "#007AFF" : colors.textSecondary}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AIAskTab"
        component={AIAskStackNavigator}
        options={{
          tabBarLabel: t("navigation.aiAsk"),
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="chatbubbles-outline"
              size={size}
              color={focused ? "#007AFF" : colors.textSecondary}
            />
          ),
        }}
      />
      <Tab.Screen
        name="SaveTab"
        component={SavedStackNavigator}
        options={{
          tabBarLabel: t("navigation.saved"),
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="bookmarks-outline"
              size={size}
              color={focused ? "#007AFF" : colors.textSecondary}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
