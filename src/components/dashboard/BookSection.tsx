import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Book } from "../../services/firestoreService";
import { spacing, typography } from "../../theme/colors";

const SCRIBD_ACCENT = "#E31226";

interface BookSectionProps {
  title: string;
  data: Book[];
  renderItem: ({ item }: { item: Book }) => React.ReactElement;
  onMorePress: () => void;
  moreLabel: string;
  colors: any;
  testID?: string;
}

export const BookSection: React.FC<BookSectionProps> = ({
  title,
  data,
  renderItem,
  onMorePress,
  moreLabel,
  colors,
  testID,
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.section} testID={testID}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <TouchableOpacity onPress={onMorePress}>
          <Text style={styles.sectionLink}>{moreLabel}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bookList}
        showsHorizontalScrollIndicator={false}
      />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Georgia",
  },
  sectionLink: {
    ...typography.bodySmall,
    color: SCRIBD_ACCENT,
    fontWeight: "600",
  },
  bookList: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
  },
});
