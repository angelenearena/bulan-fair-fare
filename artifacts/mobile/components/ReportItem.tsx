import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../hooks/useColors";
import { OverchargingReport } from "../types";

interface ReportItemProps {
  report: OverchargingReport;
  showActions?: boolean;
  onStatusChange?: (status: OverchargingReport["status"]) => void;
}

const STATUS_CONFIG = {
  Pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", icon: "clock" as const },
  Reviewed: { color: "#3b82f6", bg: "rgba(59,130,246,0.15)", icon: "eye" as const },
  Resolved: { color: "#22c55e", bg: "rgba(34,197,94,0.15)", icon: "check-circle" as const },
};

export function ReportItem({ report }: ReportItemProps) {
  const colors = useColors();
  const cfg = STATUS_CONFIG[report.status];

  const overcharge = report.extorted_fare - report.legal_fare;

  const s = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    routeText: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      flex: 1,
      marginRight: 8,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: cfg.bg,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 4,
    },
    statusText: {
      color: cfg.color,
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
    },
    meta: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 10,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
    },
    fareRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    fareBlock: {
      flex: 1,
      backgroundColor: colors.muted,
      borderRadius: 8,
      padding: 8,
      alignItems: "center",
    },
    fareLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      marginBottom: 2,
    },
    legalFare: {
      color: "#22c55e",
      fontFamily: "Inter_700Bold",
      fontSize: 16,
    },
    extortedFare: {
      color: colors.destructive,
      fontFamily: "Inter_700Bold",
      fontSize: 16,
    },
    overchargeBlock: {
      backgroundColor: "rgba(255,45,120,0.1)",
      borderRadius: 8,
      padding: 8,
      alignItems: "center",
    },
    overchargeLabel: {
      color: colors.pink,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      marginBottom: 2,
    },
    overchargeValue: {
      color: colors.pink,
      fontFamily: "Inter_700Bold",
      fontSize: 16,
    },
    desc: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 10,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    tag: {
      backgroundColor: colors.pinkMuted,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    tagText: {
      color: colors.pink,
      fontFamily: "Inter_500Medium",
      fontSize: 11,
    },
    dateText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      marginTop: 8,
    },
  });

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.routeText} numberOfLines={2}>
          {report.origin} → {report.destination}
        </Text>
        <View style={s.statusBadge}>
          <Feather name={cfg.icon} size={11} color={cfg.color} />
          <Text style={s.statusText}>{report.status}</Text>
        </View>
      </View>

      <View style={s.meta}>
        <View style={s.metaItem}>
          <Feather name="hash" size={12} color={colors.mutedForeground} />
          <Text style={s.metaText}>Body #{report.body_number}</Text>
        </View>
      </View>

      <View style={s.fareRow}>
        <View style={s.fareBlock}>
          <Text style={s.fareLabel}>Legal Fare</Text>
          <Text style={s.legalFare}>₱{report.legal_fare.toFixed(0)}</Text>
        </View>
        <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
        <View style={s.fareBlock}>
          <Text style={s.fareLabel}>Charged</Text>
          <Text style={s.extortedFare}>₱{report.extorted_fare.toFixed(0)}</Text>
        </View>
        <View style={s.overchargeBlock}>
          <Text style={s.overchargeLabel}>Overcharge</Text>
          <Text style={s.overchargeValue}>+₱{overcharge.toFixed(0)}</Text>
        </View>
      </View>

      <Text style={s.desc} numberOfLines={2}>{report.description}</Text>

      <View style={s.tagsRow}>
        {report.ai_tags.map((tag) => (
          <View key={tag} style={s.tag}>
            <Text style={s.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <Text style={s.dateText}>
        {report.createdAt instanceof Date
          ? report.createdAt.toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : ""}
      </Text>
    </View>
  );
}
