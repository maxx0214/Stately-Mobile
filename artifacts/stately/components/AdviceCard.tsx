import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface AdviceCardProps {
  advice: string;
}

export function AdviceCard({ advice }: AdviceCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.navy,
          borderRadius: colors.radius ?? 16,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: "#FFFFFF18" }]}>
          <Feather name="zap" size={14} color={colors.primary} />
        </View>
        <Text style={styles.label}>AI Coach</Text>
      </View>
      <Text style={styles.advice}>{advice}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 12,
    shadowColor: "#1B2430",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#88D3C3",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  advice: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    lineHeight: 23,
    letterSpacing: 0.1,
  },
});
