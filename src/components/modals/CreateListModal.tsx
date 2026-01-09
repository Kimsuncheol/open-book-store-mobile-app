import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { createList } from "../../services/listsService";
import { spacing, borderRadius, typography } from "../../theme/colors";

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onListCreated: (listId: string, listName: string) => void;
  userId: string;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  visible,
  onClose,
  onListCreated,
  userId,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [listName, setListName] = useState("");
  const [creating, setCreating] = useState(false);
  const styles = createStyles(colors);

  const handleCreate = async () => {
    const trimmedName = listName.trim();
    if (!trimmedName) {
      Alert.alert(t("common.error"), t("lists.emptyListName"));
      return;
    }

    if (trimmedName.length > 50) {
      Alert.alert(t("common.error"), t("lists.listNameTooLong"));
      return;
    }

    setCreating(true);
    try {
      const listId = await createList(userId, trimmedName);
      onListCreated(listId, trimmedName);
      setListName("");
      onClose();
    } catch (error) {
      console.error("Failed to create list:", error);
      Alert.alert(t("common.error"), t("lists.createListError"));
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setListName("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("lists.createNewList")}</Text>
            <TouchableOpacity onPress={handleClose} disabled={creating}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder={t("lists.listNamePlaceholder")}
            placeholderTextColor={colors.textMuted}
            value={listName}
            onChangeText={setListName}
            maxLength={50}
            autoFocus
            editable={!creating}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={creating}
            >
              <Text style={[styles.buttonText, styles.cancelText]}>
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreate}
              disabled={creating || !listName.trim()}
            >
              {creating ? (
                <ActivityIndicator color={colors.textLight} size="small" />
              ) : (
                <Text style={[styles.buttonText, styles.createText]}>
                  {t("common.create")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modal: {
      width: "85%",
      maxWidth: 400,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      gap: spacing.lg,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      ...typography.h3,
      color: colors.textPrimary,
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.background,
    },
    actions: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    button: {
      flex: 1,
      height: 44,
      borderRadius: borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    createButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      ...typography.body,
      fontWeight: "600",
    },
    cancelText: {
      color: colors.textPrimary,
    },
    createText: {
      color: colors.textLight,
    },
  });
