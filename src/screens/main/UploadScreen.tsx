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
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { UploadScreenProps } from "../../types/navigation";

type Props = UploadScreenProps;

export const UploadScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [file, setFile] = useState<{ uri: string; name: string } | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!file || !title) {
      Alert.alert("Error", "Please select a file and enter a title");
      return;
    }
    setLoading(true);
    try {
      const pdfUrl = await uploadPDF(
        file.uri,
        file.name,
        user?.uid || "anonymous"
      );
      await addBook({
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
      });
      Alert.alert("Success", "Book uploaded!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Upload failed");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Book</Text>
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
              <Text style={styles.pickText}>Select PDF file</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <Input
            label="Title"
            placeholder="Book title"
            value={title}
            onChangeText={setTitle}
            leftIcon="book-outline"
          />
          <Input
            label="Author"
            placeholder="Author name"
            value={author}
            onChangeText={setAuthor}
            leftIcon="person-outline"
          />
        </View>

        <Button
          title="Upload"
          onPress={handleUpload}
          loading={loading}
          disabled={!file}
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
      paddingTop: spacing.xxl,
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
