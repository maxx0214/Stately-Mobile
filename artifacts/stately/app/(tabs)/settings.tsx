import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useRecords } from "@/context/RecordsContext";

type FeatherIconName = keyof typeof Feather.glyphMap;

interface SettingRowProps {
  icon: FeatherIconName;
  label: string;
  value?: string;
  toggle?: boolean;
  checked?: boolean;
  onToggle?: (v: boolean) => void;
  disabled?: boolean;
  colors: ReturnType<typeof useColors>;
}

function SettingRow({
  icon,
  label,
  value,
  toggle,
  checked,
  onToggle,
  disabled,
  colors,
}: SettingRowProps) {
  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: disabled ? colors.muted : colors.secondary },
        ]}
      >
        <Feather
          name={icon}
          size={15}
          color={disabled ? colors.mutedForeground : colors.primary}
        />
      </View>
      <Text
        style={[
          styles.rowLabel,
          {
            color: disabled ? colors.mutedForeground : colors.foreground,
            flex: 1,
          },
        ]}
      >
        {label}
      </Text>
      {value && (
        <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
          {value}
        </Text>
      )}
      {toggle && onToggle && (
        <Switch
          value={checked}
          onValueChange={(v) => {
            Haptics.selectionAsync();
            onToggle(v);
          }}
          trackColor={{ false: colors.muted, true: colors.primary }}
          thumbColor="#FFFFFF"
          disabled={disabled}
        />
      )}
      {!toggle && !value && (
        <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
      )}
    </View>
  );
}

function SettingSection({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        {title}
      </Text>
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius ?? 16,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { source } = useRecords();
  const [morningReminder, setMorningReminder] = useState(false);
  const isFirestore = source === "firestore";

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPadding + 16,
          paddingBottom: bottomPadding + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>
        Settings
      </Text>

      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.navy,
            borderRadius: colors.radius ?? 16,
          },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: `${colors.primary}30` }]}>
          <Feather name="user" size={24} color={colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Your Profile</Text>
          <Text style={styles.profileSub}>MVP User</Text>
        </View>
        <View
          style={[
            styles.syncBadge,
            { backgroundColor: isFirestore ? `${colors.primary}25` : "#FFFFFF15" },
          ]}
        >
          <View
            style={[
              styles.syncDot,
              { backgroundColor: isFirestore ? colors.primary : "#FFFFFF40" },
            ]}
          />
          <Text
            style={[
              styles.syncText,
              { color: isFirestore ? colors.primary : "#FFFFFF80" },
            ]}
          >
            {isFirestore ? "Firestore" : "Local"}
          </Text>
        </View>
      </View>

      <SettingSection title="DATA SYNC" colors={colors}>
        <SettingRow
          icon="database"
          label="Storage"
          value={isFirestore ? "Firebase Firestore" : "Local only"}
          colors={colors}
        />
        <SettingRow
          icon="user"
          label="User ID"
          value="demo-user"
          colors={colors}
        />
        <SettingRow
          icon="smartphone"
          label="Input Mode"
          value="Manual"
          colors={colors}
        />
        <SettingRow
          icon="heart"
          label="Apple Health"
          value="Coming soon"
          disabled
          colors={colors}
        />
        <SettingRow
          icon="activity"
          label="Samsung Health"
          value="Coming soon"
          disabled
          colors={colors}
        />
        <SettingRow
          icon="watch"
          label="Google Fit"
          value="Coming soon"
          disabled
          colors={colors}
        />
      </SettingSection>

      <SettingSection title="NOTIFICATIONS" colors={colors}>
        <SettingRow
          icon="bell"
          label="Morning Reminder"
          toggle
          checked={morningReminder}
          onToggle={setMorningReminder}
          colors={colors}
        />
        {morningReminder && (
          <SettingRow
            icon="clock"
            label="Reminder Time"
            value="7:00 AM"
            colors={colors}
          />
        )}
      </SettingSection>

      <SettingSection title="ABOUT" colors={colors}>
        <SettingRow icon="info" label="App Version" value="MVP 0.1" colors={colors} />
        <SettingRow icon="shield" label="Privacy Policy" colors={colors} />
        <SettingRow icon="help-circle" label="Help & Support" colors={colors} />
      </SettingSection>

      <View style={styles.footer}>
        <View style={[styles.footerLogo, { backgroundColor: colors.navy }]}>
          <Feather name="activity" size={14} color={colors.primary} />
        </View>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          Stately — Clarity for your body.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  profileSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF60",
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  syncText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 8,
  },
  footerLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
