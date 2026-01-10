import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../context/ThemeContext";
import type { SavedStackParamList } from "../types/navigation";

// Screen imports
import { SavedScreen } from "../screens/main/SavedScreen";

const SavedStack = createNativeStackNavigator<SavedStackParamList>();

export function SavedStackNavigator() {
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
