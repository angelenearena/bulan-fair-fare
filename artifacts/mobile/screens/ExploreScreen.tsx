import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "../hooks/useColors";
import { getTariffs } from "../services/tariffs";
import { Tariff } from "../types";

const HUBS = [
  { name: "Poblacion", zone: "Zone 1-4", icon: "home" as const, description: "Municipal center & main terminal" },
  { name: "Sabang", zone: "Coastal", icon: "anchor" as const, description: "Coastal barangay hub" },
  { name: "Calintaan", zone: "Zone 5", icon: "map-pin" as const, description: "Northern zone hub" },
  { name: "Fabrica", zone: "Zone 6", icon: "package" as const, description: "Industrial zone terminal" },
  { name: "Buenavista", zone: "Zone 7", icon: "sun" as const, description: "Eastern barangay hub" },
  { name: "Danao", zone: "Zone 8", icon: "droplet" as const, description: "River district hub" },
];

export function ExploreScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [selectedHub, setSelectedHub] = useState<string | null>(null);

  useEffect(() => {
    getTariffs().then(setTariffs).catch(console.error);
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const hubRoutes = selectedHub
    ? tariffs.filter(
        (t) =>
          t.origin.toLowerCase().includes(selectedHub.toLowerCase()) ||
          t.destination.toLowerCase().includes(selectedHub.toLowerCase())
      )
    : [];

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
    section: { paddingHorizontal: 20, paddingTop: 20 },
    sectionTitle: {
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 12,
    },
    hubsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 24,
    },
    hubCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      width: "47%",
      borderWidth: 1,
      borderColor: colors.border,
    },
    hubCardActive: {
      borderColor: colors.pink,
      backgroundColor: colors.pinkMuted,
    },
    hubIcon: {
      marginBottom: 10,
    },
    hubName: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      marginBottom: 2,
    },
    hubNameActive: { color: colors.pink },
    hubZone: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      marginBottom: 4,
    },
    hubDesc: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      lineHeight: 15,
    },
    routeItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    routeText: {
      flex: 1,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
    },
    routeFare: {
      color: colors.pink,
      fontFamily: "Inter_700Bold",
      fontSize: 14,
    },
    emptyHub: {
      alignItems: "center",
      paddingVertical: 30,
    },
    emptyText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      marginTop: 8,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    statValue: {
      color: colors.pink,
      fontFamily: "Inter_700Bold",
      fontSize: 24,
    },
    statLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      textAlign: "center",
    },
    scrollContent: {
      paddingBottom: Platform.OS === "web" ? 34 + 84 : 100,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Explore</Text>
        <Text style={s.subtitle}>Navigate Bulan's transport network</Text>
      </View>
      <View style={s.divider} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Network Overview</Text>
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statValue}>{tariffs.length}</Text>
              <Text style={s.statLabel}>Routes</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statValue}>{HUBS.length}</Text>
              <Text style={s.statLabel}>Hubs</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statValue}>
                {tariffs.length > 0
                  ? `₱${Math.min(...tariffs.map((t) => t.fares.regular)).toFixed(0)}`
                  : "₱10"}
              </Text>
              <Text style={s.statLabel}>Min Fare</Text>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Transport Hubs</Text>
          <View style={s.hubsGrid}>
            {HUBS.map((hub) => {
              const isActive = selectedHub === hub.name;
              return (
                <TouchableOpacity
                  key={hub.name}
                  style={[s.hubCard, isActive && s.hubCardActive]}
                  onPress={() => setSelectedHub(isActive ? null : hub.name)}
                  activeOpacity={0.75}
                >
                  <Feather
                    name={hub.icon}
                    size={20}
                    color={isActive ? colors.pink : colors.mutedForeground}
                    style={s.hubIcon}
                  />
                  <Text style={[s.hubName, isActive && s.hubNameActive]}>{hub.name}</Text>
                  <Text style={s.hubZone}>{hub.zone}</Text>
                  <Text style={s.hubDesc}>{hub.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {selectedHub && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Routes via {selectedHub}</Text>
            {hubRoutes.length === 0 ? (
              <View style={s.emptyHub}>
                <Feather name="map-pin" size={28} color={colors.mutedForeground} />
                <Text style={s.emptyText}>No routes found for this hub</Text>
              </View>
            ) : (
              hubRoutes.map((route) => (
                <TouchableOpacity
                  key={route.id}
                  style={s.routeItem}
                  onPress={() => router.push(`/route/${route.id}`)}
                  activeOpacity={0.75}
                >
                  <Text style={s.routeText} numberOfLines={1}>
                    {route.origin} → {route.destination}
                  </Text>
                  <Text style={s.routeFare}>₱{route.fares.regular}</Text>
                  <Feather name="chevron-right" size={14} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
