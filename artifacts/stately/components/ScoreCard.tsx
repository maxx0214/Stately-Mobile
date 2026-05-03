import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { getStatusColor } from "@/utils/calculateCondition";

interface ScoreCardProps {
  score: number;
  label: string;
}

export function ScoreCard({ score, label }: ScoreCardProps) {
  const colors = useColors();
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / 100, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const progressColor = getStatusColor(score);

  return (
    <View style={styles.wrapper}>
      <View style={styles.svgContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.muted}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.textOverlay}>
          <Text style={[styles.score, { color: colors.foreground }]}>
            {score}
          </Text>
          <Text style={[styles.outOf, { color: colors.mutedForeground }]}>
            / 100
          </Text>
        </View>
      </View>
      <Text style={[styles.label, { color: progressColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 12,
  },
  svgContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  textOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    letterSpacing: -2,
    lineHeight: 58,
  },
  outOf: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  label: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
