import React, { useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
// @ts-ignore
import PDFReader from "@hashiprobr/expo-pdf-reader";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DashboardStackParamList } from "../../types/navigation";
import { useLayoutEffect } from "react";

type Props = NativeStackScreenProps<DashboardStackParamList, "PDFViewer">;

export default function PDFViewerScreen({ route, navigation }: Props) {
  const { uri, title } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (title) {
      navigation.setOptions({ title });
    }
  }, [navigation, title]);

  if (!uri) {
    return (
      <View style={styles.center}>
        <Text>PDF source not provided</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Failed to load PDF</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      ) : (
        <PDFReader
          source={{ uri }}
          style={styles.pdf}
          onLoad={() => setLoading(false)}
          onError={(err: any) => {
            setLoading(false);
            setError(err?.message || "Unknown error");
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  pdf: { flex: 1, width: "100%", height: "100%" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 8,
  },
  errorDetail: {
    color: "#666",
  },
});
