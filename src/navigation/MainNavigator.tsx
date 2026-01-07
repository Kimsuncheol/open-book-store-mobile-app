import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
// Common Screens
import { DashboardScreen } from "../screens/main/DashboardScreen";
import { BookListScreen } from "../screens/main/BookListScreen";
import { BookDetailsScreen } from "../screens/main/BookDetailsScreen";
import { ProfileScreen } from "../screens/main/ProfileScreen";
import { SettingsScreen } from "../screens/main/SettingsScreen";
import { DownloadsScreen } from "../screens/main/DownloadsScreen";
import { BillingScreen } from "../screens/billing/BillingScreen";
import { PDFViewerScreen } from "../screens/reader/PDFViewerScreen";
import { AISummaryScreen } from "../screens/ai/AISummaryScreen";
import { AIAskScreen } from "../screens/ai/AIAskScreen";
// Seller Screens
import { UploadScreen } from "../screens/main/UploadScreen";
import { SellerDashboardScreen } from "../screens/seller/SellerDashboardScreen";
import { MyBooksScreen } from "../screens/seller/MyBooksScreen";
import { SalesReportScreen } from "../screens/seller/SalesReportScreen";
// User Feature Screens
import { WriteReviewScreen } from "../screens/main/WriteReviewScreen";
import { BookReviewsScreen } from "../screens/main/BookReviewsScreen";
import { PollsScreen } from "../screens/main/PollsScreen";
import { CartScreen } from "../screens/main/CartScreen";
import type { MainStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  const { isSeller } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Initial and Role-based Screens */}
      {isSeller ? (
        <>
          <Stack.Screen
            name="SellerDashboard"
            component={SellerDashboardScreen}
          />
          {/* Dashboard is accessible by seller too? If so, need it. If not, remove. 
              Let's assume sellers can also access the user Dashboard. 
              But we can't define it twice. 
          */}
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          {/* No SellerDashboard for regular users */}
        </>
      )}
      <Stack.Screen name="BookList" component={BookListScreen} />
      <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Downloads" component={DownloadsScreen} />
      <Stack.Screen name="Billing" component={BillingScreen} />
      <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
      <Stack.Screen name="AISummary" component={AISummaryScreen} />
      <Stack.Screen name="AIAsk" component={AIAskScreen} />

      {/* Seller-only screens */}
      {isSeller && (
        <>
          <Stack.Screen name="Upload" component={UploadScreen} />
          <Stack.Screen name="MyBooks" component={MyBooksScreen} />
          <Stack.Screen name="SalesReport" component={SalesReportScreen} />
        </>
      )}

      {/* User feature screens */}
      <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
      <Stack.Screen name="BookReviews" component={BookReviewsScreen} />
      <Stack.Screen name="Polls" component={PollsScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
};
