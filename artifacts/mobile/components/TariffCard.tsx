import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../hooks/useColors";
import { Tariff } from "../types";

interface TariffCardProps {
  tariff: Tariff;
  onPress?: () => void;
}

export function TariffCard({ tariff, onPress }: TariffCardProps) {
  const colors = useColors();

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
      alignItems: "flex-start",
      marginBottom: 12,
    },
    routeInfo: {
      flex: 1,
    },
    origin: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      lineHeight: 20,
    },
    arrowRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 4,
    },
    destination: {
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      lineHeight: 20,
    },
    distanceBadge: {
      backgroundColor: colors.pinkMuted,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 3,
      alignSelf: "flex-start",
    },
    distanceText: {
      color: colors.pink,
      fontFamily: "Inter_500Medium",
      fontSize: 12,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 12,
    },
    faresRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    fareItem: {
      alignItems: "center",
    },
    fareLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      marginBottom: 2,
    },
    fareValue: {
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 14,
    },
    regularFare: {
      color: colors.pink,
    },
    chevron: {
      marginTop: 2,
    },
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      style={s.card}
    >
      <View style={s.header}>
        <View style={s.routeInfo}>
          <Text style={s.origin} numberOfLines={1}>{tariff.origin}</Text>
          <View style={s.arrowRow}>
            <Feather name="arrow-right" size={14} color={colors.pink} />
          </View>
          <Text style={s.destination} numberOfLines={1}>{tariff.destination}</Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 8 }}>
          <View style={s.distanceBadge}>
            <Text style={s.distanceText}>{tariff.distance_km} km</Text>
          </View>
          {onPress && (
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={s.chevron} />
          )}
        </View>
      </View>
      <View style={s.divider} />
      <View style={s.faresRow}>
        {(["regular", "student", "senior", "pwd"] as const).map((key) => (
          <View key={key} style={s.fareItem}>
            <Text style={s.fareLabel}>
              {key === "senior" ? "Senior" : key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
            <Text style={[s.fareValue, key === "regular" && s.regularFare]}>
              ₱{tariff.fares[key].toFixed(0)}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}
