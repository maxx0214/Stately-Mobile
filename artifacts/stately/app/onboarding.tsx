import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { setOnboarded } from "@/utils/storage";
import { useColors } from "@/hooks/useColors";

const FEATURES = [
  {
    icon: "activity" as const,
    title: "Daily Condition Score",
    desc: "A single number that captures your body's readiness each morning.",
  },
  {
    icon: "moon" as const,
    title: "Sleep & Recovery Analysis",
    desc: "Understand how rest, HRV, and activity combine to shape your day.",
  },
  {
    icon: "zap" as const,
    title: "AI Coaching Insights",
    desc: "Personalized guidance to help you train smarter, not just harder.",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const handleGetStarted = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setOnboarded();
    router.replace("/login");
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.navy,
          paddingTop: topPadding + 24,
          paddingBottom: bottomPadding + 24,
        },
      ]}
    >
      <View style={styles.top}>
        <View style={styles.logoRow}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Feather name="activity" size={22} color={colors.navy} />
          </View>
        </View>
        <Text style={styles.appName}>Stately</Text>
        <Text style={styles.slogan}>Clarity for your body.</Text>
        <Text style={styles.description}>
          Understand your recovery, energy, and stress signals every morning.
        </Text>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              <Feather name={f.icon} size={18} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bottom}>
        <Text style={styles.mvpNote}>Manual input mode — MVP 0.1</Text>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.primary, borderRadius: 14 },
          ]}
          onPress={handleGetStarted}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { color: colors.navy }]}>
            Get Started
          </Text>
          <Feather name="arrow-right" size={18} color={colors.navy} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  top: { gap: 12 },
  logoRow: { marginBottom: 8 },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  slogan: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    color: "#88D3C3",
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF99",
    lineHeight: 24,
    marginTop: 4,
  },
  features: { gap: 20 },
  featureRow: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: { flex: 1, gap: 4 },
  featureTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF80",
    lineHeight: 20,
  },
  bottom: { gap: 16, alignItems: "center" },
  mvpNote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF40",
    letterSpacing: 0.4,
  },
  button: {
    width: "100%",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#88D3C3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
});
