import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColors } from "../hooks/useColors";
import { getReportById } from "../services/reports";
import { OverchargingReport } from "../types";

const STATUS_CONFIG: Record<
  OverchargingReport["status"],
  { color: string; bg: string; icon: "clock" | "eye" | "check-circle"; label: string; desc: string }
> = {
  Pending: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    icon: "clock",
    label: "Under Review",
    desc: "Your report has been submitted and is waiting for admin review.",
  },
  Reviewed: {
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.15)",
    icon: "eye",
    label: "Being Reviewed",
    desc: "An administrator is reviewing your report. We may contact you for more information.",
  },
  Resolved: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    icon: "check-circle",
    label: "Resolved",
    desc: "Your report has been reviewed and appropriate action has been taken. Thank you for helping keep Bulan's tricycle fares fair.",
  },
};

const STEPS: OverchargingReport["status"][] = ["Pending", "Reviewed", "Resolved"];

const STEP_DESC: Record<string, string> = {
  Pending: "Submitted and queued for admin review",
  Reviewed: "An admin is currently reviewing this",
  Resolved: "Admin has taken action on this report",
};

export function ReportDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [report, setReport] = useState<OverchargingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (!id) return;
    getReportById(id)
      .then((r) => {
        setReport(r);
        setLoading(false);
      })
      .catch(() => {
        setFetchError("Failed to load report. Please try again.");
        setLoading(false);
      });
  }, [id]);

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
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      flex: 1,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 18,
    },
    divider: { height: 1, backgroundColor: colors.border },
    content: {
      padding: 20,
      paddingBottom: Platform.OS === "web" ? 34 + 84 : 100,
    },
    statusCard: {
      borderRadius: colors.radius,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
    },
    statusHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    timelineCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timelineTitle: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      marginBottom: 14,
    },
    timelineRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    timelineLeft: {
      alignItems: "center",
      width: 28,
      marginRight: 12,
    },
    timelineDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    timelineLine: {
      width: 2,
      height: 28,
      marginTop: 2,
    },
    timelineContent: {
      flex: 1,
      paddingBottom: 16,
    },
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      marginBottom: 12,
    },
    fareRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    fareBlock: {
      flex: 1,
      backgroundColor: colors.muted,
      borderRadius: 8,
      padding: 10,
      alignItems: "center",
    },
    fareLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      marginBottom: 2,
    },
    overchargeBlock: {
      backgroundColor: "rgba(255,45,120,0.1)",
      borderRadius: 8,
      padding: 10,
      alignItems: "center",
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
      paddingVertical: 4,
    },
    tagText: {
      color: colors.pink,
      fontFamily: "Inter_500Medium",
      fontSize: 11,
    },
    evidenceImage: {
      width: "100%",
      height: 200,
      borderRadius: 8,
      backgroundColor: colors.muted,
    },
    infoCard: {
      backgroundColor: colors.pinkMuted,
      borderRadius: colors.radius,
      padding: 14,
      marginBottom: 16,
      flexDirection: "row",
      gap: 10,
    },
  });

  if (loading) {
    return (
      <View style={[s.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={colors.pink} size="large" />
      </View>
    );
  }

  if (!report || fetchError) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Report Detail</Text>
        </View>
        <View style={s.divider} />
        <View style={{ alignItems: "center", paddingTop: 60 }}>
          <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular", fontSize: 15 }}>
            {fetchError ?? "Report not found."}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 16, backgroundColor: colors.pink, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 }}
            onPress={() => router.back()}
          >
            <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const cfg = STATUS_CONFIG[report.status];
  const overcharge = report.extorted_fare - report.legal_fare;
  const currentStep = STEPS.indexOf(report.status);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Report</Text>
        <View style={[s.timelineDot, { backgroundColor: cfg.bg }]}>
          <Feather name={cfg.icon} size={14} color={cfg.color} />
        </View>
      </View>
      <View style={s.divider} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Status card */}
        <View style={[s.statusCard, { backgroundColor: cfg.bg, borderColor: cfg.color + "40" }]}>
          <View style={s.statusHeader}>
            <Feather name={cfg.icon} size={20} color={cfg.color} />
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: cfg.color }}>{cfg.label}</Text>
          </View>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, color: cfg.color }}>
            {cfg.desc}
          </Text>
        </View>

        {/* Progress timeline */}
        <View style={s.timelineCard}>
          <Text style={s.timelineTitle}>Progress</Text>
          {STEPS.map((step, i) => {
            const isDone = i <= currentStep;
            const isLast = i === STEPS.length - 1;
            const stepCfg = STATUS_CONFIG[step];
            const dotColor = isDone ? stepCfg.color : colors.border;
            const dotBg = isDone ? stepCfg.bg : colors.muted;
            return (
              <View key={step} style={s.timelineRow}>
                <View style={s.timelineLeft}>
                  <View style={[s.timelineDot, { backgroundColor: dotBg }]}>
                    <Feather
                      name={isDone ? stepCfg.icon : "circle"}
                      size={14}
                      color={dotColor}
                    />
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        s.timelineLine,
                        { backgroundColor: i < currentStep ? stepCfg.color : colors.border },
                      ]}
                    />
                  )}
                </View>
                <View style={s.timelineContent}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 13,
                      color: isDone ? colors.foreground : colors.mutedForeground,
                    }}
                  >
                    {step}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      marginTop: 2,
                      lineHeight: 17,
                      color: isDone ? colors.mutedForeground : colors.border,
                    }}
                  >
                    {STEP_DESC[step]}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Route info */}
        <View style={s.detailCard}>
          <Text style={s.sectionTitle}>Incident Details</Text>
          <Text
            style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 6 }}
            numberOfLines={2}
          >
            {report.origin} {"\u2192"} {report.destination}
          </Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 2 }}>
            {`Body #${report.body_number}`}
          </Text>
          {report.incident_date instanceof Date && (
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 2 }}>
              {`Incident: ${report.incident_date.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}`}
            </Text>
          )}
          {report.createdAt instanceof Date && (
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }}>
              {`Filed: ${report.createdAt.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}`}
            </Text>
          )}
        </View>

        {/* Fare comparison */}
        <View style={s.detailCard}>
          <Text style={s.sectionTitle}>Fare Details</Text>
          <View style={s.fareRow}>
            <View style={s.fareBlock}>
              <Text style={s.fareLabel}>Legal Fare</Text>
              <Text style={{ color: "#22c55e", fontFamily: "Inter_700Bold", fontSize: 20 }}>
                {`\u20B1${report.legal_fare.toFixed(0)}`}
              </Text>
            </View>
            <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
            <View style={s.fareBlock}>
              <Text style={s.fareLabel}>Charged</Text>
              <Text style={{ color: colors.destructive, fontFamily: "Inter_700Bold", fontSize: 20 }}>
                {`\u20B1${report.extorted_fare.toFixed(0)}`}
              </Text>
            </View>
            <View style={s.overchargeBlock}>
              <Text style={s.fareLabel}>Overcharge</Text>
              <Text style={{ color: colors.pink, fontFamily: "Inter_700Bold", fontSize: 20 }}>
                {`+\u20B1${overcharge.toFixed(0)}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {!!report.description && (
          <View style={s.detailCard}>
            <Text style={s.sectionTitle}>Your Description</Text>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 }}>
              {report.description}
            </Text>
          </View>
        )}

        {/* AI Tags */}
        {report.ai_tags.length > 0 && (
          <View style={s.detailCard}>
            <Text style={s.sectionTitle}>Auto-detected Tags</Text>
            <View style={s.tagsRow}>
              {report.ai_tags.map((tag) => (
                <View key={tag} style={s.tag}>
                  <Text style={s.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Evidence photo */}
        {!!report.evidence_url && (
          <View style={s.detailCard}>
            <Text style={s.sectionTitle}>Evidence Photo</Text>
            <Image
              source={{ uri: report.evidence_url }}
              style={s.evidenceImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Info */}
        <View style={s.infoCard}>
          <Feather name="info" size={16} color={colors.pink} />
          <Text style={{ flex: 1, color: colors.pink, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 }}>
            {"Reports are reviewed by the Bulan Municipal office. For urgent concerns, contact PNP at 09098127615 or Public Safety Officer at 09104982400."}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}
