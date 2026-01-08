import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  resetPassword,
  reauthenticateUser,
  deleteUserAccount,
} from "../../services/authService";
import { Button } from "../../components/Button";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { AccountScreenProps } from "../../types/navigation";

export const AccountScreen: React.FC<AccountScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const styles = createStyles(colors);

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      Alert.alert(
        "Email Sent",
        "A password reset link has been sent to your email."
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send reset email.");
    }
  };

  const initiateOptOut = () => {
    setModalVisible(true);
  };

  const handleOptOutConfirm = async () => {
    if (!password) {
      Alert.alert("Required", "Please enter your password to confirm.");
      return;
    }

    setLoading(true);
    try {
      await reauthenticateUser(password);
      // Password verified, now delete
      setModalVisible(false);

      // Double check before final deletion
      Alert.alert(
        "Final Warning",
        "This action cannot be undone. All your data will be lost forever.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Permanently Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteUserAccount();
                // Auth state change will typically trigger a redirect,
                // but we can also show a success message if needed before unmount
              } catch (err: any) {
                Alert.alert("Delete Failed", err.message);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Verification Failed",
        "Incorrect password. Please try again."
      );
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleResetPassword}
          >
            <View style={styles.actionInfo}>
              <Ionicons name="key-outline" size={24} color={colors.primary} />
              <Text style={styles.actionLabel}>Reset Password</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>
            Danger Zone
          </Text>
          <TouchableOpacity
            style={styles.optOutButton}
            onPress={initiateOptOut}
          >
            <Text style={styles.optOutText}>Opt Out (Delete Account)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalText}>
              Please enter your password to verify your identity before deleting
              your account.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setModalVisible(false);
                  setPassword("");
                }}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Confirm"
                onPress={handleOptOutConfirm}
                loading={loading}
                style={{ flex: 1, backgroundColor: colors.error }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.lg,
      paddingTop: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    content: { padding: spacing.lg },
    section: { marginBottom: spacing.xxl },
    sectionTitle: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: "600",
      marginBottom: spacing.md,
      textTransform: "uppercase",
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
    },
    actionInfo: { flexDirection: "row", alignItems: "center" },
    actionLabel: {
      ...typography.body,
      color: colors.textPrimary,
      marginLeft: spacing.md,
    },
    optOutButton: {
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.md,
      borderRadius: borderRadius.round,
      borderWidth: 1,
      borderColor: colors.error,
      backgroundColor: "transparent",
    },
    optOutText: {
      ...typography.body,
      color: colors.error,
      fontWeight: "600",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: spacing.lg,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
      textAlign: "center",
    },
    modalText: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
      textAlign: "center",
    },
    input: {
      backgroundColor: colors.background,
      color: colors.textPrimary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.lg,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });
