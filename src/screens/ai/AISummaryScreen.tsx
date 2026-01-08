import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { generateSummary } from "../../services/aiService";
import { spacing, typography, borderRadius } from "../../theme/colors";
import type { AISummaryScreenProps } from "../../types/navigation";

type Props = AISummaryScreenProps;

export const AISummaryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bookId, title } = route.params;
  const { colors } = useTheme();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const styles = createStyles(colors);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const mockContent = `This is content from ${title}...`;
      const result = await generateSummary(bookId, mockContent);
      setSummary(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate summary");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.bookInfo}>
          <Ionicons name="book" size={32} color={colors.primary} />
          <Text style={styles.bookTitle}>{title}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Generating summary...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle" size={48} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={loadSummary} variant="outline" />
          </View>
        ) : (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
              <Text style={styles.summaryLabel}>Summary</Text>
            </View>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.askButton}
          onPress={() => navigation.navigate("AIAsk", { bookId, title })}
        >
          <Ionicons name="chatbubbles" size={24} color={colors.primary} />
          <Text style={styles.askButtonText}>
            Ask questions about this book
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
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
    content: { padding: spacing.lg },
    bookInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    bookTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      marginLeft: spacing.md,
      flex: 1,
    },
    loadingState: { alignItems: "center", paddingVertical: spacing.xxl },
    loadingText: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.md,
    },
    errorState: { alignItems: "center", paddingVertical: spacing.xxl },
    errorText: {
      ...typography.body,
      color: colors.error,
      marginVertical: spacing.md,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
    },
    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    summaryLabel: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
      fontWeight: "600",
    },
    summaryText: {
      ...typography.body,
      color: colors.textPrimary,
      lineHeight: 26,
    },
    askButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      marginTop: spacing.xl,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
    },
    askButtonText: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      marginLeft: spacing.md,
    },
  });
