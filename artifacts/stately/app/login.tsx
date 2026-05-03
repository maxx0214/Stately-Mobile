import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type AuthMode = "signin" | "signup";

function getErrorMessage(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError("");
    setConfirmPassword("");
    Haptics.selectionAsync();
  };

  const handleSubmit = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      setError(getErrorMessage(code));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.navy }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: topPadding + 32, paddingBottom: bottomPadding + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Feather name="activity" size={22} color={colors.navy} />
          </View>
          <Text style={styles.appName}>Stately</Text>
          <Text style={styles.tagline}>
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </Text>
        </View>

        <View style={[styles.modeSwitcher, { backgroundColor: "#FFFFFF10" }]}>
          {(["signin", "signup"] as AuthMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.modeButton,
                mode === m && { backgroundColor: colors.primary },
              ]}
              onPress={() => switchMode(m)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeText,
                  { color: mode === m ? colors.navy : "#FFFFFF70" },
                ]}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <View style={[styles.inputRow, { backgroundColor: "#FFFFFF10" }]}>
            <Feather name="mail" size={16} color="#FFFFFF50" />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#FFFFFF40"
              value={email}
              onChangeText={(v) => { setEmail(v); setError(""); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />
          </View>

          <View style={[styles.inputRow, { backgroundColor: "#FFFFFF10" }]}>
            <Feather name="lock" size={16} color="#FFFFFF50" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#FFFFFF40"
              value={password}
              onChangeText={(v) => { setPassword(v); setError(""); }}
              secureTextEntry
              returnKeyType={mode === "signup" ? "next" : "done"}
              onSubmitEditing={mode === "signin" ? handleSubmit : undefined}
            />
          </View>

          {mode === "signup" && (
            <View style={[styles.inputRow, { backgroundColor: "#FFFFFF10" }]}>
              <Feather name="lock" size={16} color="#FFFFFF50" />
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor="#FFFFFF40"
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); setError(""); }}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          )}

          {!!error && (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={14} color="#F87171" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: loading
                  ? `${colors.primary}60`
                  : colors.primary,
                borderRadius: 14,
              },
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.navy} />
            ) : (
              <>
                <Text style={[styles.submitText, { color: colors.navy }]}>
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </Text>
                <Feather name="arrow-right" size={18} color={colors.navy} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Your data is stored privately per account.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 28,
    gap: 28,
    flexGrow: 1,
    justifyContent: "center",
  },
  logoSection: {
    gap: 10,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    color: "#88D3C3",
  },
  modeSwitcher: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },
  modeText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  form: {
    gap: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    padding: 0,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#F87171",
    flex: 1,
    lineHeight: 18,
  },
  submitButton: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
    shadowColor: "#88D3C3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF30",
    textAlign: "center",
  },
});
