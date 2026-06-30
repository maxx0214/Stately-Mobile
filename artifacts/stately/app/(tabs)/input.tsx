import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useRecords } from "@/context/RecordsContext";
import { calculateCondition } from "@/utils/calculateCondition";
import { generateAdvice } from "@/utils/generateAdvice";
import { fetchAiCoachAdvice } from "@/services/aiCoach";
import { DailyRecord } from "@/types/DailyRecord";

type HrvReliability = "green" | "amber" | "red";

const RELIABILITY_LABELS: Record<HrvReliability, string> = {
  green: "High",
  amber: "Medium",
  red: "Low",
};

const RELIABILITY_COLORS: Record<HrvReliability, string> = {
  green: "#34D399",
  amber: "#FBBF24",
  red: "#F87171",
};

export default function InputScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addRecord } = useRecords();

  const [activeKcal, setActiveKcal] = useState("");
  const [goalKcal, setGoalKcal] = useState("600");
  const [sleepHours, setSleepHours] = useState("");
  const [sleepEfficiency, setSleepEfficiency] = useState("");
  const [deepSleepScore, setDeepSleepScore] = useState("");
  const [hrv, setHrv] = useState("");
  const [hrvReliability, setHrvReliability] = useState<HrvReliability>("green");
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleCalculate = async () => {
    const aKcal = parseFloat(activeKcal);
    const gKcal = parseFloat(goalKcal);
    const sHours = parseFloat(sleepHours);
    const sEff = parseFloat(sleepEfficiency);
    const dSleep = parseFloat(deepSleepScore);
    const hrvVal = parseFloat(hrv);

    if (
      isNaN(aKcal) ||
      isNaN(gKcal) ||
      isNaN(sHours) ||
      isNaN(sEff) ||
      isNaN(dSleep) ||
      isNaN(hrvVal)
    ) {
      Alert.alert("Missing Data", "Please fill in all fields before calculating.");
      return;
    }

    if (gKcal <= 0) {
      Alert.alert("Invalid Data", "Goal calories must be greater than 0.");
      return;
    }

    setSubmitting(true);
    setStatusMsg("컨디션 점수 계산 중...");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = calculateCondition({
      activeKcal: aKcal,
      goalKcal: gKcal,
      sleepHours: sHours,
      sleepEfficiency: sEff,
      deepSleepScore: dSleep,
      hrv: hrvVal,
      hrvReliability,
    });

    const scores: Record<string, number> = {
      activity: result.activityScore,
      sleep: result.sleepScore,
      hrv: result.hrvScore,
    };
    const weakestMetric = Object.entries(scores).reduce((a, b) =>
      a[1] < b[1] ? a : b
    )[0] as "activity" | "sleep" | "hrv";

    setStatusMsg("AI 코치가 오늘의 컨디션을 정리하고 있어요...");

    let advice: string;
    let aiSource: "groq" | "gemini" | "openai" | "fallback";

    try {
      const aiRes = await fetchAiCoachAdvice({
        conditionScore: result.conditionScore,
        conditionLabel: result.label,
        activityScore: result.activityScore,
        sleepScore: result.sleepScore,
        hrvScore: result.hrvScore,
        hrvReliability,
        weakestMetric,
      });
      advice = aiRes.advice;
      aiSource = aiRes.source;
    } catch {
      advice = generateAdvice(
        result.conditionScore,
        result.activityScore,
        result.sleepScore,
        result.hrvScore
      );
      aiSource = "fallback";
    }

    const today = new Date().toISOString().split("T")[0];
    const id = `${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    const record: DailyRecord = {
      id,
      date: today,
      activity: {
        activeKcal: aKcal,
        goalKcal: gKcal,
        score: result.activityScore,
      },
      sleep: {
        hours: sHours,
        efficiency: sEff,
        deepSleepScore: dSleep,
        score: result.sleepScore,
      },
      hrv: {
        value: hrvVal,
        reliability: hrvReliability,
        score: result.hrvScore,
      },
      condition: {
        score: result.conditionScore,
        label: result.label,
        weights: result.weights,
      },
      ai: {
        advice,
        cached: true,
        source: aiSource,
      },
      flags: {
        ready_for_morning: true,
        completed: true,
      },
    };

    await addRecord(record);
    setSubmitting(false);
    setStatusMsg(null);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 16, paddingBottom: insets.bottom + 100 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Today's Data
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      <Section title="Activity" icon="zap" colors={colors}>
        <InputField
          label="Active Calories"
          placeholder="e.g. 450"
          value={activeKcal}
          onChangeText={setActiveKcal}
          unit="kcal"
          colors={colors}
        />
        <InputField
          label="Goal Calories"
          placeholder="e.g. 600"
          value={goalKcal}
          onChangeText={setGoalKcal}
          unit="kcal"
          colors={colors}
        />
      </Section>

      <Section title="Sleep" icon="moon" colors={colors}>
        <InputField
          label="Sleep Duration"
          placeholder="e.g. 7.5"
          value={sleepHours}
          onChangeText={setSleepHours}
          unit="hrs"
          colors={colors}
        />
        <InputField
          label="Sleep Efficiency"
          placeholder="e.g. 85"
          value={sleepEfficiency}
          onChangeText={setSleepEfficiency}
          unit="%"
          colors={colors}
        />
        <InputField
          label="Deep Sleep Score"
          placeholder="e.g. 70"
          value={deepSleepScore}
          onChangeText={setDeepSleepScore}
          unit="/ 100"
          colors={colors}
        />
      </Section>

      <Section title="Heart Rate Variability" icon="heart" colors={colors}>
        <InputField
          label="HRV"
          placeholder="e.g. 55"
          value={hrv}
          onChangeText={setHrv}
          unit="ms"
          colors={colors}
        />
        <View style={styles.reliabilityContainer}>
          <Text style={[styles.reliabilityLabel, { color: colors.mutedForeground }]}>
            HRV Signal Quality
          </Text>
          <View style={styles.reliabilityRow}>
            {(["green", "amber", "red"] as HrvReliability[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.reliabilityButton,
                  {
                    backgroundColor:
                      hrvReliability === r
                        ? RELIABILITY_COLORS[r]
                        : colors.muted,
                    borderRadius: 10,
                  },
                ]}
                onPress={() => {
                  setHrvReliability(r);
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.reliabilityButtonText,
                    {
                      color:
                        hrvReliability === r ? "#fff" : colors.mutedForeground,
                    },
                  ]}
                >
                  {RELIABILITY_LABELS[r]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Section>

      <TouchableOpacity
        style={[
          styles.calculateButton,
          {
            backgroundColor: submitting ? colors.muted : colors.navy,
            borderRadius: 14,
          },
        ]}
        onPress={handleCalculate}
        disabled={submitting}
        activeOpacity={0.85}
      >
        <Feather
          name={submitting ? "loader" : "bar-chart-2"}
          size={18}
          color={submitting ? colors.mutedForeground : colors.primary}
        />
        <Text
          style={[
            styles.calculateButtonText,
            {
              color: submitting ? colors.mutedForeground : "#FFFFFF",
            },
          ]}
        >
          {statusMsg ?? "Calculate Condition"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({
  title,
  icon,
  children,
  colors,
}: {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius ?? 16,
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <View
          style={[styles.sectionIcon, { backgroundColor: colors.secondary }]}
        >
          <Feather name={icon} size={14} color={colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  unit,
  colors,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  unit: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <View
        style={[
          styles.fieldInputRow,
          {
            backgroundColor: colors.input,
            borderRadius: 10,
          },
        ]}
      >
        <TextInput
          style={[styles.fieldInput, { color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
        <Text style={[styles.fieldUnit, { color: colors.mutedForeground }]}>
          {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    gap: 4,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  section: {
    padding: 20,
    borderWidth: 1,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  fieldInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    padding: 0,
  },
  fieldUnit: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  reliabilityContainer: {
    gap: 10,
  },
  reliabilityLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  reliabilityRow: {
    flexDirection: "row",
    gap: 8,
  },
  reliabilityButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  reliabilityButtonText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  calculateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    marginTop: 4,
    shadowColor: "#1B2430",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  calculateButtonText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});
