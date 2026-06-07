import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColors } from "../hooks/useColors";
import { updateReportStatus, archiveReport } from "../services/reports";
import { OverchargingReport } from "../types";

const STATUS_OPTIONS: OverchargingReport["status"][] = ["Pending", "Reviewed", "Resolved"];
const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: "clock" | "eye" | "check-circle" }> = {
  Pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", icon: "clock" },
  Reviewed: { color: "#3b82f6", bg: "rgba(59,130,246,0.15)", icon: "eye" },
  Resolved: { color: "#22c55e", bg: "rgba(34,197,94,0.15)", icon: "check-circle" },
};

interface Props {
  report: OverchargingReport;
}

export function AdminReportDetailScreen({ report }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(report.status);
  const [updating, setUpdating] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const cfg = STATUS_CONFIG[currentStatus];
  const overcharge = report.extorted_fare - report.legal_fare;

  async function handleStatusChange(status: OverchargingReport["status"]) {
    setUpdating(true);
    try {
      await updateReportStatus(report.id, status);
      setCurrentStatus(status);
    } catch {
      Alert.alert("Error", "Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  function handleArchive() {
    Alert.alert(
      "Archive Report",
      "This will soft-delete the report from the active list. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            try {
              await archiveReport(report.id);
              router.back();
            } catch {
              Alert.alert("Error", "Failed to archive report.");
            }
          },
        },
      ]
    );
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 10,
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.card, alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.border,
    },
    headerTitle: {
      flex: 1,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 17,
    },
    divider: { height: 1, backgroundColor: colors.border },
    scrollContent: {
      padding: 20,
      paddingBottom: Platform.OS === "web" ? 60 : 40,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 14,
    },
    sectionLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 12,
    },
    routeText: {
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 17,
      marginBottom: 6,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 12,
    },
    metaChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.muted,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    metaChipText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      fontSize: 12,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignSelf: "flex-start",
    },
    statusText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
    },
    fareRow: {
      flexDirection: "row",
      gap: 8,
    },
    fareBox: {
      flex: 1,
      backgroundColor: colors.muted,
      borderRadius: 10,
      padding: 12,
      alignItems: "center",
    },
    fareBoxLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      marginBottom: 4,
    },
    fareBoxValue: {
      fontFamily: "Inter_700Bold",
      fontSize: 20,
    },
    overchargeBox: {
      flex: 1,
      backgroundColor: "rgba(255,45,120,0.1)",
      borderRadius: 10,
      padding: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.pink + "44",
    },
    overchargeLabel: {
      color: colors.pink,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      marginBottom: 4,
    },
    overchargeValue: {
      color: colors.pink,
      fontFamily: "Inter_700Bold",
      fontSize: 20,
    },
    descText: {
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      lineHeight: 21,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    tag: {
      backgroundColor: colors.pinkMuted,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    tagText: {
      color: colors.pink,
      fontFamily: "Inter_500Medium",
      fontSize: 12,
    },
    evidenceImage: {
      width: "100%",
      height: 220,
      borderRadius: 10,
      marginTop: 4,
    },
    noEvidenceText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      textAlign: "center",
      paddingVertical: 20,
    },

    // Timeline
    timelineRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 16,
    },
    timelineDot: {
      width: 32, height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    timelineContent: { flex: 1 },
    timelineTitle: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
    },
    timelineDate: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      marginTop: 2,
    },
    timelineConnector: {
      width: 1,
      height: 16,
      backgroundColor: colors.border,
      marginLeft: 15,
      marginBottom: 0,
    },

    // Status change
    statusActions: {
      gap: 8,
    },
    statusBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
    },
    statusBtnText: {
      flex: 1,
      fontFamily: "Inter_500Medium",
      fontSize: 14,
    },
    archiveBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 10,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.destructive,
      marginTop: 8,
    },
    archiveBtnText: {
      color: colors.destructive,
      fontFamily: "Inter_500Medium",
      fontSize: 14,
    },
  });

  function formatDate(d: Date) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-PH", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  const TIMELINE_STEPS: Array<{ key: OverchargingReport["status"]; label: string }> = [
    { key: "Pending", label: "Report Filed" },
    { key: "Reviewed", label: "Under Review" },
    { key: "Resolved", label: "Case Resolved" },
  ];

  const stepIndex = TIMELINE_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Report Detail</Text>
        <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
          <Feather name={cfg.icon} size={13} color={cfg.color} />
          <Text style={[s.statusText, { color: cfg.color }]}>{currentStatus}</Text>
        </View>
      </View>
      <View style={s.divider} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* Route & Meta */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Incident Overview</Text>
          <Text style={s.routeText}>{report.origin} → {report.destination}</Text>
          <View style={s.metaRow}>
            <View style={s.metaChip}>
              <Feather name="hash" size={12} color={colors.mutedForeground} />
              <Text style={s.metaChipText}>Body #{report.body_number}</Text>
            </View>
            <View style={s.metaChip}>
              <Feather name="calendar" size={12} color={colors.mutedForeground} />
              <Text style={s.metaChipText}>
                {report.incident_date instanceof Date
                  ? report.incident_date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
              </Text>
            </View>
            <View style={s.metaChip}>
              <Feather name="clock" size={12} color={colors.mutedForeground} />
              <Text style={s.metaChipText}>Filed {formatDate(report.createdAt)}</Text>
            </View>
          </View>
          <View style={s.tagsRow}>
            {report.ai_tags.map((tag) => (
              <View key={tag} style={s.tag}>
                <Text style={s.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Fare Comparison */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Fare Breakdown</Text>
          <View style={s.fareRow}>
            <View style={s.fareBox}>
              <Text style={s.fareBoxLabel}>Legal Fare</Text>
              <Text style={[s.fareBoxValue, { color: "#22c55e" }]}>₱{report.legal_fare.toFixed(2)}</Text>
            </View>
            <View style={s.fareBox}>
              <Text style={s.fareBoxLabel}>Amount Charged</Text>
              <Text style={[s.fareBoxValue, { color: colors.destructive }]}>₱{report.extorted_fare.toFixed(2)}</Text>
            </View>
            <View style={s.overchargeBox}>
              <Text style={s.overchargeLabel}>Overcharge</Text>
              <Text style={s.overchargeValue}>+₱{overcharge.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Description</Text>
          <Text style={s.descText}>{report.description}</Text>
        </View>

        {/* Evidence Photo */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Evidence Photo</Text>
          {report.evidence_url ? (
            <Image
              source={{ uri: report.evidence_url }}
              style={s.evidenceImage}
              resizeMode="cover"
            />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Feather name="image" size={32} color={colors.mutedForeground} />
              <Text style={s.noEvidenceText}>No evidence photo attached</Text>
            </View>
          )}
        </View>

        {/* Status Timeline */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Status Timeline</Text>
          {TIMELINE_STEPS.map((step, idx) => {
            const isDone = idx <= stepIndex;
            const isActive = idx === stepIndex;
            const stepColor = isDone ? STATUS_CONFIG[step.key].color : colors.mutedForeground;
            const stepBg = isDone ? STATUS_CONFIG[step.key].bg : colors.muted;
            return (
              <View key={step.key}>
                <View style={s.timelineRow}>
                  <View style={[s.timelineDot, { backgroundColor: stepBg }]}>
                    <Feather
                      name={STATUS_CONFIG[step.key].icon}
                      size={14}
                      color={stepColor}
                    />
                  </View>
                  <View style={s.timelineContent}>
                    <Text style={[s.timelineTitle, { color: isDone ? colors.foreground : colors.mutedForeground }]}>
                      {step.label}
                      {isActive ? " (Current)" : ""}
                    </Text>
                    <Text style={s.timelineDate}>
                      {isActive ? formatDate(report.updatedAt) : (isDone ? "Completed" : "Pending")}
                    </Text>
                  </View>
                  {isDone && !isActive && (
                    <Feather name="check" size={14} color={stepColor} />
                  )}
                </View>
                {idx < TIMELINE_STEPS.length - 1 && (
                  <View style={s.timelineConnector} />
                )}
              </View>
            );
          })}
        </View>

        {/* Status Actions */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Update Status</Text>
          <View style={s.statusActions}>
            {STATUS_OPTIONS.filter((opt) => opt !== currentStatus).map((status) => {
              const c = STATUS_CONFIG[status];
              return (
                <TouchableOpacity
                  key={status}
                  style={[s.statusBtn, { borderColor: c.color, backgroundColor: c.bg }]}
                  onPress={() => handleStatusChange(status)}
                  disabled={updating}
                  activeOpacity={0.75}
                >
                  <Feather name={c.icon} size={16} color={c.color} />
                  <Text style={[s.statusBtnText, { color: c.color }]}>
                    Mark as {status}
                  </Text>
                  <Feather name="chevron-right" size={14} color={c.color} />
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={s.archiveBtn} onPress={handleArchive} activeOpacity={0.75}>
            <Feather name="archive" size={16} color={colors.destructive} />
            <Text style={s.archiveBtnText}>Archive Report</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
