import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { getStatusColor } from "@/utils/calculateCondition";

interface MetricCardProps {
  title: string;
  score: number;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
}

export function MetricCard({ title, score, subtitle, icon }: MetricCardProps) {
  const colors = useColors();
  const statusColor = getStatusColor(score);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius ?? 16,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${statusColor}18` },
        ]}
      >
        <Feather name={icon} size={16} color={statusColor} />
      </View>
      <Text style={[styles.score, { color: colors.foreground }]}>{score}</Text>
      <Text style={[styles.title, { color: colors.mutedForeground }]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  score: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
