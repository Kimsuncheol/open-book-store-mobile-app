import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import type {
  BottomTabParamList,
  DashboardStackParamList,
  ProfileStackParamList,
  SavedStackParamList,
  AIAskStackParamList,
} from "../types/navigation";

// Screen imports
import { DashboardScreen } from "../screens/main/DashboardScreen";
import { BookListScreen } from "../screens/main/BookListScreen";
import { BookDetailsScreen } from "../screens/main/BookDetailsScreen";
import { AISummaryScreen } from "../screens/ai/AISummaryScreen";
import { AIAskScreen } from "../screens/ai/AIAskScreen";
import { WriteReviewScreen } from "../screens/main/WriteReviewScreen";
import { BookReviewsScreen } from "../screens/main/BookReviewsScreen";
import { PollsScreen } from "../screens/main/PollsScreen";
import { TrendingScreen } from "../screens/main/TrendingScreen";
import { DownloadsScreen } from "../screens/main/DownloadsScreen";
import { ProfileScreen } from "../screens/main/ProfileScreen";
import { SettingsScreen } from "../screens/main/SettingsScreen";
import { AccountScreen } from "../screens/main/AccountScreen";
import { SubscriptionScreen } from "../screens/main/SubscriptionScreen";
import { SubscriptionBillingScreen } from "../screens/main/SubscriptionBillingScreen";
import { SavedScreen } from "../screens/main/SavedScreen";
import { UploadScreen } from "../screens/main/UploadScreen";

const Tab = createBottomTabNavigator<BottomTabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const SavedStack = createNativeStackNavigator<SavedStackParamList>();
const AIAskStack = createNativeStackNavigator<AIAskStackParamList>();

// =============================================================================
// Dashboard Stack Navigator
// =============================================================================
function DashboardStackNavigator() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <DashboardStack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen
        name="BookList"
        component={BookListScreen}
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen
        name="BookDetails"
        component={BookDetailsScreen}
        options={{ title: t("navigation.bookDetails"), headerShown: false }}
      />
      <DashboardStack.Screen
        name="AISummary"
        component={AISummaryScreen}
        options={{ title: t("navigation.aiSummary") }}
      />
      <DashboardStack.Screen
        name="AIAsk"
        component={AIAskScreen as any}
        options={{ title: t("navigation.aiAsk"), headerShown: false }}
      />
      <DashboardStack.Screen
        name="WriteReview"
        component={WriteReviewScreen}
        options={{ title: t("navigation.writeReview") }}
      />
      <DashboardStack.Screen
        name="BookReviews"
        component={BookReviewsScreen}
        options={{ title: t("navigation.bookReviews"), headerShown: false }}
      />
      <DashboardStack.Screen
        name="Polls"
        component={PollsScreen}
        options={{ title: t("navigation.polls"), headerShown: false }}
      />
      <DashboardStack.Screen
        name="Trending"
        component={TrendingScreen}
        options={{ title: t("navigation.trending"), headerShown: false }}
      />
      <DashboardStack.Screen
        name="Upload"
        component={UploadScreen}
        options={{ title: t("navigation.upload"), headerShown: false }}
      />
    </DashboardStack.Navigator>
  );
}

// =============================================================================
// Profile Stack Navigator
// =============================================================================
function ProfileStackNavigator() {
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

// =============================================================================
// Cart Stack Navigator
// =============================================================================
function SavedStackNavigator() {
  const { colors } = useTheme();

  return (
    <SavedStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <SavedStack.Screen
        name="SavedMain"
        component={SavedScreen}
        options={{ headerShown: false }}
      />
    </SavedStack.Navigator>
  );
}

// =============================================================================
// AI Ask Stack Navigator
// =============================================================================
function AIAskStackNavigator() {
  const { colors } = useTheme();

  return (
    <AIAskStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <AIAskStack.Screen
        name="AIAskMain"
        component={AIAskScreen as any}
        options={{ headerShown: false }}
      />
    </AIAskStack.Navigator>
  );
}

// =============================================================================
// Bottom Tab Navigator
// =============================================================================
export const BottomTabNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: t("navigation.home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AIAskTab"
        component={AIAskStackNavigator}
        options={{
          tabBarLabel: t("navigation.aiAsk"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubbles-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={SavedStackNavigator}
        options={{
          tabBarLabel: t("navigation.saved"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
