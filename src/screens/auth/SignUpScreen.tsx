import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { PasswordStrengthIndicator } from "../../components/PasswordStrengthIndicator";
import { useTheme } from "../../context/ThemeContext";
import { signUpWithEmail } from "../../services/authService";
import { spacing } from "../../theme/colors";
import type { SignUpScreenProps } from "../../types/navigation";

type UserRole = "user" | "seller";

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const PRIMARY = "#8B4513";

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pwd)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(pwd)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(pwd)) return "Password must contain a number";
    if (!/[^A-Za-z0-9]/.test(pwd))
      return "Password must contain a special character";
    return null;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "Name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";

    const pwdError = validatePassword(password);
    if (!password) newErrors.password = "Password is required";
    else if (pwdError) newErrors.password = pwdError;

    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name, role);
      // after successful sign up, navigate to sign in screen
      navigation.navigate("SignIn");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Sign up failed");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY} />
        </TouchableOpacity>

        {/* Minimalist Header */}
        <View style={styles.header}>
          <View style={[styles.square, { backgroundColor: PRIMARY }]} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Create Account
          </Text>
          <View style={[styles.underline, { backgroundColor: PRIMARY }]} />
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>
            I want to:
          </Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "user" && {
                  backgroundColor: PRIMARY,
                  borderColor: PRIMARY,
                },
              ]}
              onPress={() => setRole("user")}
            >
              <Ionicons
                name="book-outline"
                size={20}
                color={role === "user" ? "#FFFFFF" : PRIMARY}
              />
              <Text
                style={[
                  styles.roleText,
                  { color: role === "user" ? "#FFFFFF" : PRIMARY },
                ]}
              >
                Read Books
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "seller" && {
                  backgroundColor: PRIMARY,
                  borderColor: PRIMARY,
                },
              ]}
              onPress={() => setRole("seller")}
            >
              <Ionicons
                name="storefront-outline"
                size={20}
                color={role === "seller" ? "#FFFFFF" : PRIMARY}
              />
              <Text
                style={[
                  styles.roleText,
                  { color: role === "seller" ? "#FFFFFF" : PRIMARY },
                ]}
              >
                Sell Books
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          <Input
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />
          <PasswordStrengthIndicator password={password} />
          <Input
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
            style={{ marginTop: spacing.lg }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={[styles.footerLink, { color: PRIMARY }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  scrollContent: { flexGrow: 1 },
  backButton: { marginTop: spacing.md, alignSelf: "flex-start" },
  header: {
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  square: { width: 4, height: 60, marginBottom: spacing.md },
  title: { fontSize: 28, fontWeight: "300", letterSpacing: 1 },
  underline: { width: 60, height: 2, marginTop: spacing.sm },
  roleContainer: { marginBottom: spacing.lg },
  roleLabel: { fontSize: 14, marginBottom: spacing.sm },
  roleButtons: { flexDirection: "row", gap: spacing.md },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#8B4513",
    gap: spacing.sm,
  },
  roleText: { fontSize: 14, fontWeight: "500" },
  form: { flex: 1 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  footerText: { fontSize: 15 },
  footerLink: { fontSize: 15, fontWeight: "600" },
});
