import React from "react";
import { View, StyleSheet } from "react-native";
import { Shimmer } from "../Shimmer";
import { spacing } from "../../theme/colors";

interface SkeletonBookSectionProps {
  cardCount?: number;
  colors: any;
}

export const SkeletonBookSection: React.FC<SkeletonBookSectionProps> = ({
  cardCount = 3,
  colors,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Shimmer
          style={[
            styles.skeletonSectionTitle,
            { backgroundColor: colors.border },
          ]}
        />
        <Shimmer
          style={[
            styles.skeletonSectionLink,
            { backgroundColor: colors.border },
          ]}
        />
      </View>
      <View style={styles.skeletonRow}>
        {Array.from({ length: cardCount }).map((_, index) => (
          <View
            key={`skeleton-${index}`}
            style={[styles.skeletonCard, { backgroundColor: colors.surface }]}
          >
            <Shimmer
              style={[styles.skeletonCover, { backgroundColor: colors.border }]}
            />
            <Shimmer
              style={[styles.skeletonLine, { backgroundColor: colors.border }]}
            />
            <Shimmer
              style={[
                styles.skeletonLineSmall,
                { backgroundColor: colors.border },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    justifyContent: "space-between",
  },
  skeletonSectionTitle: {
    width: 140,
    height: 18,
    borderRadius: 6,
  },
  skeletonSectionLink: {
    width: 48,
    height: 14,
    borderRadius: 6,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  skeletonCard: {
    width: 150,
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.sm,
  },
  skeletonCover: {
    width: "100%",
    height: 140,
    borderRadius: 14,
  },
  skeletonLine: {
    width: "90%",
    height: 12,
    borderRadius: 6,
  },
  skeletonLineSmall: {
    width: "60%",
    height: 10,
    borderRadius: 6,
  },
});
