import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { spacing } from "../../theme/colors";
import type { SellerDashboardScreenProps } from "../../types/navigation";

export const SellerDashboardScreen: React.FC<SellerDashboardScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalSales: 0,
    totalEarnings: 0,
    pendingPayouts: 0,
  });

  const PRIMARY = "#8B4513";

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch real stats from Firestore
    setStats({
      totalBooks: 5,
      totalSales: 127,
      totalEarnings: 1254.5,
      pendingPayouts: 245.0,
    });
    setRefreshing(false);
  };

  useEffect(() => {
    onRefresh();
  }, []);

  const StatCard = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: string;
    label: string;
    value: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon as any} size={28} color={color} />
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );

  const QuickAction = ({
    icon,
    label,
    onPress,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <View style={[styles.quickIcon, { backgroundColor: PRIMARY + "20" }]}>
        <Ionicons name={icon as any} size={24} color={PRIMARY} />
      </View>
      <Text style={[styles.quickLabel, { color: colors.textPrimary }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {user?.displayName || "Seller"}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="book"
            label="Total Books"
            value={stats.totalBooks.toString()}
            color={PRIMARY}
          />
          <StatCard
            icon="cart"
            label="Total Sales"
            value={stats.totalSales.toString()}
            color="#4CAF50"
          />
          <StatCard
            icon="cash"
            label="Earnings"
            value={`$${stats.totalEarnings.toFixed(2)}`}
            color="#2196F3"
          />
          <StatCard
            icon="wallet"
            label="Pending"
            value={`$${stats.pendingPayouts.toFixed(2)}`}
            color="#FF9800"
          />
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActions}>
          <QuickAction
            icon="add-circle"
            label="Upload New Book"
            onPress={() => navigation.navigate("Upload")}
          />
          <QuickAction
            icon="library"
            label="My Books"
            onPress={() => navigation.navigate("MyBooks")}
          />
          <QuickAction
            icon="stats-chart"
            label="Sales Report"
            onPress={() => navigation.navigate("SalesReport")}
          />
        </View>

        {/* Recent Sales */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Recent Sales
        </Text>
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No recent sales yet
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.lg, paddingTop: spacing.xxl },
  greeting: { fontSize: 16 },
  name: { fontSize: 28, fontWeight: "600" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    width: "47%",
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "700", marginTop: spacing.sm },
  statLabel: { fontSize: 12, marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  quickActions: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 12,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  quickLabel: { flex: 1, fontSize: 16, fontWeight: "500" },
  emptyState: {
    margin: spacing.lg,
    padding: spacing.xxl,
    borderRadius: 16,
    alignItems: "center",
  },
  emptyText: { marginTop: spacing.md, fontSize: 14 },
});
