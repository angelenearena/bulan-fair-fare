import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "../hooks/useColors";
import { useDebounce } from "../hooks/useDebounce";
import { TariffCard } from "../components/TariffCard";
import { TariffCardSkeleton } from "../components/LoadingSkeleton";
import { getTariffs } from "../services/tariffs";
import { Tariff } from "../types";

export function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Fare calculator state
  const [calcExpanded, setCalcExpanded] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [selectedDest, setSelectedDest] = useState<string | null>(null);
  const [showOriginPicker, setShowOriginPicker] = useState(false);
  const [showDestPicker, setShowDestPicker] = useState(false);

  async function loadTariffs() {
    try {
      const data = await getTariffs();
      setTariffs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadTariffs();
  }, []);

  function onRefresh() {
    setRefreshing(true);
    loadTariffs();
  }

  // Derived fare calculator data
  const origins = useMemo(() => {
    const set = new Set(tariffs.map((t) => t.origin));
    return [...set].sort();
  }, [tariffs]);

  const destinations = useMemo(() => {
    if (!selectedOrigin) return [];
    const set = new Set(
      tariffs.filter((t) => t.origin === selectedOrigin).map((t) => t.destination)
    );
    return [...set].sort();
  }, [tariffs, selectedOrigin]);

  const matchedTariff = useMemo(() => {
    if (!selectedOrigin || !selectedDest) return null;
    return tariffs.find(
      (t) => t.origin === selectedOrigin && t.destination === selectedDest
    ) ?? null;
  }, [tariffs, selectedOrigin, selectedDest]);

  function handleSelectOrigin(origin: string) {
    setSelectedOrigin(origin);
    setSelectedDest(null);
    setShowOriginPicker(false);
    Haptics.selectionAsync();
  }

  function handleSelectDest(dest: string) {
    setSelectedDest(dest);
    setShowDestPicker(false);
    Haptics.selectionAsync();
  }

  const filtered = tariffs.filter((t) => {
    const q = debouncedSearch.toLowerCase();
    return (
      !q ||
      t.origin.toLowerCase().includes(q) ||
      t.destination.toLowerCase().includes(q) ||
      t.body_numbers.some((bn) => bn.includes(q))
    );
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    appName: {
      color: colors.pink,
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      letterSpacing: -0.5,
    },
    subtitle: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      marginBottom: 16,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      height: 44,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
    },
    divider: { height: 1, backgroundColor: colors.border },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Platform.OS === "web" ? 34 + 84 : 100,
    },
    countText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      marginBottom: 12,
    },
    emptyContainer: { alignItems: "center", paddingTop: 60 },
    emptyText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      marginTop: 12,
    },

    // Fare calculator
    calcCard: {
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 4,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    calcHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    calcTitle: {
      flex: 1,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
    },
    calcSubtitle: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
    },
    calcBody: {
      paddingHorizontal: 14,
      paddingBottom: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    calcPickerBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.input,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 11,
      marginTop: 10,
      gap: 8,
    },
    calcPickerLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      marginBottom: 2,
    },
    calcPickerText: {
      flex: 1,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
    },
    calcPickerPlaceholder: {
      flex: 1,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
    },
    calcArrow: {
      alignItems: "center",
      marginTop: 8,
    },
    calcResult: {
      backgroundColor: colors.pinkMuted,
      borderRadius: 10,
      padding: 14,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.pink + "44",
    },
    calcResultRoute: {
      color: colors.pink,
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      marginBottom: 10,
      textAlign: "center",
    },
    calcFaresRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 12,
    },
    calcFareItem: { alignItems: "center" },
    calcFareLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 10,
      marginBottom: 2,
    },
    calcFareValue: {
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 16,
    },
    calcFareRegular: { color: colors.pink },
    calcDetailsBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: colors.pink,
      borderRadius: 8,
      paddingVertical: 8,
    },
    calcDetailsBtnText: {
      color: "#fff",
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
    },

    // Picker overlay
    pickerOverlay: {
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      zIndex: 200,
      justifyContent: "flex-end",
    },
    pickerSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "70%",
      paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 10,
    },
    pickerSheetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerSheetTitle: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
    },
    pickerItem: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerItemText: {
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
    },
  });

  function renderCalcFareResult() {
    if (!matchedTariff) return null;
    return (
      <View style={s.calcResult}>
        <Text style={s.calcResultRoute} numberOfLines={1}>
          {matchedTariff.origin} → {matchedTariff.destination} · {matchedTariff.distance_km} km
        </Text>
        <View style={s.calcFaresRow}>
          {(["regular", "student", "senior", "pwd"] as const).map((key) => (
            <View key={key} style={s.calcFareItem}>
              <Text style={s.calcFareLabel}>
                {key === "senior" ? "Senior" : key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              <Text style={[s.calcFareValue, key === "regular" && s.calcFareRegular]}>
                ₱{matchedTariff.fares[key].toFixed(0)}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={s.calcDetailsBtn}
          onPress={() => router.push(`/route/${matchedTariff.id}`)}
          activeOpacity={0.8}
        >
          <Text style={s.calcDetailsBtnText}>View Full Breakdown</Text>
          <Feather name="arrow-right" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  function renderFareCalculator() {
    return (
      <View style={s.calcCard}>
        <TouchableOpacity
          style={s.calcHeader}
          onPress={() => {
            setCalcExpanded((v) => !v);
            Haptics.selectionAsync();
          }}
          activeOpacity={0.8}
        >
          <View style={{
            width: 32, height: 32, borderRadius: 8,
            backgroundColor: colors.pinkMuted,
            alignItems: "center", justifyContent: "center",
          }}>
            <Feather name="map-pin" size={16} color={colors.pink} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.calcTitle}>Quick Fare Lookup</Text>
            <Text style={s.calcSubtitle}>Pick origin & destination to see fare</Text>
          </View>
          <Feather
            name={calcExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>

        {calcExpanded && (
          <View style={s.calcBody}>
            <Text style={s.calcPickerLabel}>FROM</Text>
            <TouchableOpacity
              style={s.calcPickerBtn}
              onPress={() => setShowOriginPicker(true)}
              activeOpacity={0.75}
            >
              <Feather name="navigation" size={14} color={selectedOrigin ? colors.pink : colors.mutedForeground} />
              {selectedOrigin ? (
                <Text style={s.calcPickerText} numberOfLines={1}>{selectedOrigin}</Text>
              ) : (
                <Text style={s.calcPickerPlaceholder}>Select origin...</Text>
              )}
              <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>

            <View style={s.calcArrow}>
              <Feather name="arrow-down" size={14} color={colors.pink} />
            </View>

            <Text style={s.calcPickerLabel}>TO</Text>
            <TouchableOpacity
              style={[s.calcPickerBtn, !selectedOrigin && { opacity: 0.4 }]}
              onPress={() => selectedOrigin && setShowDestPicker(true)}
              activeOpacity={0.75}
              disabled={!selectedOrigin}
            >
              <Feather name="map-pin" size={14} color={selectedDest ? colors.pink : colors.mutedForeground} />
              {selectedDest ? (
                <Text style={s.calcPickerText} numberOfLines={1}>{selectedDest}</Text>
              ) : (
                <Text style={s.calcPickerPlaceholder}>
                  {selectedOrigin ? "Select destination..." : "Select origin first"}
                </Text>
              )}
              <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>

            {renderCalcFareResult()}
          </View>
        )}
      </View>
    );
  }

  function renderHeader() {
    return (
      <View>
        <Text style={s.countText}>
          {filtered.length} route{filtered.length !== 1 ? "s" : ""} available
        </Text>
      </View>
    );
  }

  function renderEmpty() {
    if (loading) return null;
    return (
      <View style={s.emptyContainer}>
        <Feather name="map" size={40} color={colors.mutedForeground} />
        <Text style={s.emptyText}>No routes found</Text>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 }}>
          Try a different search term
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.appName}>FairFare</Text>
          <Feather name="info" size={20} color={colors.mutedForeground} />
        </View>
        <Text style={s.subtitle}>Official Bulan tricycle fare matrix</Text>
        <View style={s.searchRow}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            placeholder="Search origin, destination..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={s.divider} />

      {!debouncedSearch && renderFareCalculator()}

      {loading ? (
        <View style={s.listContent}>
          {[0, 1, 2, 3].map((i) => <TariffCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.pink}
            />
          }
          renderItem={({ item }) => (
            <TariffCard
              tariff={item}
              onPress={() => router.push(`/route/${item.id}`)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Origin picker sheet */}
      {showOriginPicker && (
        <View style={s.pickerOverlay}>
          <View style={s.pickerSheet}>
            <View style={s.pickerSheetHeader}>
              <Text style={s.pickerSheetTitle}>Select Origin</Text>
              <TouchableOpacity onPress={() => setShowOriginPicker(false)}>
                <Feather name="x" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {origins.map((origin) => (
                <TouchableOpacity
                  key={origin}
                  style={[s.pickerItem, selectedOrigin === origin && { backgroundColor: colors.pinkMuted }]}
                  onPress={() => handleSelectOrigin(origin)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.pickerItemText, selectedOrigin === origin && { color: colors.pink, fontFamily: "Inter_500Medium" }]}>
                    {origin}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Destination picker sheet */}
      {showDestPicker && (
        <View style={s.pickerOverlay}>
          <View style={s.pickerSheet}>
            <View style={s.pickerSheetHeader}>
              <Text style={s.pickerSheetTitle}>Select Destination</Text>
              <TouchableOpacity onPress={() => setShowDestPicker(false)}>
                <Feather name="x" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {destinations.map((dest) => (
                <TouchableOpacity
                  key={dest}
                  style={[s.pickerItem, selectedDest === dest && { backgroundColor: colors.pinkMuted }]}
                  onPress={() => handleSelectDest(dest)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.pickerItemText, selectedDest === dest && { color: colors.pink, fontFamily: "Inter_500Medium" }]}>
                    {dest}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}
