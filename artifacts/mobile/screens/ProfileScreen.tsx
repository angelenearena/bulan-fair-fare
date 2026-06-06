import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "../hooks/useColors";
import { useAuthContext } from "../context/AuthContext";
import { Button } from "../components/Button";

export function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isGuest, isAdmin, signOut } = useAuthContext();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await signOut();
        },
      },
    ]);
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    title: {
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    subtitle: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
    },
    divider: { height: 1, backgroundColor: colors.border },
    scrollContent: {
      padding: 20,
      paddingBottom: Platform.OS === "web" ? 34 + 84 : 100,
    },
    avatarSection: {
      alignItems: "center",
      paddingVertical: 24,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.pinkMuted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.pink,
    },
    avatarText: {
      color: colors.pink,
      fontFamily: "Inter_700Bold",
      fontSize: 28,
    },
    userName: {
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      marginBottom: 4,
    },
    userEmail: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      marginBottom: 10,
    },
    roleBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.pinkMuted,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 5,
      gap: 6,
    },
    roleText: {
      color: colors.pink,
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
    },
    section: { marginBottom: 8 },
    sectionTitle: {
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    menuItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    menuText: {
      flex: 1,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 14,
    },
    menuTextDestructive: { color: colors.destructive },
    guestCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    guestTitle: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 18,
      marginTop: 16,
      marginBottom: 8,
    },
    guestText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 20,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    infoLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
    },
    infoValue: {
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
    },
  });

  if (isGuest) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Profile</Text>
          <Text style={s.subtitle}>Account & settings</Text>
        </View>
        <View style={s.divider} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          <View style={s.guestCard}>
            <Feather name="user" size={40} color={colors.mutedForeground} />
            <Text style={s.guestTitle}>Browsing as Guest</Text>
            <Text style={s.guestText}>
              Sign in to file reports, track your complaint history, and access all commuter features.
            </Text>
            <Button label="Sign In" onPress={() => router.push("/auth")} fullWidth />
          </View>
          <View style={s.section}>
            <Text style={s.sectionTitle}>About</Text>
            <View style={s.infoCard}>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Municipality</Text>
                <Text style={s.infoValue}>Bulan, Sorsogon</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Version</Text>
                <Text style={s.infoValue}>1.0.0</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={s.infoLabel}>Platform</Text>
                <Text style={s.infoValue}>Bulan FairFare</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Profile</Text>
        <Text style={s.subtitle}>Account & settings</Text>
      </View>
      <View style={s.divider} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
          <Text style={s.userName}>{user?.name}</Text>
          <Text style={s.userEmail}>{user?.email}</Text>
          <View style={s.roleBadge}>
            <Feather
              name={isAdmin ? "shield" : "user"}
              size={13}
              color={colors.pink}
            />
            <Text style={s.roleText}>
              {isAdmin ? "Administrator" : "Commuter"}
            </Text>
          </View>
        </View>

        {isAdmin && (
          <View style={[s.section, { marginBottom: 16 }]}>
            <Text style={s.sectionTitle}>Admin</Text>
            <View style={s.card}>
              <TouchableOpacity
                style={[s.menuItem, s.menuItemBorder]}
                onPress={() => router.push("/admin")}
              >
                <View style={[s.menuIcon, { backgroundColor: colors.pinkMuted }]}>
                  <Feather name="shield" size={16} color={colors.pink} />
                </View>
                <Text style={s.menuText}>Admin Dashboard</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={[s.section, { marginBottom: 16 }]}>
          <Text style={s.sectionTitle}>Account</Text>
          <View style={s.card}>
            <View style={[s.menuItem, s.menuItemBorder]}>
              <View style={[s.menuIcon, { backgroundColor: colors.muted }]}>
                <Feather name="mail" size={16} color={colors.mutedForeground} />
              </View>
              <Text style={s.menuText}>{user?.email}</Text>
            </View>
            <View style={s.menuItem}>
              <View style={[s.menuIcon, { backgroundColor: colors.muted }]}>
                <Feather name="calendar" size={16} color={colors.mutedForeground} />
              </View>
              <Text style={s.menuText}>
                Joined {user?.createdAt instanceof Date
                  ? user.createdAt.toLocaleDateString("en-PH", { month: "long", year: "numeric" })
                  : ""}
              </Text>
            </View>
          </View>
        </View>

        <View style={[s.section, { marginBottom: 16 }]}>
          <Text style={s.sectionTitle}>About</Text>
          <View style={s.infoCard}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Municipality</Text>
              <Text style={s.infoValue}>Bulan, Sorsogon</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={s.infoLabel}>Version</Text>
              <Text style={s.infoValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[s.card, { overflow: "hidden" }]}
          onPress={handleSignOut}
          activeOpacity={0.75}
        >
          <View style={s.menuItem}>
            <View style={[s.menuIcon, { backgroundColor: "rgba(239,68,68,0.1)" }]}>
              <Feather name="log-out" size={16} color={colors.destructive} />
            </View>
            <Text style={[s.menuText, s.menuTextDestructive]}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
