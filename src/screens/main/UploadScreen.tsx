import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { uploadPDF } from "../../services/storageService";
import { addBook } from "../../services/firestoreService";
import { analyzePDFBook } from "../../services/aiPdfAnalysisService";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { UploadScreenProps } from "../../types/navigation";
import { useTranslation } from "react-i18next";

type Props = UploadScreenProps;

export const UploadScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [file, setFile] = useState<{ uri: string; name: string } | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const styles = createStyles(colors);

  useEffect(() => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to upload books", [
        { text: "Cancel", style: "cancel", onPress: () => navigation.goBack() },
        {
          text: "Sign In",
          onPress: () =>
            (navigation.getParent() as any)?.navigate("Auth", {
              screen: "SignIn",
            }),
        },
      ]);
    } else {
      setAuthor(user.displayName || "");
      setLoading(false);
    }
  }, [navigation, user]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    if (!result.canceled && result.assets[0]) {
      setFile({ uri: result.assets[0].uri, name: result.assets[0].name });
      setTitle(result.assets[0].name.replace(".pdf", ""));
    }
  };

  const handleUpload = async () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to upload books", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign In",
          onPress: () =>
            (navigation.getParent() as any)?.navigate("Auth", {
              screen: "SignIn",
            }),
        },
      ]);
      return;
    }

    if (!file || !title || !author) {
      Alert.alert("Error", "Please select a file and enter title and author");
      return;
    }

    setLoading(true);
    try {
      console.log("Starting upload...");
      console.log("File:", file);
      console.log("Title:", title);
      console.log("Author:", author);

      const pdfUrl = await uploadPDF(
        file.uri,
        file.name,
        user?.uid || "anonymous"
      );

      console.log("PDF uploaded, URL:", pdfUrl);

      const bookData = {
        title,
        author: author || "Unknown",
        description: "",
        coverUrl: "",
        pdfUrl,
        price: 0,
        category: "Uploads",
        rating: 0,
        downloads: 0,
        createdAt: new Date(),
        uploadedBy: user?.uid || "",
      };

      console.log("Adding book to Firestore:", bookData);

      const bookId = await addBook(bookData);

      console.log("Book added successfully with ID:", bookId);

      // Trigger background PDF analysis (fire and forget)
      analyzePDFBook(bookId, file.uri, title);
      console.log("Background PDF analysis started");

      Alert.alert(
        "Success",
        "Book uploaded! AI analysis is running in the background.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Error",
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("upload.title")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
          {file ? (
            <>
              <Ionicons name="document-text" size={48} color={colors.success} />
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.changeText}>Tap to change</Text>
            </>
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={64}
                color={colors.textMuted}
              />
              <Text style={styles.pickText}>{t("upload.selectFileText")}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <Input
            label={t("upload.title")}
            placeholder={t("upload.bookTitle")}
            value={title}
            style={{ marginBottom: spacing.md }}
            onChangeText={setTitle}
            leftIcon="book-outline"
          />
          <Input
            label={t("upload.author")}
            placeholder={t("upload.author")}
            value={author}
            onChangeText={setAuthor}
            leftIcon="person-outline"
          />
        </View>

        <Button
          title={t("upload.upload")}
          onPress={handleUpload}
          loading={loading}
          disabled={!file || !title || !author}
          style={styles.uploadButton}
        />
      </View>
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
    },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    content: { flex: 1, padding: spacing.lg },
    filePicker: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: colors.border,
      padding: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 180,
    },
    fileName: {
      ...typography.body,
      color: colors.textPrimary,
      marginTop: spacing.md,
    },
    changeText: { ...typography.caption, color: colors.primary },
    pickText: {
      ...typography.body,
      color: colors.textMuted,
      marginTop: spacing.md,
    },
    form: { marginTop: spacing.xl },
    uploadButton: { marginTop: spacing.xl },
  });
