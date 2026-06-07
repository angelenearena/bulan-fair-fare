import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AdminReportDetailScreen } from "../../screens/AdminReportDetailScreen";
import { useAuthContext } from "../../context/AuthContext";
import { getReportById } from "../../services/reports";
import { OverchargingReport } from "../../types";
import { useColors } from "../../hooks/useColors";

export default function AdminReportDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthContext();
  const colors = useColors();
  const [report, setReport] = useState<OverchargingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getReportById(id)
      .then((r) => {
        if (r) setReport(r);
        else setError("Report not found.");
      })
      .catch(() => setError("Failed to load report."))
      .finally(() => setLoading(false));
  }, [id]);

  if (!user || user.role !== "admin") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
          Admin access required.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.pink} size="large" />
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
          {error ?? "Report not found."}
        </Text>
      </View>
    );
  }

  return <AdminReportDetailScreen report={report} />;
}
