import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getStatusColor, getConditionLabel } from "@/utils/calculateCondition";

interface StatusBadgeProps {
  score: number;
  size?: "sm" | "md";
}

export function StatusBadge({ score, size = "md" }: StatusBadgeProps) {
  const color = getStatusColor(score);
  const label = getConditionLabel(score);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${color}18`, borderColor: `${color}30` },
        size === "sm" && styles.badgeSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.label,
          { color },
          size === "sm" && styles.labelSm,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: 11,
  },
});
