import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { spacing } from "../theme/colors";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password }) => {
  const getStrength = () => {
    if (!password) return { level: 0, label: "", color: "#E0E0E0" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: "Weak", color: "#F44336" };
    if (score <= 4) return { level: 2, label: "Medium", color: "#FF9800" };
    return { level: 3, label: "Strong", color: "#4CAF50" };
  };

  const getConstraints = () => [
    { met: password.length >= 8, text: "8+ characters" },
    { met: /[A-Z]/.test(password), text: "Uppercase letter" },
    { met: /[a-z]/.test(password), text: "Lowercase letter" },
    { met: /[0-9]/.test(password), text: "Number" },
    { met: /[^A-Za-z0-9]/.test(password), text: "Special character" },
  ];

  const strength = getStrength();
  const constraints = getConstraints();

  if (!password) return null;

  return (
    <View style={styles.container}>
      {/* Strength Bar */}
      <View style={styles.barContainer}>
        {[1, 2, 3].map((level) => (
          <View
            key={level}
            style={[
              styles.barSegment,
              {
                backgroundColor:
                  level <= strength.level ? strength.color : "#E0E0E0",
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: strength.color }]}>
        {strength.label}
      </Text>

      {/* Constraints */}
      <View style={styles.constraints}>
        {constraints.map((c, i) => (
          <View key={i} style={styles.constraint}>
            <Text
              style={[styles.dot, { color: c.met ? "#4CAF50" : "#9E9E9E" }]}
            >
              {c.met ? "✓" : "○"}
            </Text>
            <Text
              style={[
                styles.constraintText,
                { color: c.met ? "#4CAF50" : "#9E9E9E" },
              ]}
            >
              {c.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: spacing.xs, marginBottom: spacing.sm },
  barContainer: { flexDirection: "row", gap: 4 },
  barSegment: { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 12, fontWeight: "500", marginTop: 4, textAlign: "right" },
  constraints: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  constraint: { flexDirection: "row", alignItems: "center", width: "45%" },
  dot: { fontSize: 12, marginRight: 4 },
  constraintText: { fontSize: 11 },
});
