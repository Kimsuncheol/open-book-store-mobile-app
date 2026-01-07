import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import {
  getDownloadedBooks,
  deleteDownloadedBook,
  getLocalBookPath,
} from "../../services/storageService";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "Downloads">;

export const DownloadsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [downloads, setDownloads] = useState<string[]>([]);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    const books = await getDownloadedBooks();
    setDownloads(books);
  };

  const handleDelete = (bookId: string) => {
    Alert.alert("Delete", "Remove this download?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDownloadedBook(bookId);
          loadDownloads();
        },
      },
    ]);
  };

  const handleOpen = (bookId: string) => {
    const filePath = getLocalBookPath(bookId);
    navigation.navigate("PDFViewer", {
      bookId,
      title: `Book ${bookId}`,
      filePath,
    });
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Downloads</Text>
        <View style={{ width: 24 }} />
      </View>

      {downloads.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="cloud-download-outline"
            size={64}
            color={colors.textMuted}
          />
          <Text style={styles.emptyText}>No downloaded books</Text>
        </View>
      ) : (
        <FlatList
          data={downloads}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.downloadItem}>
              <TouchableOpacity
                style={styles.bookInfo}
                onPress={() => handleOpen(item)}
              >
                <View style={styles.bookIcon}>
                  <Ionicons name="book" size={24} color={colors.primary} />
                </View>
                <Text style={styles.bookTitle}>Book {item}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Ionicons name="trash-outline" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
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
      paddingTop: spacing.xxl,
    },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    list: { padding: spacing.lg },
    downloadItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.sm,
    },
    bookInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
    bookIcon: {
      width: 40,
      height: 50,
      backgroundColor: colors.background,
      borderRadius: borderRadius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    bookTitle: {
      ...typography.body,
      color: colors.textPrimary,
      marginLeft: spacing.md,
    },
    emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyText: {
      ...typography.body,
      color: colors.textMuted,
      marginTop: spacing.md,
    },
  });
