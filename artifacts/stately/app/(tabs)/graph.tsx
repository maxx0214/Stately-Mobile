import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import Svg, {
  Line,
  Polyline,
  Circle as SvgCircle,
  Text as SvgText,
  Rect,
} from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useRecords } from "@/context/RecordsContext";
import { DailyRecord } from "@/types/DailyRecord";

const SERIES = [
  {
    key: "condition" as const,
    label: "Condition",
    color: "#88D3C3",
    icon: "activity" as const,
  },
  {
    key: "activity" as const,
    label: "Activity",
    color: "#60A5FA",
    icon: "zap" as const,
  },
  {
    key: "sleep" as const,
    label: "Sleep",
    color: "#A78BFA",
    icon: "moon" as const,
  },
  {
    key: "hrv" as const,
    label: "HRV",
    color: "#F59E0B",
    icon: "heart" as const,
  },
];

type SeriesKey = "condition" | "activity" | "sleep" | "hrv";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getScore(record: DailyRecord, key: SeriesKey): number {
  switch (key) {
    case "condition":
      return record.condition.score;
    case "activity":
      return record.activity.score;
    case "sleep":
      return record.sleep.score;
    case "hrv":
      return record.hrv.score;
  }
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return DAY_LABELS[d.getDay()];
}

function getShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function GraphScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { records } = useRecords();

  const [activeKeys, setActiveKeys] = useState<Set<SeriesKey>>(
    new Set(["condition"])
  );

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const screenWidth = Dimensions.get("window").width;
  const chartPaddingLeft = 36;
  const chartPaddingRight = 16;
  const chartPaddingTop = 12;
  const chartPaddingBottom = 28;
  const chartWidth = screenWidth - 40;
  const chartHeight = 220;
  const innerWidth = chartWidth - chartPaddingLeft - chartPaddingRight;
  const innerHeight = chartHeight - chartPaddingTop - chartPaddingBottom;

  const last7 = records.slice(0, 7).reverse();

  const toggleSeries = (key: SeriesKey) => {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev;
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getPoint = (index: number, score: number) => {
    const x =
      chartPaddingLeft +
      (last7.length <= 1
        ? innerWidth / 2
        : (index / (last7.length - 1)) * innerWidth);
    const y = chartPaddingTop + innerHeight - (score / 100) * innerHeight;
    return { x, y };
  };

  const GRID_VALUES = [0, 25, 50, 75, 100];

  const currentScore = (key: SeriesKey) => {
    if (last7.length === 0) return null;
    return getScore(last7[last7.length - 1], key);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPadding + 16,
          paddingBottom: bottomPadding + 100,
          paddingHorizontal: 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          7-Day Graph
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Tap metrics to toggle series
        </Text>
      </View>

      <View style={styles.toggleRow}>
        {SERIES.map((s) => {
          const active = activeKeys.has(s.key);
          return (
            <TouchableOpacity
              key={s.key}
              style={[
                styles.toggleButton,
                {
                  backgroundColor: active ? `${s.color}18` : colors.card,
                  borderColor: active ? s.color : colors.border,
                  borderRadius: 12,
                },
              ]}
              onPress={() => toggleSeries(s.key)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.toggleDot,
                  { backgroundColor: active ? s.color : colors.muted },
                ]}
              />
              <Text
                style={[
                  styles.toggleLabel,
                  { color: active ? s.color : colors.mutedForeground },
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={[
          styles.chartCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius ?? 16,
          },
        ]}
      >
        {last7.length === 0 ? (
          <View style={styles.emptyChart}>
            <Feather name="bar-chart-2" size={32} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No data yet. Add your first entry to see the chart.
            </Text>
          </View>
        ) : (
          <Svg width={chartWidth} height={chartHeight}>
            {GRID_VALUES.map((val) => {
              const y = chartPaddingTop + innerHeight - (val / 100) * innerHeight;
              return (
                <React.Fragment key={val}>
                  <Line
                    x1={chartPaddingLeft}
                    y1={y}
                    x2={chartWidth - chartPaddingRight}
                    y2={y}
                    stroke={colors.border}
                    strokeWidth={1}
                    strokeDasharray={val === 0 ? "0" : "4,4"}
                  />
                  <SvgText
                    x={chartPaddingLeft - 6}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={9}
                    fill={colors.mutedForeground}
                    fontFamily="Inter_400Regular"
                  >
                    {val}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {SERIES.filter((s) => activeKeys.has(s.key)).map((s) => {
              const points = last7.map((r, i) =>
                getPoint(i, getScore(r, s.key))
              );
              const polylinePoints = points
                .map((p) => `${p.x},${p.y}`)
                .join(" ");
              return (
                <React.Fragment key={s.key}>
                  {last7.length > 1 && (
                    <Polyline
                      points={polylinePoints}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  {points.map((p, i) => (
                    <React.Fragment key={i}>
                      <SvgCircle
                        cx={p.x}
                        cy={p.y}
                        r={5}
                        fill={s.color}
                        stroke={colors.card}
                        strokeWidth={2}
                      />
                    </React.Fragment>
                  ))}
                </React.Fragment>
              );
            })}

            {last7.map((r, i) => {
              const { x } = getPoint(i, 0);
              return (
                <SvgText
                  key={i}
                  x={x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill={colors.mutedForeground}
                  fontFamily="Inter_400Regular"
                >
                  {getDayLabel(r.date)}
                </SvgText>
              );
            })}
          </Svg>
        )}
      </View>

      <View style={styles.statsGrid}>
        {SERIES.map((s) => {
          const score = currentScore(s.key);
          const active = activeKeys.has(s.key);
          return (
            <TouchableOpacity
              key={s.key}
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: active ? `${s.color}40` : colors.border,
                  borderRadius: colors.radius ?? 16,
                },
              ]}
              onPress={() => toggleSeries(s.key)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.statIconRow,
                  { backgroundColor: `${s.color}15` },
                ]}
              >
                <Feather name={s.icon} size={14} color={s.color} />
                {active && (
                  <View style={[styles.activeDot, { backgroundColor: s.color }]} />
                )}
              </View>
              <Text style={[styles.statScore, { color: colors.foreground }]}>
                {score !== null ? score : "—"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {s.label}
              </Text>
              <Text style={[styles.statNote, { color: colors.mutedForeground }]}>
                Today
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {last7.length > 0 && (
        <View
          style={[
            styles.tableCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius ?? 16,
            },
          ]}
        >
          <Text style={[styles.tableTitle, { color: colors.foreground }]}>
            Daily Breakdown
          </Text>
          <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.tableHeaderCell, { color: colors.mutedForeground, flex: 1.2 }]}>
              Date
            </Text>
            {SERIES.map((s) => (
              <Text
                key={s.key}
                style={[
                  styles.tableHeaderCell,
                  {
                    color: activeKeys.has(s.key) ? s.color : colors.mutedForeground,
                  },
                ]}
              >
                {s.label.slice(0, 4)}
              </Text>
            ))}
          </View>
          {[...last7].reverse().map((record, i) => (
            <View
              key={record.id}
              style={[
                styles.tableRow,
                {
                  borderBottomColor: colors.border,
                  borderBottomWidth: i < last7.length - 1 ? StyleSheet.hairlineWidth : 0,
                  backgroundColor: i % 2 === 0 ? "transparent" : `${colors.muted}40`,
                },
              ]}
            >
              <Text style={[styles.tableCell, { color: colors.foreground, flex: 1.2 }]}>
                {getShortDate(record.date)}
              </Text>
              {SERIES.map((s) => (
                <Text
                  key={s.key}
                  style={[
                    styles.tableCell,
                    {
                      color: activeKeys.has(s.key) ? s.color : colors.mutedForeground,
                      fontFamily: "Inter_600SemiBold",
                    },
                  ]}
                >
                  {getScore(record, s.key)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toggleLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  chartCard: {
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    paddingVertical: 12,
    paddingLeft: 0,
  },
  emptyChart: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "47%",
    padding: 14,
    borderWidth: 1.5,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconRow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    flexDirection: "row",
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    position: "absolute",
    top: 4,
    right: 4,
  },
  statScore: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statNote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  tableCard: {
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tableTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    padding: 16,
    paddingBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
});
