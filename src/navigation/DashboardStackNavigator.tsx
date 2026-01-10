import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import type { DashboardStackParamList } from "../types/navigation";

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
import { UploadScreen } from "../screens/main/UploadScreen";

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStackNavigator() {
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
