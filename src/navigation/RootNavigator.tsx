import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AuthNavigator } from "./AuthNavigator";
import { BottomTabNavigator } from "./BottomTabNavigator";
import type { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapper component for authenticated state
const MainWrapper: React.FC = () => {
  return <BottomTabNavigator />;
};

export const RootNavigator: React.FC = () => {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainWrapper} />
      <Stack.Screen
        name="Auth"
        component={AuthNavigator}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
};
