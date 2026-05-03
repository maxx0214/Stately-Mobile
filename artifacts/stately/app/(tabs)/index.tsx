import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useRecords } from "@/context/RecordsContext";
import { useAuth } from "@/context/AuthContext";
import { isOnboarded } from "@/utils/storage";
import { ScoreCard } from "@/components/ScoreCard";
import { MetricCard } from "@/components/MetricCard";
import { AdviceCard } from "@/components/AdviceCard";
import { MiniGraph } from "@/components/MiniGraph";
import { StatusBadge } from "@/components/StatusBadge";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { records, loading, refresh } = useRecords();
  const { user, authLoading } = useAuth();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (authLoading) return;
    isOnboarded().then((onboarded) => {
      if (!onboarded) {
        router.replace("/onboarding");
      } else if (!user) {
        router.replace("/login");
      }
    });
  }, [user, authLoading]);

  const latest = records[0] ?? null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}> {getGreeting()} </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Your Condition</Text>
        </View>
        <View style={[styles.logoMark, { backgroundColor: colors.navy }]}>
          <Feather name="activity" size={16} color={colors.primary} />
        </View>
      </View>

      {latest ? (
        <>
          <View style={styles.scoreSection}>
            <ScoreCard score={latest.condition.score} label={latest.condition.label} />
            <StatusBadge score={latest.condition.score} />
          </View>
          <AdviceCard advice={latest.ai.advice} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Metrics</Text>
          <View style={styles.metricsRow}>
            <MetricCard title="Activity" score={latest.activity.score} subtitle={`${latest.activity.activeKcal} kcal`} icon="zap" />
            <MetricCard title="Sleep" score={latest.sleep.score} subtitle={`${latest.sleep.hours}h sleep`} icon="moon" />
            <MetricCard title="HRV" score={latest.hrv.score} subtitle={`${latest.hrv.value} ms`} icon="heart" />
          </View>
          <MiniGraph records={records} />
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="plus-circle" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No data yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>Add today's activity, sleep, and HRV to see your condition score.</Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.navy, borderRadius: 12 }]} onPress={() => router.push("/(tabs)/input")} activeOpacity={0.85}>
            <Feather name="plus" size={18} color={colors.primary} />
            <Text style={[styles.addButtonText, { color: "#FFFFFF" }]}>Add Today's Data</Text>
          </TouchableOpacity>
        </View>
      )}

      {latest && (
        <TouchableOpacity style={[styles.addDataButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 }]} onPress={() => router.push("/(tabs)/input")} activeOpacity={0.8}>
          <Feather name="edit-3" size={16} color={colors.primary} />
          <Text style={[styles.addDataText, { color: colors.foreground }]}>Update Today's Data</Text>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", letterSpacing: 0.2 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  logoMark: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  scoreSection: { alignItems: "center", gap: 16, paddingVertical: 8 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", letterSpacing: 0.1 },
  metricsRow: { flexDirection: "row", gap: 10 },
  emptyState: { alignItems: "center", gap: 14, paddingVertical: 40, paddingHorizontal: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  addButton: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8 },
  addButtonText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  addDataButton: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderWidth: 1 },
  addDataText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
});
