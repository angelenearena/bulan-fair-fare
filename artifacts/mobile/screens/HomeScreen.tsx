import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    clearBtn: {
      padding: 2,
    },
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
    emptyContainer: {
      alignItems: "center",
      paddingTop: 60,
    },
    emptyText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      marginTop: 12,
    },
    emptySubtext: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
  });

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
        <Text style={s.emptySubtext}>Try a different search term</Text>
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
            <TouchableOpacity onPress={() => setSearch("")} style={s.clearBtn}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={s.divider} />
      {loading ? (
        <View style={s.listContent}>
          {[0, 1, 2, 3].map((i) => (
            <TariffCardSkeleton key={i} />
          ))}
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
          scrollEnabled={!!filtered.length}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
