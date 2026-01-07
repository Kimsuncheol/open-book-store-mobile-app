import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { spacing } from "../../theme/colors";
import type { SalesReportScreenProps } from "../../types/navigation";

interface Sale {
  id: string;
  bookTitle: string;
  buyerName: string;
  amount: number;
  date: string;
}

export const SalesReportScreen: React.FC<SalesReportScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const PRIMARY = "#8B4513";

  const sales: Sale[] = [
    {
      id: "1",
      bookTitle: "Introduction to React Native",
      buyerName: "John D.",
      amount: 19.99,
      date: "2026-01-07",
    },
    {
      id: "2",
      bookTitle: "Advanced TypeScript Patterns",
      buyerName: "Sarah M.",
      amount: 29.99,
      date: "2026-01-06",
    },
    {
      id: "3",
      bookTitle: "Introduction to React Native",
      buyerName: "Mike R.",
      amount: 19.99,
      date: "2026-01-05",
    },
  ];

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);

  const PeriodButton = ({
    value,
    label,
  }: {
    value: "week" | "month" | "year";
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.periodBtn,
        period === value && { backgroundColor: PRIMARY },
      ]}
      onPress={() => setPeriod(value)}
    >
      <Text
        style={[
          styles.periodText,
          { color: period === value ? "#FFFFFF" : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Sales Report
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        <PeriodButton value="week" label="Week" />
        <PeriodButton value="month" label="Month" />
        <PeriodButton value="year" label="Year" />
      </View>

      {/* Revenue Summary */}
      <View style={[styles.summaryCard, { backgroundColor: PRIMARY }]}>
        <Text style={styles.summaryLabel}>Total Revenue ({period})</Text>
        <Text style={styles.summaryValue}>${totalRevenue.toFixed(2)}</Text>
        <Text style={styles.summarySubtext}>{sales.length} orders</Text>
      </View>

      {/* Sales List */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Recent Transactions
      </Text>
      {sales.map((sale) => (
        <View
          key={sale.id}
          style={[styles.saleItem, { backgroundColor: colors.surface }]}
        >
          <View style={styles.saleInfo}>
            <Text
              style={[styles.saleTitle, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {sale.bookTitle}
            </Text>
            <Text style={[styles.saleBuyer, { color: colors.textSecondary }]}>
              {sale.buyerName} • {sale.date}
            </Text>
          </View>
          <Text style={[styles.saleAmount, { color: "#4CAF50" }]}>
            +${sale.amount.toFixed(2)}
          </Text>
        </View>
      ))}

      {sales.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons
            name="bar-chart-outline"
            size={48}
            color={colors.textMuted}
          />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No sales in this period
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  periodContainer: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    padding: 4,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: 10,
  },
  periodText: { fontSize: 14, fontWeight: "500" },
  summaryCard: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: 20,
    alignItems: "center",
  },
  summaryLabel: { color: "#FFFFFF", opacity: 0.8, fontSize: 14 },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "700",
    marginVertical: spacing.sm,
  },
  summarySubtext: { color: "#FFFFFF", opacity: 0.8, fontSize: 14 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  saleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
  },
  saleInfo: { flex: 1 },
  saleTitle: { fontSize: 14, fontWeight: "500" },
  saleBuyer: { fontSize: 12, marginTop: 2 },
  saleAmount: { fontSize: 16, fontWeight: "600" },
  emptyState: { alignItems: "center", padding: spacing.xxl },
  emptyText: { marginTop: spacing.md, fontSize: 14 },
});
