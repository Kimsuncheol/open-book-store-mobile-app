import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  color?: string;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 24,
  color = "#FFD700",
  editable = false,
  onRatingChange,
}) => {
  const renderStar = (index: number) => {
    const filled = index < Math.floor(rating);
    const halfFilled = !filled && index < rating;

    const iconName = filled
      ? "star"
      : halfFilled
      ? "star-half"
      : "star-outline";

    const StarComponent = editable ? TouchableOpacity : View;

    return (
      <StarComponent
        key={index}
        onPress={editable ? () => onRatingChange?.(index + 1) : undefined}
        style={styles.star}
      >
        <Ionicons name={iconName} size={size} color={color} />
      </StarComponent>
    );
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center" },
  star: { marginHorizontal: 2 },
});
