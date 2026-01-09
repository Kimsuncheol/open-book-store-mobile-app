import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { getUserLists, addBookToList } from "../../services/listsService";
import { BookList } from "../../types/lists";
import { spacing, borderRadius, typography } from "../../theme/colors";

interface AddToListModalProps {
  visible: boolean;
  onClose: () => void;
  bookId: string;
  userId: string;
  onCreateNewList: () => void;
}

export const AddToListModal: React.FC<AddToListModalProps> = ({
  visible,
  onClose,
  bookId,
  userId,
  onCreateNewList,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [lists, setLists] = useState<BookList[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const styles = createStyles(colors);

  useEffect(() => {
    if (visible) {
      loadLists();
    }
  }, [visible]);

  const loadLists = async () => {
    setLoading(true);
    try {
      const userLists = await getUserLists(userId);
      setLists(userLists);
    } catch (error) {
      console.error("Failed to load lists:", error);
      Alert.alert(t("common.error"), t("lists.loadListsError"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (listId: string) => {
    setAdding(listId);
    try {
      await addBookToList(userId, listId, bookId);
      Alert.alert(t("common.success"), t("lists.bookAddedToList"));
      onClose();
    } catch (error) {
      console.error("Failed to add book to list:", error);
      Alert.alert(t("common.error"), t("lists.addToListError"));
    } finally {
      setAdding(null);
    }
  };

  const handleCreateNew = () => {
    onClose();
    onCreateNewList();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("lists.addToList")}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <ScrollView
              style={styles.listContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Create New List Option */}
              <TouchableOpacity
                style={styles.createNewItem}
                onPress={handleCreateNew}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="add" size={24} color={colors.primary} />
                </View>
                <Text style={styles.createNewText}>
                  {t("lists.createNewList")}
                </Text>
              </TouchableOpacity>

              {/* Existing Lists */}
              {lists.length > 0 && (
                <>
                  <View style={styles.divider} />
                  {lists.map((list) => {
                    const isAdding = adding === list.id;
                    const hasBook = list.bookIds.includes(bookId);

                    return (
                      <TouchableOpacity
                        key={list.id}
                        style={[
                          styles.listItem,
                          hasBook && styles.listItemDisabled,
                        ]}
                        onPress={() => handleAddToList(list.id)}
                        disabled={isAdding || hasBook}
                      >
                        <View style={styles.listInfo}>
                          <Ionicons
                            name="list-outline"
                            size={20}
                            color={colors.textSecondary}
                          />
                          <View style={styles.listText}>
                            <Text style={styles.listName}>{list.name}</Text>
                            <Text style={styles.listCount}>
                              {t("lists.itemCount", {
                                count: list.bookIds.length,
                              })}
                            </Text>
                          </View>
                        </View>
                        {isAdding ? (
                          <ActivityIndicator
                            color={colors.primary}
                            size="small"
                          />
                        ) : hasBook ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={colors.primary}
                          />
                        ) : (
                          <Ionicons
                            name="add-circle-outline"
                            size={20}
                            color={colors.textSecondary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}
            </ScrollView>
          )}
        </View>
      </View>
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
      maxHeight: "70%",
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    title: {
      ...typography.h3,
      color: colors.textPrimary,
    },
    loadingContainer: {
      paddingVertical: spacing.xl,
      alignItems: "center",
    },
    listContainer: {
      maxHeight: 400,
    },
    createNewItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    createNewText: {
      ...typography.body,
      color: colors.primary,
      fontWeight: "600",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.sm,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
    },
    listItemDisabled: {
      opacity: 0.5,
    },
    listInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      flex: 1,
    },
    listText: {
      flex: 1,
    },
    listName: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: "500",
    },
    listCount: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });
