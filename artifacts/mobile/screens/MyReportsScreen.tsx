import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "../hooks/useColors";
import { useAuthContext } from "../context/AuthContext";
import { subscribeToMyReports } from "../services/reports";
import { OverchargingReport } from "../types";
import { ReportItem } from "../components/ReportItem";
import { ReportItemSkeleton } from "../components/LoadingSkeleton";
import { Button } from "../components/Button";

export function MyReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isGuest } = useAuthContext();

  const [reports, setReports] = useState<OverchargingReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToMyReports(user.uid, (data) => {
      setReports(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: Platform.OS === "web" ? 34 + 84 : 100,
    },
    emptyContainer: {
      alignItems: "center",
      paddingTop: 60,
    },
    emptyTitle: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      marginTop: 16,
      marginBottom: 6,
    },
    emptyText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      textAlign: "center",
      paddingHorizontal: 30,
      lineHeight: 20,
    },
    countText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      marginBottom: 12,
    },
    guestBanner: {
      flex: 1,
      padding: 20,
    },
    guestCard: {
      backgroundColor: colors.pinkMuted,
      borderRadius: colors.radius,
      padding: 20,
      alignItems: "center",
      marginBottom: 16,
    },
    guestTitle: {
      color: colors.pink,
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      marginTop: 12,
      marginBottom: 6,
    },
    guestText: {
      color: colors.pink,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      textAlign: "center",
      lineHeight: 18,
    },
  });

  if (isGuest) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>My Reports</Text>
          <Text style={s.subtitle}>Your complaint history</Text>
        </View>
        <View style={s.divider} />
        <View style={s.guestBanner}>
          <View style={s.guestCard}>
            <Feather name="file-text" size={36} color={colors.pink} />
            <Text style={s.guestTitle}>Sign In Required</Text>
            <Text style={s.guestText}>
              Create an account to file reports and track your complaint history.
            </Text>
          </View>
          <Button label="Sign In" onPress={() => router.push("/auth")} fullWidth />
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>My Reports</Text>
        <Text style={s.subtitle}>Your complaint history</Text>
      </View>
      <View style={s.divider} />
      {loading ? (
        <View style={s.listContent}>
          {[0, 1, 2].map((i) => <ReportItemSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          ListHeaderComponent={
            reports.length > 0 ? (
              <Text style={s.countText}>{reports.length} report{reports.length !== 1 ? "s" : ""}</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Feather name="inbox" size={48} color={colors.mutedForeground} />
              <Text style={s.emptyTitle}>No reports yet</Text>
              <Text style={s.emptyText}>
                If you've been overcharged, use the Report tab to file a complaint.
              </Text>
            </View>
          }
          renderItem={({ item }) => <ReportItem report={item} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!reports.length}
        />
      )}
    </View>
  );
}
