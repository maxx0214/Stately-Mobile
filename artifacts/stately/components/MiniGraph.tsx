import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Polyline, Circle as SvgCircle, Line } from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { getStatusColor } from "@/utils/calculateCondition";
import { DailyRecord } from "@/types/DailyRecord";

interface MiniGraphProps {
  records: DailyRecord[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MiniGraph({ records }: MiniGraphProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get("window").width;
  const graphWidth = screenWidth - 80;
  const graphHeight = 80;
  const paddingX = 16;
  const paddingY = 8;
  const innerWidth = graphWidth - paddingX * 2;
  const innerHeight = graphHeight - paddingY * 2;

  const last7 = records.slice(0, 7).reverse();

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return DAY_LABELS[d.getDay()];
  };

  if (last7.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius ?? 16,
          },
        ]}
      >
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Add your first entry to see your trend
        </Text>
      </View>
    );
  }

  const scores = last7.map((r) => r.condition.score);
  const points = last7.map((_, i) => {
    const x =
      paddingX +
      (last7.length === 1 ? innerWidth / 2 : (i / (last7.length - 1)) * innerWidth);
    const y =
      paddingY + innerHeight - (scores[i] / 100) * innerHeight;
    return { x, y, score: scores[i], date: last7[i].date };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius ?? 16,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>
        7-Day Trend
      </Text>
      <Svg width={graphWidth} height={graphHeight}>
        {[0, 50, 100].map((gridY) => {
          const y = paddingY + innerHeight - (gridY / 100) * innerHeight;
          return (
            <Line
              key={gridY}
              x1={paddingX}
              y1={y}
              x2={graphWidth - paddingX}
              y2={y}
              stroke={colors.muted}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          );
        })}
        {points.length > 1 && (
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {points.map((p, i) => (
          <SvgCircle
            key={i}
            cx={p.x}
            cy={p.y}
            r={5}
            fill={getStatusColor(p.score)}
            stroke={colors.card}
            strokeWidth={2}
          />
        ))}
      </Svg>
      <View style={styles.labels}>
        {last7.map((r, i) => (
          <Text
            key={i}
            style={[styles.dayLabel, { color: colors.mutedForeground }]}
          >
            {getDayLabel(r.date)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyContainer: {
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
