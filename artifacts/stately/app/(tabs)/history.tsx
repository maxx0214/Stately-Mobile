import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useRecords } from "@/context/RecordsContext";
import { StatusBadge } from "@/components/StatusBadge";
import { DailyRecord } from "@/types/DailyRecord";
import { getStatusColor } from "@/utils/calculateCondition";

function HistoryItem({ record }: { record: DailyRecord }) {
  const colors = useColors();
  const scoreColor = getStatusColor(record.condition.score);
  const date = new Date(record.date);
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

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
      <View style={styles.cardTop}>
        <View style={styles.dateRow}>
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
            {dateLabel}
          </Text>
          <StatusBadge score={record.condition.score} size="sm" />
        </View>
        <View
          style={[styles.scoreCircle, { borderColor: `${scoreColor}40`, backgroundColor: `${scoreColor}10` }]}
        >
          <Text style={[styles.scoreText, { color: scoreColor }]}>
            {record.condition.score}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <MiniMetric
          label="Activity"
          value={record.activity.score}
          icon="zap"
          colors={colors}
        />
        <MiniMetric
          label="Sleep"
          value={record.sleep.score}
          icon="moon"
          colors={colors}
        />
        <MiniMetric
          label="HRV"
          value={record.hrv.score}
          icon="heart"
          colors={colors}
        />
      </View>

      <View style={[styles.adviceContainer, { backgroundColor: colors.background, borderRadius: 10 }]}>
        <Feather name="zap" size={12} color={colors.primary} />
        <Text
          style={[styles.adviceText, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {record.ai.advice}
        </Text>
      </View>
    </View>
  );
}

function MiniMetric({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.miniMetric}>
      <Feather name={icon} size={12} color={colors.mutedForeground} />
      <Text style={[styles.miniMetricValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.miniMetricLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { records, loading } = useRecords();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPadding + 16,
          paddingBottom: bottomPadding + 100,
          paddingHorizontal: 20,
        },
      ]}
      data={records}
      keyExtractor={(item) => item.id}
      scrollEnabled={!!records.length}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Text style={[styles.title, { color: colors.foreground }]}>
          History
        </Text>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <View
            style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}
          >
            <Feather name="clock" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No history yet
          </Text>
          <Text
            style={[styles.emptyDesc, { color: colors.mutedForeground }]}
          >
            Your daily records will appear here once you start tracking.
          </Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item }) => <HistoryItem record={item} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 4,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateRow: {
    gap: 8,
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 16,
  },
  miniMetric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  miniMetricValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  miniMetricLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  adviceContainer: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    alignItems: "flex-start",
  },
  adviceText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
