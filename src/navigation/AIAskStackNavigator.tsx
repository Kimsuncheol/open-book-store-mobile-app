import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../context/ThemeContext";
import type { AIAskStackParamList } from "../types/navigation";

// Screen imports
import { AIChatListScreen } from "../screens/ai/AIChatListScreen";
import { AIAskScreen } from "../screens/ai/AIAskScreen";

const AIAskStack = createNativeStackNavigator<AIAskStackParamList>();

export function AIAskStackNavigator() {
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
        component={AIChatListScreen}
        options={{ headerShown: false }}
      />
      <AIAskStack.Screen
        name="AIChatRoom"
        component={AIAskScreen as any}
        options={{ headerShown: false }}
      />
    </AIAskStack.Navigator>
  );
}
