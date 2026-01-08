import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useTheme } from "../../context/ThemeContext";
import { resetPassword } from "../../services/authService";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { ResetPasswordScreenProps } from "../../types/navigation";

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send reset email");
    }
    setLoading(false);
  };

  const styles = createStyles(colors);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      {sent ? (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a password reset link to {email}
          </Text>
          <Button
            title="Back to Sign In"
            onPress={() => navigation.navigate("SignIn")}
            style={{ marginTop: spacing.xl }}
          />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="key-outline" size={64} color={colors.primary} />
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email to receive a reset link
            </Text>
          </View>

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={error}
          />

          <Button
            title="Send Reset Link"
            onPress={handleReset}
            loading={loading}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },
    backButton: { marginTop: spacing.md },
    content: { flex: 1, justifyContent: "center" },
    successContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: { alignItems: "center", marginBottom: spacing.xl },
    title: {
      ...typography.h2,
      color: colors.textPrimary,
      marginTop: spacing.md,
      textAlign: "center",
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: "center",
    },
  });
