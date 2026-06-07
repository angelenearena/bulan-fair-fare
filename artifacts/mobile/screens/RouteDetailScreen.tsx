import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "../hooks/useColors";
import { getTariffById } from "../services/tariffs";
import { getSettings } from "../services/settings";
import { Tariff, GlobalSettings, SectorType, SECTOR_DISCOUNTS, SECTOR_LABELS, SECTOR_RA } from "../types";
import { Button } from "../components/Button";

const SECTORS: SectorType[] = ["regular", "student", "senior", "pwd"];

export function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [tariff, setTariff] = useState<Tariff | null>(null);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<SectorType>("regular");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [t, s] = await Promise.all([getTariffById(id), getSettings()]);
      if (!t) {
        setError("Route not found. It may have been removed or the link is invalid.");
      } else {
        setTariff(t);
        setSettings(s);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load route";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function computeFare(sector: SectorType): number {
    if (!tariff || !settings) return 0;
    const subtotal =
      settings.base_fare +
      tariff.distance_km * settings.per_km_rate +
      settings.fuel_price_index * 0.01;
    const discount = SECTOR_DISCOUNTS[sector];
    const computed = subtotal * (1 - discount);
    return Math.max(settings.minimum_fare, computed);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
      backgroundColor: colors.card,
      alignItems: "center", justifyContent: "center",
      borderWidth: 1, borderColor: colors.border,
    },
    headerTitle: {
      flex: 1,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
    },
    divider: { height: 1, backgroundColor: colors.border },
    scrollContent: {
      padding: 20,
      paddingBottom: Platform.OS === "web" ? 34 + 84 : 100,
    },
    sectionTitle: {
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 12,
      marginTop: 20,
    },
    routeCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    routeOrigin: {
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      marginBottom: 8,
    },
    routeArrow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    routeDestination: {
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 16,
    },
    routeMeta: { flexDirection: "row", gap: 12, marginTop: 12 },
    metaBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      gap: 5,
    },
    metaText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      fontSize: 12,
    },
    sectorRow: { flexDirection: "row", gap: 8 },
    sectorBtn: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    sectorBtnActive: { borderColor: colors.pink, backgroundColor: colors.pinkMuted },
    sectorLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      marginBottom: 2,
    },
    sectorLabelActive: { color: colors.pink },
    sectorDiscount: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 10,
    },
    sectorDiscountActive: { color: colors.pinkLight },
    fareResultCard: {
      backgroundColor: colors.pink,
      borderRadius: colors.radius,
      padding: 24,
      alignItems: "center",
    },
    fareResultLabel: {
      color: "rgba(255,255,255,0.75)",
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      marginBottom: 6,
    },
    fareResultValue: {
      color: "#ffffff",
      fontFamily: "Inter_700Bold",
      fontSize: 48,
      letterSpacing: -1,
    },
    fareResultSector: {
      color: "rgba(255,255,255,0.75)",
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      marginTop: 4,
    },
    fareBreakdown: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    breakdownRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    breakdownLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
    },
    breakdownValue: {
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
    },
    breakdownDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    breakdownTotalLabel: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
    },
    breakdownTotalValue: {
      color: colors.pink,
      fontFamily: "Inter_700Bold",
      fontSize: 16,
    },
    bodyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    bodyBadge: {
      backgroundColor: colors.card,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bodyText: {
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
    },
    centerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 30,
    },
    errorTitle: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    errorText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 24,
    },
  });

  if (loading) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Loading route...</Text>
        </View>
        <View style={s.divider} />
        <View style={s.centerContainer}>
          <ActivityIndicator size="large" color={colors.pink} />
        </View>
      </View>
    );
  }

  if (error || !tariff) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Route Detail</Text>
        </View>
        <View style={s.divider} />
        <View style={s.centerContainer}>
          <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
          <Text style={s.errorTitle}>Route Not Found</Text>
          <Text style={s.errorText}>
            {error ?? "This route may have been removed or the link is invalid."}
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button
              label="Retry"
              onPress={load}
              variant="outline"
              style={{ minWidth: 100 }}
            />
            <Button
              label="Go Back"
              onPress={() => router.back()}
              style={{ minWidth: 100 }}
            />
          </View>
        </View>
      </View>
    );
  }

  const computedFare = computeFare(selectedSector);
  const subtotal = settings
    ? settings.base_fare + tariff.distance_km * settings.per_km_rate + settings.fuel_price_index * 0.01
    : 0;
  const discountAmount = subtotal * SECTOR_DISCOUNTS[selectedSector];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          {tariff.origin} → {tariff.destination}
        </Text>
      </View>
      <View style={s.divider} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <Text style={s.sectionTitle}>Route</Text>
        <View style={s.routeCard}>
          <Text style={s.routeOrigin}>{tariff.origin}</Text>
          <View style={s.routeArrow}>
            <Feather name="arrow-down" size={16} color={colors.pink} />
          </View>
          <Text style={s.routeDestination}>{tariff.destination}</Text>
          <View style={s.routeMeta}>
            <View style={s.metaBadge}>
              <Feather name="map-pin" size={12} color={colors.mutedForeground} />
              <Text style={s.metaText}>{tariff.distance_km} km</Text>
            </View>
          </View>
        </View>

        <Text style={s.sectionTitle}>Passenger Type</Text>
        <View style={s.sectorRow}>
          {SECTORS.map((sector) => (
            <TouchableOpacity
              key={sector}
              style={[s.sectorBtn, selectedSector === sector && s.sectorBtnActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedSector(sector);
              }}
              activeOpacity={0.75}
            >
              <Text style={[s.sectorLabel, selectedSector === sector && s.sectorLabelActive]}>
                {sector === "senior" ? "Senior" : sector === "pwd" ? "PWD" : SECTOR_LABELS[sector]}
              </Text>
              <Text style={[s.sectorDiscount, selectedSector === sector && s.sectorDiscountActive]}>
                {SECTOR_DISCOUNTS[sector] > 0 ? `-${(SECTOR_DISCOUNTS[sector] * 100).toFixed(0)}%` : "Full"}
              </Text>
              {SECTOR_RA[sector] ? (
                <Text style={{
                  color: selectedSector === sector ? colors.pinkLight : colors.mutedForeground,
                  fontSize: 9, fontFamily: "Inter_400Regular",
                }}>
                  {SECTOR_RA[sector]}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionTitle}>Computed Fare</Text>
        <View style={s.fareResultCard}>
          <Text style={s.fareResultLabel}>Your fare ({SECTOR_LABELS[selectedSector]})</Text>
          <Text style={s.fareResultValue}>₱{computedFare.toFixed(2)}</Text>
          {SECTOR_DISCOUNTS[selectedSector] > 0 && (
            <Text style={s.fareResultSector}>
              {(SECTOR_DISCOUNTS[selectedSector] * 100).toFixed(0)}% discount applied
            </Text>
          )}
        </View>

        <Text style={s.sectionTitle}>Fare Breakdown</Text>
        <View style={s.fareBreakdown}>
          <View style={s.breakdownRow}>
            <Text style={s.breakdownLabel}>Base Fare</Text>
            <Text style={s.breakdownValue}>₱{settings?.base_fare.toFixed(2)}</Text>
          </View>
          <View style={s.breakdownRow}>
            <Text style={s.breakdownLabel}>
              Distance ({tariff.distance_km} km × ₱{settings?.per_km_rate})
            </Text>
            <Text style={s.breakdownValue}>
              ₱{((settings?.per_km_rate ?? 0) * tariff.distance_km).toFixed(2)}
            </Text>
          </View>
          <View style={s.breakdownRow}>
            <Text style={s.breakdownLabel}>Fuel Surcharge</Text>
            <Text style={s.breakdownValue}>₱{((settings?.fuel_price_index ?? 0) * 0.01).toFixed(2)}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={s.breakdownRow}>
              <Text style={s.breakdownLabel}>
                Sector Discount ({(SECTOR_DISCOUNTS[selectedSector] * 100).toFixed(0)}%)
              </Text>
              <Text style={{ color: "#22c55e", fontFamily: "Inter_500Medium", fontSize: 13 }}>
                -₱{discountAmount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={s.breakdownDivider} />
          <View style={s.breakdownRow}>
            <Text style={s.breakdownTotalLabel}>Total</Text>
            <Text style={s.breakdownTotalValue}>₱{computedFare.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Official Fares</Text>
        <View style={s.fareBreakdown}>
          {SECTORS.map((sector) => (
            <View key={sector} style={s.breakdownRow}>
              <Text style={s.breakdownLabel}>{SECTOR_LABELS[sector]}</Text>
              <Text style={[s.breakdownValue, sector === "regular" && { color: colors.pink, fontFamily: "Inter_700Bold" }]}>
                ₱{tariff.fares[sector].toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {tariff.body_numbers.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Authorized Body Numbers</Text>
            <View style={s.bodyRow}>
              {tariff.body_numbers.map((bn) => (
                <View key={bn} style={s.bodyBadge}>
                  <Text style={s.bodyText}>#{bn}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {tariff.description ? (
          <>
            <Text style={s.sectionTitle}>Route Notes</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 }}>
              {tariff.description}
            </Text>
          </>
        ) : null}

        <Text style={s.sectionTitle}>Legal Basis</Text>
        <View style={{
          backgroundColor: colors.card, borderRadius: colors.radius,
          padding: 14, borderWidth: 1, borderColor: colors.border,
        }}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, marginBottom: 6 }}>
            Municipal Ordinance No. 2022-21 — Official tricycle fare matrix from Bulan Poblacion to barangays and vice versa.
          </Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17 }}>
            • Senior Citizen 20% discount — RA 9994{"\n"}
            • Student 20% discount — RA 11314{"\n"}
            • PWD 20% discount — RA 10754{"\n"}
            • Pre-school students — Free (Section 5(d)(e) of the Ordinance)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
