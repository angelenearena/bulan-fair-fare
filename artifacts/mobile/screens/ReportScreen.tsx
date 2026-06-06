import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "../hooks/useColors";
import { useAuthContext } from "../context/AuthContext";
import { getTariffs } from "../services/tariffs";
import { createReport } from "../services/reports";
import { Tariff } from "../types";
import { Button } from "../components/Button";

export function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isGuest } = useAuthContext();

  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [bodyNumber, setBodyNumber] = useState("");
  const [extortedFare, setExtortedFare] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showTariffPicker, setShowTariffPicker] = useState(false);

  useEffect(() => {
    getTariffs().then(setTariffs).catch(console.error);
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
    scrollContent: {
      padding: 20,
      paddingBottom: Platform.OS === "web" ? 34 + 84 : 100,
    },
    guestBanner: {
      backgroundColor: colors.pinkMuted,
      borderRadius: colors.radius,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
    },
    guestText: {
      flex: 1,
      color: colors.pink,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      lineHeight: 18,
    },
    label: {
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      marginBottom: 8,
      marginTop: 16,
    },
    required: { color: colors.pink },
    input: {
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
    },
    selectBtn: {
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    selectText: {
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      flex: 1,
    },
    selectPlaceholder: { color: colors.mutedForeground },
    textarea: {
      height: 90,
      textAlignVertical: "top",
    },
    pickerOverlay: {
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      zIndex: 100,
      justifyContent: "flex-end",
    },
    pickerSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "60%",
      paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 10,
    },
    pickerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerTitle: {
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
    pickerItemFare: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      marginTop: 2,
    },
    fareHint: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 6,
    },
    fareHintText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
    },
    fareHintValue: { color: colors.pink, fontFamily: "Inter_600SemiBold" },
    submitBtn: { marginTop: 24 },
  });

  async function handleSubmit() {
    if (!user) return;
    if (!selectedTariff || !bodyNumber.trim() || !extortedFare || !description.trim()) {
      Alert.alert("Incomplete Form", "Please fill in all required fields.");
      return;
    }
    const extorted = parseFloat(extortedFare);
    if (isNaN(extorted) || extorted <= 0) {
      Alert.alert("Invalid Fare", "Please enter a valid fare amount.");
      return;
    }
    if (extorted <= selectedTariff.fares.regular) {
      Alert.alert("No Overcharge", "The entered fare is not greater than the regular fare.");
      return;
    }

    setSubmitting(true);
    try {
      await createReport({
        user_id: user.uid,
        body_number: bodyNumber.trim(),
        origin: selectedTariff.origin,
        destination: selectedTariff.destination,
        legal_fare: selectedTariff.fares.regular,
        extorted_fare: extorted,
        description: description.trim(),
        incident_date: new Date(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Report Submitted", "Your overcharging report has been filed successfully.", [
        { text: "OK", onPress: () => {
          setSelectedTariff(null);
          setBodyNumber("");
          setExtortedFare("");
          setDescription("");
        }}
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isGuest) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Report</Text>
          <Text style={s.subtitle}>File an overcharging complaint</Text>
        </View>
        <View style={s.divider} />
        <View style={{ flex: 1, padding: 20 }}>
          <View style={s.guestBanner}>
            <Feather name="lock" size={20} color={colors.pink} />
            <Text style={s.guestText}>
              Sign in as a commuter to file overcharging reports and protect your rights.
            </Text>
          </View>
          <Button label="Sign In to Report" onPress={() => router.push("/auth")} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Report</Text>
        <Text style={s.subtitle}>File an overcharging complaint</Text>
      </View>
      <View style={s.divider} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <Text style={[s.label, { marginTop: 0 }]}>
          Route <Text style={s.required}>*</Text>
        </Text>
        <TouchableOpacity style={s.selectBtn} onPress={() => setShowTariffPicker(true)}>
          <Text style={[s.selectText, !selectedTariff && s.selectPlaceholder]} numberOfLines={1}>
            {selectedTariff
              ? `${selectedTariff.origin} → ${selectedTariff.destination}`
              : "Select route..."}
          </Text>
          <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
        {selectedTariff && (
          <View style={s.fareHint}>
            <Feather name="info" size={12} color={colors.mutedForeground} />
            <Text style={s.fareHintText}>
              Official regular fare:{" "}
              <Text style={s.fareHintValue}>₱{selectedTariff.fares.regular.toFixed(2)}</Text>
            </Text>
          </View>
        )}

        <Text style={s.label}>
          Body Number <Text style={s.required}>*</Text>
        </Text>
        <TextInput
          style={s.input}
          placeholder="e.g. 0456"
          placeholderTextColor={colors.mutedForeground}
          value={bodyNumber}
          onChangeText={setBodyNumber}
          keyboardType="numeric"
        />

        <Text style={s.label}>
          Amount Charged <Text style={s.required}>*</Text>
        </Text>
        <TextInput
          style={s.input}
          placeholder="₱ 0.00"
          placeholderTextColor={colors.mutedForeground}
          value={extortedFare}
          onChangeText={setExtortedFare}
          keyboardType="decimal-pad"
        />

        <Text style={s.label}>
          Description <Text style={s.required}>*</Text>
        </Text>
        <TextInput
          style={[s.input, s.textarea]}
          placeholder="Describe what happened..."
          placeholderTextColor={colors.mutedForeground}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4 }}>
          Keywords like "overcharge", "rude", "mabilis" will auto-tag your report.
        </Text>

        <Button
          label="Submit Report"
          onPress={handleSubmit}
          loading={submitting}
          fullWidth
          style={s.submitBtn}
        />
      </ScrollView>

      {showTariffPicker && (
        <View style={s.pickerOverlay}>
          <View style={s.pickerSheet}>
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>Select Route</Text>
              <TouchableOpacity onPress={() => setShowTariffPicker(false)}>
                <Feather name="x" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {tariffs.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={s.pickerItem}
                  onPress={() => {
                    setSelectedTariff(t);
                    setShowTariffPicker(false);
                  }}
                >
                  <Text style={s.pickerItemText}>{t.origin} → {t.destination}</Text>
                  <Text style={s.pickerItemFare}>₱{t.fares.regular} regular · {t.distance_km} km</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}
