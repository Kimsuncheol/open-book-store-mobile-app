import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius } from "../../theme/colors";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryListProps {
  categories: Category[];
  navigation: any;
  colors: any;
  PRIMARY: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  navigation,
  colors,
  PRIMARY,
}) => {
  const styles = createStyles(colors, PRIMARY);

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.category}
      onPress={() => navigation.navigate("BookList", { category: item.name })}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name={item.icon as any} size={24} color={PRIMARY} />
      </View>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );
};

const createStyles = (colors: any, PRIMARY: string) =>
  StyleSheet.create({
    section: { padding: spacing.lg },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    categoryList: { paddingRight: spacing.lg },
    category: {
      alignItems: "center",
      marginRight: spacing.md,
      width: 80,
    },
    categoryIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: PRIMARY + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    categoryText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: "center",
    },
  });
