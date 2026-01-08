import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing, typography } from "../../theme/colors";
import type { PDFViewerScreenProps } from "../../types/navigation";

type Props = PDFViewerScreenProps;

export const PDFViewerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { title, filePath, bookId } = route.params;
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [nightMode, setNightMode] = useState(isDark);

  const styles = createStyles(colors);

  // Using Google Docs viewer for PDF rendering
  const pdfViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    filePath
  )}`;

  return (
    <View
      style={[
        styles.container,
        nightMode && { backgroundColor: "#1a1a1a" },
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setNightMode(!nightMode)}
            style={styles.headerButton}
          >
            <Ionicons
              name={nightMode ? "sunny" : "moon"}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("AISummary", { bookId, title })}
            style={styles.headerButton}
          >
            <Ionicons name="sparkles" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <WebView
        source={{ uri: pdfViewerUrl }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <Ionicons name="book" size={48} color={colors.primary} />
            <Text style={styles.loadingText}>Loading PDF...</Text>
          </View>
        )}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => navigation.navigate("AISummary", { bookId, title })}
        >
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.bottomButtonText}>Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => navigation.navigate("AIAsk", { bookId, title })}
        >
          <Ionicons name="chatbubbles" size={20} color="#fff" />
          <Text style={styles.bottomButtonText}>Ask AI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "rgba(0,0,0,0.8)",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xxl,
      paddingBottom: spacing.md,
    },
    headerTitle: {
      flex: 1,
      ...typography.body,
      color: "#fff",
      marginHorizontal: spacing.md,
    },
    headerActions: { flexDirection: "row" },
    headerButton: { padding: spacing.xs, marginLeft: spacing.sm },
    webview: { flex: 1 },
    loading: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
    },
    loadingText: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.md,
    },
    bottomBar: {
      flexDirection: "row",
      backgroundColor: "rgba(0,0,0,0.8)",
      padding: spacing.md,
      paddingBottom: spacing.lg,
    },
    bottomButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.sm,
    },
    bottomButtonText: {
      ...typography.bodySmall,
      color: "#fff",
      marginLeft: spacing.xs,
    },
  });
