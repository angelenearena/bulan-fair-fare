import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "../hooks/useColors";
import { useAuthContext } from "../context/AuthContext";
import { subscribeToAllReports, updateReportStatus, archiveReport } from "../services/reports";
import { getSettings, updateSettings } from "../services/settings";
import { createTariff, getTariffs, deleteTariff } from "../services/tariffs";
import { seedTariffs } from "../services/seedData";
import { OverchargingReport, GlobalSettings, Tariff } from "../types";
import { Button } from "../components/Button";
import { ReportItemSkeleton } from "../components/LoadingSkeleton";
import { useUnreadReports } from "../hooks/useUnreadReports";

const STATUS_OPTIONS: OverchargingReport["status"][] = ["Pending", "Reviewed", "Resolved"];
const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Reviewed: "#3b82f6",
  Resolved: "#22c55e",
};

type AdminTab = "reports" | "tariffs" | "settings";

export function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAdmin } = useAuthContext();
  const { unreadCount, markAllRead } = useUnreadReports();

  const [activeTab, setActiveTab] = useState<AdminTab>("reports");
  const [reports, setReports] = useState<OverchargingReport[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Settings form
  const [baseFare, setBaseFare] = useState("");
  const [perKmRate, setPerKmRate] = useState("");
  const [minFare, setMinFare] = useState("");
  const [fuelIndex, setFuelIndex] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedLog, setSeedLog] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToAllReports(
      (data) => {
        setReports(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    getTariffs().then(setTariffs).catch(() => null);
    getSettings()
      .then((s) => {
        setSettings(s);
        setBaseFare(s.base_fare.toString());
        setPerKmRate(s.per_km_rate.toString());
        setMinFare(s.minimum_fare.toString());
        setFuelIndex(s.fuel_price_index.toString());
      })
      .catch(() => null);
    return unsub;
  }, []);

  // Mark reports as read when the reports tab is active
  useEffect(() => {
    if (activeTab === "reports") {
      markAllRead();
    }
  }, [activeTab, markAllRead]);

  async function handleStatusChange(reportId: string, status: OverchargingReport["status"]) {
    try {
      await updateReportStatus(reportId, status);
    } catch {
      Alert.alert("Error", "Failed to update status.");
    }
  }

  async function handleArchive(reportId: string) {
    Alert.alert("Archive Report", "This will soft-delete the report. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Archive",
        style: "destructive",
        onPress: async () => {
          await archiveReport(reportId);
        },
      },
    ]);
  }

  async function handleSeedData() {
    Alert.alert(
      "Load Official Tariff Data",
      "This will replace ALL existing tariff routes with the 56 official routes from Municipal Ordinance No. 2022-21. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Load Data",
          onPress: async () => {
            setSeeding(true);
            setSeedLog("Starting...");
            try {
              const count = await seedTariffs((msg) => setSeedLog(msg));
              getTariffs().then(setTariffs);
              Alert.alert("Success", `${count} official routes loaded from Municipal Ordinance No. 2022-21.`);
            } catch (e: any) {
              Alert.alert("Error", `Seeding failed: ${e?.message ?? "Unknown error"}`);
            } finally {
              setSeeding(false);
              setSeedLog("");
            }
          },
        },
      ]
    );
  }

  async function handleSaveSettings() {
    if (!user) return;
    const bf = parseFloat(baseFare);
    const pkr = parseFloat(perKmRate);
    const mf = parseFloat(minFare);
    const fi = parseFloat(fuelIndex);
    if (isNaN(bf) || isNaN(pkr) || isNaN(mf) || isNaN(fi)) {
      Alert.alert("Invalid Values", "Please enter valid numbers for all settings.");
      return;
    }
    setSavingSettings(true);
    try {
      await updateSettings({ base_fare: bf, per_km_rate: pkr, minimum_fare: mf, fuel_price_index: fi }, user.uid);
      Alert.alert("Saved", "Global settings updated successfully.");
    } catch {
      Alert.alert("Error", "Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Feather name="lock" size={40} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 15, marginTop: 12 }}>
          Admin access required
        </Text>
      </View>
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
      fontSize: 18,
    },
    adminBadge: {
      backgroundColor: colors.pinkMuted,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    adminBadgeText: {
      color: colors.pink,
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
    },
    bellBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.card, alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.border,
      position: "relative",
    },
    bellBadge: {
      position: "absolute",
      top: -4, right: -4,
      backgroundColor: colors.pink,
      borderRadius: 10,
      minWidth: 18, height: 18,
      alignItems: "center", justifyContent: "center",
      paddingHorizontal: 3,
      borderWidth: 2,
      borderColor: colors.background,
    },
    bellBadgeText: {
      color: "#ffffff",
      fontFamily: "Inter_700Bold",
      fontSize: 9,
    },
    divider: { height: 1, backgroundColor: colors.border },
    tabBar: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
      backgroundColor: colors.card,
    },
    tabActive: { backgroundColor: colors.pink },
    tabText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      fontSize: 12,
    },
    tabTextActive: { color: "#ffffff" },
    content: { flex: 1 },
    listContent: {
      padding: 16,
      paddingBottom: Platform.OS === "web" ? 34 : 40,
    },
    reportCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reportHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    reportRoute: {
      flex: 1,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      marginRight: 8,
    },
    statusActions: {
      flexDirection: "row",
      gap: 6,
      marginTop: 8,
      flexWrap: "wrap",
    },
    statusBtn: {
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
    },
    statusBtnText: {
      fontFamily: "Inter_500Medium",
      fontSize: 11,
    },
    archiveBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginLeft: "auto",
    },
    archiveText: {
      color: colors.destructive,
      fontFamily: "Inter_500Medium",
      fontSize: 12,
    },
    label: {
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: colors.input,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
    },
    tariffItem: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    tariffText: {
      flex: 1,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
    },
    tariffFare: {
      color: colors.pink,
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      marginRight: 10,
    },
    statsRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      color: colors.pink,
      fontFamily: "Inter_700Bold",
      fontSize: 20,
    },
    statLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      textAlign: "center",
    },
  });

  const pending = reports.filter((r) => r.status === "Pending").length;
  const reviewed = reports.filter((r) => r.status === "Reviewed").length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Admin Dashboard</Text>
        <View style={s.adminBadge}>
          <Text style={s.adminBadgeText}>ADMIN</Text>
        </View>
        <TouchableOpacity
          style={s.bellBtn}
          onPress={() => setActiveTab("reports")}
          activeOpacity={0.75}
        >
          <Feather name="bell" size={20} color={unreadCount > 0 ? colors.pink : colors.mutedForeground} />
          {unreadCount > 0 && (
            <View style={s.bellBadge}>
              <Text style={s.bellBadgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={s.divider} />

      <View style={s.tabBar}>
        {(["reports", "tariffs", "settings"] as AdminTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "reports" && pending > 0 ? ` (${pending})` : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "reports" && (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          ListHeaderComponent={
            <View style={s.statsRow}>
              {[
                { label: "Pending", value: pending, color: "#f59e0b" },
                { label: "Reviewed", value: reviewed, color: "#3b82f6" },
                { label: "Resolved", value: resolved, color: "#22c55e" },
              ].map((stat) => (
                <View key={stat.label} style={s.statCard}>
                  <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <View>{[0, 1, 2].map((i) => <ReportItemSkeleton key={i} />)}</View>
            ) : (
              <View style={{ alignItems: "center", paddingTop: 40 }}>
                <Feather name="inbox" size={40} color={colors.mutedForeground} />
                <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular", fontSize: 14 }}>
                  No reports to review
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <View style={s.reportCard}>
              <View style={s.reportHeader}>
                <Text style={s.reportRoute} numberOfLines={1}>
                  {item.origin} → {item.destination}
                </Text>
                <View style={{
                  backgroundColor: STATUS_COLORS[item.status] + "22",
                  borderRadius: 20,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}>
                  <Text style={{ color: STATUS_COLORS[item.status], fontFamily: "Inter_600SemiBold", fontSize: 11 }}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 4 }}>
                Body #{item.body_number} · ₱{item.legal_fare} → ₱{item.extorted_fare}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 8 }} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                {item.ai_tags.map((tag) => (
                  <View key={tag} style={{ backgroundColor: colors.pinkMuted, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: colors.pink, fontFamily: "Inter_500Medium", fontSize: 10 }}>{tag}</Text>
                  </View>
                ))}
              </View>
              <View style={s.statusActions}>
                {STATUS_OPTIONS.filter((s) => s !== item.status).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[s.statusBtn, { borderColor: STATUS_COLORS[status], backgroundColor: STATUS_COLORS[status] + "22" }]}
                    onPress={() => handleStatusChange(item.id, status)}
                  >
                    <Text style={[s.statusBtnText, { color: STATUS_COLORS[status] }]}>→ {status}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={s.archiveBtn} onPress={() => handleArchive(item.id)}>
                  <Feather name="archive" size={13} color={colors.destructive} />
                  <Text style={s.archiveText}>Archive</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "tariffs" && (
        <FlatList
          data={tariffs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          ListHeaderComponent={
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 12 }}>
                {tariffs.length} route{tariffs.length !== 1 ? "s" : ""} in database
              </Text>
              <View style={{ backgroundColor: colors.pinkMuted, borderRadius: 10, padding: 12, marginBottom: 4 }}>
                <Text style={{ color: colors.pink, fontFamily: "Inter_600SemiBold", fontSize: 13, marginBottom: 4 }}>
                  Official Tariff Data (Municipal Ordinance No. 2022-21)
                </Text>
                <Text style={{ color: colors.pink, fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 10, lineHeight: 17 }}>
                  Load all 56 official Bulan tricycle routes. Fares based on ₱60.00–₱69.00 fuel range. Student/Senior/PWD discounts: 20%.
                </Text>
                {!!seedLog && (
                  <Text style={{ color: colors.pink, fontFamily: "Inter_400Regular", fontSize: 11, marginBottom: 8 }}>
                    {seedLog}
                  </Text>
                )}
                <Button
                  label={seeding ? "Loading data..." : "Load Official Routes"}
                  onPress={handleSeedData}
                  loading={seeding}
                  variant="primary"
                  size="sm"
                />
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <Feather name="map" size={40} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular", fontSize: 14 }}>
                No routes configured
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.tariffItem}>
              <View style={{ flex: 1 }}>
                <Text style={s.tariffText} numberOfLines={1}>
                  {item.origin} → {item.destination}
                </Text>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 }}>
                  {item.distance_km} km
                </Text>
              </View>
              <Text style={s.tariffFare}>₱{item.fares.regular}</Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Delete Route", "Remove this route permanently?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: async () => {
                      await deleteTariff(item.id);
                      getTariffs().then(setTariffs);
                    }},
                  ]);
                }}
              >
                <Feather name="trash-2" size={16} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "settings" && (
        <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 16, lineHeight: 18 }}>
            Adjust the global fare computation parameters. Changes take effect immediately for all fare calculations.
          </Text>
          <Text style={[s.label, { marginTop: 0 }]}>Base Fare (₱)</Text>
          <TextInput
            style={s.input}
            value={baseFare}
            onChangeText={setBaseFare}
            keyboardType="decimal-pad"
            placeholder="15.00"
            placeholderTextColor={colors.mutedForeground}
          />
          <Text style={s.label}>Per-KM Rate (₱)</Text>
          <TextInput
            style={s.input}
            value={perKmRate}
            onChangeText={setPerKmRate}
            keyboardType="decimal-pad"
            placeholder="2.50"
            placeholderTextColor={colors.mutedForeground}
          />
          <Text style={s.label}>Minimum Fare (₱)</Text>
          <TextInput
            style={s.input}
            value={minFare}
            onChangeText={setMinFare}
            keyboardType="decimal-pad"
            placeholder="10.00"
            placeholderTextColor={colors.mutedForeground}
          />
          <Text style={s.label}>Fuel Price Index</Text>
          <TextInput
            style={s.input}
            value={fuelIndex}
            onChangeText={setFuelIndex}
            keyboardType="decimal-pad"
            placeholder="62.50"
            placeholderTextColor={colors.mutedForeground}
          />
          <Button
            label="Save Settings"
            onPress={handleSaveSettings}
            loading={savingSettings}
            fullWidth
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      )}
    </View>
  );
}
