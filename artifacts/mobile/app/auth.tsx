import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "../hooks/useColors";
import { useAuthContext } from "../context/AuthContext";
import { Button } from "../components/Button";

type AuthMode = "signin" | "register";

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, register } = useAuthContext();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      Alert.alert("Missing Name", "Please enter your name to register.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        await register(email.trim(), password, name.trim());
      }
      router.back();
    } catch (e: any) {
      const msg =
        e?.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : e?.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : e?.code === "auth/weak-password"
          ? "Password must be at least 6 characters."
          : "Authentication failed. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    closeBtn: {
      position: "absolute",
      top: topPad + 12,
      right: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingTop: topPad + 60,
      paddingBottom: bottomPad + 40,
    },
    logoArea: {
      alignItems: "center",
      marginBottom: 40,
    },
    logoIcon: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: colors.pinkMuted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: colors.pink,
    },
    appName: {
      color: colors.pink,
      fontFamily: "Inter_700Bold",
      fontSize: 24,
      letterSpacing: -0.5,
    },
    tagline: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      marginTop: 4,
      textAlign: "center",
    },
    modeToggle: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 3,
      marginBottom: 28,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modeBtn: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 8,
      alignItems: "center",
    },
    modeBtnActive: { backgroundColor: colors.pink },
    modeBtnText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      fontSize: 14,
    },
    modeBtnTextActive: { color: "#ffffff" },
    label: {
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      marginBottom: 8,
      marginTop: 16,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      height: 48,
    },
    input: {
      flex: 1,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
    },
    submitBtn: { marginTop: 28 },
    legalText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      textAlign: "center",
      marginTop: 16,
      lineHeight: 17,
    },
  });

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
        <Feather name="x" size={18} color={colors.foreground} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.logoArea}>
            <View style={s.logoIcon}>
              <Feather name="shield" size={28} color={colors.pink} />
            </View>
            <Text style={s.appName}>FairFare</Text>
            <Text style={s.tagline}>Bulan Tricycle Fare Transparency</Text>
          </View>

          <View style={s.modeToggle}>
            <TouchableOpacity
              style={[s.modeBtn, mode === "signin" && s.modeBtnActive]}
              onPress={() => setMode("signin")}
            >
              <Text style={[s.modeBtnText, mode === "signin" && s.modeBtnTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modeBtn, mode === "register" && s.modeBtnActive]}
              onPress={() => setMode("register")}
            >
              <Text style={[s.modeBtnText, mode === "register" && s.modeBtnTextActive]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {mode === "register" && (
            <>
              <Text style={s.label}>Full Name</Text>
              <View style={s.inputRow}>
                <Feather name="user" size={16} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                <TextInput
                  style={s.input}
                  placeholder="Your name"
                  placeholderTextColor={colors.mutedForeground}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </>
          )}

          <Text style={s.label}>Email Address</Text>
          <View style={s.inputRow}>
            <Feather name="mail" size={16} color={colors.mutedForeground} style={{ marginRight: 10 }} />
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={s.label}>Password</Text>
          <View style={s.inputRow}>
            <Feather name="lock" size={16} color={colors.mutedForeground} style={{ marginRight: 10 }} />
            <TextInput
              style={s.input}
              placeholder={mode === "register" ? "Min 6 characters" : "Your password"}
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <Button
            label={mode === "signin" ? "Sign In" : "Create Account"}
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            style={s.submitBtn}
          />

          {mode === "register" && (
            <Text style={s.legalText}>
              By registering, you agree to file reports truthfully and in accordance with local transport regulations.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
