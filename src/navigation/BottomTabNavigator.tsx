import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import type {
  BottomTabParamList,
  DashboardStackParamList,
  ProfileStackParamList,
  AIAskStackParamList,
  CartStackParamList,
} from "../types/navigation";

// Screen imports
import { DashboardScreen } from "../screens/main/DashboardScreen";
import { BookListScreen } from "../screens/main/BookListScreen";
import { BookDetailsScreen } from "../screens/main/BookDetailsScreen";
import { PDFViewerScreen } from "../screens/reader/PDFViewerScreen";
import { AISummaryScreen } from "../screens/ai/AISummaryScreen";
import { AIAskScreen } from "../screens/ai/AIAskScreen";
import { WriteReviewScreen } from "../screens/main/WriteReviewScreen";
import { BookReviewsScreen } from "../screens/main/BookReviewsScreen";
import { PollsScreen } from "../screens/main/PollsScreen";
import { DownloadsScreen } from "../screens/main/DownloadsScreen";
import { ProfileScreen } from "../screens/main/ProfileScreen";
import { SettingsScreen } from "../screens/main/SettingsScreen";
import { AccountScreen } from "../screens/main/AccountScreen";
import { CartScreen } from "../screens/main/CartScreen";
import { BillingScreen } from "../screens/billing/BillingScreen";
import { SellerDashboardScreen } from "../screens/seller/SellerDashboardScreen";
import { UploadScreen } from "../screens/main/UploadScreen";
import { MyBooksScreen } from "../screens/seller/MyBooksScreen";
import { SalesReportScreen } from "../screens/seller/SalesReportScreen";

const Tab = createBottomTabNavigator<BottomTabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const AIAskStack = createNativeStackNavigator<AIAskStackParamList>();
const CartStack = createNativeStackNavigator<CartStackParamList>();

// =============================================================================
// Dashboard Stack Navigator
// =============================================================================
function DashboardStackNavigator() {
  const { colors } = useTheme();
  const { isSeller } = useAuth();

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
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen
        name="PDFViewer"
        component={PDFViewerScreen}
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen
        name="AISummary"
        component={AISummaryScreen}
        options={{ title: "AI Summary" }}
      />
      <DashboardStack.Screen
        name="AIAsk"
        component={AIAskScreen as any}
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen
        name="WriteReview"
        component={WriteReviewScreen}
        options={{ title: "Write Review" }}
      />
      <DashboardStack.Screen
        name="BookReviews"
        component={BookReviewsScreen}
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen
        name="Polls"
        component={PollsScreen}
        options={{ headerShown: false }}
      />

      {/* Seller-only screens */}
      {isSeller && (
        <>
          <DashboardStack.Screen
            name="SellerDashboard"
            component={SellerDashboardScreen}
            options={{ headerShown: false }}
          />
          <DashboardStack.Screen
            name="Upload"
            component={UploadScreen}
            options={{ headerShown: false }}
          />
          <DashboardStack.Screen
            name="MyBooks"
            component={MyBooksScreen}
            options={{ headerShown: false }}
          />
          <DashboardStack.Screen
            name="SalesReport"
            component={SalesReportScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </DashboardStack.Navigator>
  );
}

// =============================================================================
// Profile Stack Navigator
// =============================================================================
function ProfileStackNavigator() {
  const { colors } = useTheme();

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
        name="Downloads"
        component={DownloadsScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );
}

// =============================================================================
// AIAsk Stack Navigator
// =============================================================================
function AIAskStackNavigator() {
  return (
    <AIAskStack.Navigator screenOptions={{ headerShown: false }}>
      <AIAskStack.Screen name="AIAskMain" component={AIAskScreen as any} />
    </AIAskStack.Navigator>
  );
}

// =============================================================================
// Cart Stack Navigator
// =============================================================================
function CartStackNavigator() {
  const { colors } = useTheme();

  return (
    <CartStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <CartStack.Screen
        name="CartMain"
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <CartStack.Screen
        name="Billing"
        component={BillingScreen}
        options={{ headerShown: false }}
      />
    </CartStack.Navigator>
  );
}

// =============================================================================
// Bottom Tab Navigator
// =============================================================================
export const BottomTabNavigator: React.FC = () => {
  const { colors } = useTheme();
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
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AIAskTab"
        component={AIAskStackNavigator}
        options={{
          tabBarLabel: "AI Ask",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStackNavigator}
        options={{
          tabBarLabel: "Cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
