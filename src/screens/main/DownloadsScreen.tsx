import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  getDownloadedBooks,
  deleteDownloadedBook,
} from "../../services/storageService";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { DownloadsScreenProps } from "../../types/navigation";
import { useLanguage } from "../../context/LanguageContext";
import { getBook } from "../../services/firestoreService";
import {
  decrementUserDownloads,
  removeUserDownload,
} from "../../services/firestoreService";

type Props = DownloadsScreenProps;

export const DownloadsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<string[]>([]);
  const [downloadedBooks, setDownloadedBooks] = useState<any[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    const books = await getDownloadedBooks();
    setDownloads(books);
    const bookData = await Promise.all(
      books.map(async (id) => {
        const book = await getBook(id);
        return { id, book };
      })
    );
    setDownloadedBooks(bookData);
  };

  const handleDelete = (bookId: string) => {
    Alert.alert("Delete", "Remove this download?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDownloadedBook(bookId);
          if (user) {
            await removeUserDownload(user.uid, bookId);
            await decrementUserDownloads(user.uid);
          }
          loadDownloads();
        },
      },
    ]);
  };

  const handleOpen = () => {
    Alert.alert("Reader", "Reader screen is unavailable.");
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Auth Required State */}
      {!user ? (
        <>
          <View style={styles.header}>
            <View style={{ width: 24 }} />
            <Text style={styles.headerTitle}>{t("downloads.title")}</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.emptyState}>
            <Ionicons
              name="lock-closed-outline"
              size={64}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>
              {t("downloads.emptyDownloads")}
            </Text>
            <Text style={[styles.emptyText, { marginTop: spacing.xs }]}>
              {t("downloads.emptyDownloadsText")}
            </Text>
            <TouchableOpacity
              style={{
                marginTop: spacing.lg,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
                backgroundColor: colors.primary,
                borderRadius: borderRadius.lg,
              }}
              onPress={() =>
                (navigation.getParent() as any)?.navigate("Auth", {
                  screen: "SignIn",
                })
              }
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("downloads.title")}</Text>
            <View style={{ width: 22 }} />
          </View>

          {downloads.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="cloud-download-outline"
                size={64}
                color={colors.textMuted}
              />
              <Text style={styles.emptyText}>
                {t("downloads.emptyDownloads")}
              </Text>
            </View>
          ) : (
            <FlatList
              data={downloadedBooks}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const book = item.book;
                const title = book?.title || `Book ${item.id}`;
                const author = book?.author || "Unknown";
                const pages = book?.downloads
                  ? Math.max(12, Math.round(book.downloads / 100))
                  : 32;

                return (
                  <View style={styles.bookRow}>
                    <View style={styles.coverWrapper}>
                      <View style={styles.bookCover}>
                        <Ionicons name="book-outline" size={40} color="#111111" />
                      </View>
                      <View style={styles.formatBadge}>
                        <Text style={styles.formatText}>PDF</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.bookInfo}
                      onPress={() => handleOpen()}
                    >
                      <View style={styles.uploadedRow}>
                        <Text style={styles.uploadedLabel}>UPLOADED BY</Text>
                        <Ionicons
                          name="person"
                          size={14}
                          color={colors.textMuted}
                        />
                      </View>
                      <Text style={styles.bookTitle} numberOfLines={2}>
                        {title}
                      </Text>
                      <Text style={styles.pageCount}>{pages} pages</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0F0F0F" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    headerTitle: { ...typography.h3, color: "#FFFFFF", flex: 1 },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
    bookRow: {
      flexDirection: "row",
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: "#202020",
      gap: spacing.md,
    },
    coverWrapper: {
      width: 96,
      height: 128,
    },
    bookCover: {
      flex: 1,
      borderRadius: borderRadius.md,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#2A2A2A",
      alignItems: "center",
      justifyContent: "center",
    },
    formatBadge: {
      position: "absolute",
      right: -2,
      top: 10,
      backgroundColor: "#4A4A4A",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    formatText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
    },
    bookInfo: { flex: 1, justifyContent: "center", gap: 6 },
    uploadedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    uploadedLabel: {
      color: "#B3B3B3",
      fontSize: 12,
      letterSpacing: 1,
      fontWeight: "700",
    },
    bookTitle: {
      ...typography.h3,
      color: "#FFFFFF",
      fontWeight: "700",
    },
    pageCount: {
      ...typography.bodySmall,
      color: "#B3B3B3",
    },
    saveButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyText: {
      ...typography.body,
      color: colors.textMuted,
      marginTop: spacing.md,
    },
  });
