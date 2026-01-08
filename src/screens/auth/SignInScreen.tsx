import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useTheme } from "../../context/ThemeContext";
import {
  signInWithEmail,
  signInWithGoogle,
  useGoogleAuth,
} from "../../services/authService";
import { spacing } from "../../theme/colors";
import type { SignInScreenProps } from "../../types/navigation";

const REMEMBER_EMAIL_KEY = "@openBookStore:rememberedEmail";

export const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const { request, response, promptAsync } = useGoogleAuth();

  // Load remembered email on mount
  useEffect(() => {
    AsyncStorage.getItem(REMEMBER_EMAIL_KEY).then((savedEmail) => {
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    });
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle(idToken);
      // Dismiss the Auth modal after successful sign-in
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Google sign in failed");
    }
    setGoogleLoading(false);
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Save or clear remembered email
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      await signInWithEmail(email, password);
      // Dismiss the Auth modal after successful sign-in
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Sign in failed");
    }
    setLoading(false);
  };

  const PRIMARY = "#8B4513";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={
              isDark
                ? require("../../../assets/scribd_logo_darkmode.png")
                : require("../../../assets/scribd_logo.png")
            }
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        {/* Form Section */}
        <View style={styles.form}>
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

          {/* Remember Me & Forgot Password Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: PRIMARY },
                  rememberMe && { backgroundColor: PRIMARY },
                ]}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text
                style={[styles.rememberText, { color: colors.textSecondary }]}
              >
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("ResetPassword")}
            >
              <Text style={[styles.forgotText, { color: PRIMARY }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Sign In"
            onPress={handleSignIn}
            loading={loading}
            style={{ marginTop: spacing.md }}
          />

          <TouchableOpacity
            onPress={() => promptAsync()}
            disabled={!request || googleLoading}
            style={[styles.googleButton, { borderColor: PRIMARY }]}
          >
            {googleLoading ? (
              <Text style={[styles.googleText, { color: PRIMARY }]}>
                Loading...
              </Text>
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color={PRIMARY} />
                <Text style={[styles.googleText, { color: PRIMARY }]}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={[styles.footerLink, { color: PRIMARY }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginTop: spacing.xxl * 2,
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: spacing.lg,
  },
  title: { fontSize: 32, fontWeight: "300", letterSpacing: 1 },
  form: { flex: 1, minHeight: 300 },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  rememberMe: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  rememberText: { fontSize: 14 },
  forgotText: { fontSize: 14, fontWeight: "400" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  googleText: { fontSize: 16, marginLeft: spacing.sm, fontWeight: "500" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: spacing.xl,
  },
  footerText: { fontSize: 15 },
  footerLink: { fontSize: 15, fontWeight: "600" },
});
