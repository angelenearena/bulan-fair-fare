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
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useColors } from "../hooks/useColors";
import { useAuthContext } from "../context/AuthContext";
import { getTariffs } from "../services/tariffs";
import { createReport } from "../services/reports";
import { uploadBase64Image } from "../services/storage";
import { notifyAdminsOfReport } from "../services/notifications";
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
  const [evidenceUri, setEvidenceUri] = useState<string | null>(null);
  const [evidenceBase64, setEvidenceBase64] = useState<string | null>(null);
  const [evidenceMime, setEvidenceMime] = useState<string>("image/jpeg");
  const [submitting, setSubmitting] = useState(false);
  const [showTariffPicker, setShowTariffPicker] = useState(false);

  useEffect(() => {
    getTariffs().then(setTariffs).catch(() => null);
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Permission Required", "Please allow camera access to capture evidence photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setEvidenceUri(asset.uri);
      setEvidenceBase64(asset.base64 ?? null);
      setEvidenceMime(asset.mimeType ?? "image/jpeg");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Gallery Permission Required", "Please allow photo library access to attach evidence.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setEvidenceUri(asset.uri);
      setEvidenceBase64(asset.base64 ?? null);
      setEvidenceMime(asset.mimeType ?? "image/jpeg");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  function removeEvidence() {
    Alert.alert("Remove Photo", "Remove the attached evidence photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setEvidenceUri(null);
          setEvidenceBase64(null);
        },
      },
    ]);
  }

  async function handleSubmit() {
    if (!user) return;

    if (!selectedTariff) {
      Alert.alert("Select Route", "Please select the route where overcharging occurred.");
      return;
    }
    if (!bodyNumber.trim()) {
      Alert.alert("Body Number Required", "Please enter the tricycle body number.");
      return;
    }
    if (!extortedFare || isNaN(parseFloat(extortedFare))) {
      Alert.alert("Amount Required", "Please enter the amount you were charged.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Description Required", "Please briefly describe what happened.");
      return;
    }

    const extorted = parseFloat(extortedFare);
    if (extorted <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid fare amount.");
      return;
    }
    if (extorted <= selectedTariff.fares.regular) {
      Alert.alert(
        "No Overcharge Detected",
        `The amount you entered (₱${extorted.toFixed(2)}) is not greater than the official regular fare (₱${selectedTariff.fares.regular.toFixed(2)}). If you believe you were overcharged, please enter the exact amount the driver demanded.`
      );
      return;
    }

    setSubmitting(true);
    let evidence_url: string | undefined;

    // Evidence upload is non-blocking — if it fails, the report still submits
    if (evidenceBase64 && Platform.OS !== "web") {
      try {
        const ext = evidenceMime.includes("png") ? "png" : "jpg";
        const filename = `evidence/reports/${user.uid}_${Date.now()}.${ext}`;
        evidence_url = await uploadBase64Image(evidenceBase64, evidenceMime, filename);
      } catch {
        // Upload failed — report will submit without the photo
        evidence_url = undefined;
      }
    }

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
        ...(evidence_url ? { evidence_url } : {}),
      });

      // Notify admins — non-blocking, silent fail
      notifyAdminsOfReport(selectedTariff.origin, selectedTariff.destination, bodyNumber.trim());

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Report Submitted ✓",
        evidence_url
          ? "Your overcharging report and evidence photo have been filed. Our team will review it shortly."
          : evidenceBase64 && Platform.OS !== "web"
          ? "Report filed. The evidence photo could not be uploaded — you can share it separately if needed."
          : "Your overcharging report has been filed. Our team will review it shortly.",
        [
          {
            text: "OK",
            onPress: () => {
              setSelectedTariff(null);
              setBodyNumber("");
              setExtortedFare("");
              setDescription("");
              setEvidenceUri(null);
              setEvidenceBase64(null);
            },
          },
        ]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to submit report. Please try again.";
      Alert.alert("Submission Failed", msg);
    } finally {
      setSubmitting(false);
    }
  }

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
      padding: 20,
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
    },
    guestText: {
      color: colors.pink,
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
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
    textarea: { height: 90, textAlignVertical: "top" },
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
    evidenceActions: {
      flexDirection: "row",
      gap: 10,
    },
    evidenceBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
    },
    evidenceBtnText: {
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
      fontSize: 13,
    },
    evidencePreview: { position: "relative" },
    evidenceImage: {
      width: "100%",
      height: 180,
      borderRadius: colors.radius,
    },
    evidenceLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.pinkMuted,
    },
    evidenceLabelText: {
      color: colors.pink,
      fontFamily: "Inter_500Medium",
      fontSize: 12,
    },
    evidenceRemoveBtn: {
      position: "absolute",
      top: 8, right: 8,
      backgroundColor: "rgba(0,0,0,0.7)",
      borderRadius: 20,
      width: 32, height: 32,
      alignItems: "center", justifyContent: "center",
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
      maxHeight: "70%",
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
  });

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
            <Feather name="lock" size={32} color={colors.pink} />
            <Text style={[s.guestText, { fontFamily: "Inter_600SemiBold", fontSize: 16 }]}>
              Sign In Required
            </Text>
            <Text style={s.guestText}>
              Create an account to file reports and track your complaint history.
            </Text>
            <Button label="Sign In" onPress={() => router.push("/auth")} fullWidth />
          </View>
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
        <TouchableOpacity style={s.selectBtn} onPress={() => setShowTariffPicker(true)} activeOpacity={0.75}>
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
        {selectedTariff && extortedFare && !isNaN(parseFloat(extortedFare)) && (
          <View style={s.fareHint}>
            <Feather
              name={parseFloat(extortedFare) > selectedTariff.fares.regular ? "alert-circle" : "check-circle"}
              size={12}
              color={parseFloat(extortedFare) > selectedTariff.fares.regular ? colors.destructive : colors.success}
            />
            <Text style={[s.fareHintText, {
              color: parseFloat(extortedFare) > selectedTariff.fares.regular
                ? colors.destructive
                : colors.success,
            }]}>
              {parseFloat(extortedFare) > selectedTariff.fares.regular
                ? `₱${(parseFloat(extortedFare) - selectedTariff.fares.regular).toFixed(2)} above official fare`
                : "Amount is within the official fare"}
            </Text>
          </View>
        )}

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

        <Text style={s.label}>
          Evidence Photo{" "}
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>(optional)</Text>
        </Text>
        {evidenceUri ? (
          <View style={s.evidencePreview}>
            <Image source={{ uri: evidenceUri }} style={s.evidenceImage} resizeMode="cover" />
            <View style={s.evidenceLabel}>
              <Feather name="check-circle" size={12} color={colors.pink} />
              <Text style={s.evidenceLabelText}>Evidence photo attached</Text>
            </View>
            <TouchableOpacity style={s.evidenceRemoveBtn} onPress={removeEvidence}>
              <Feather name="x" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.evidenceActions}>
            {Platform.OS !== "web" && (
              <TouchableOpacity style={s.evidenceBtn} onPress={pickFromCamera} activeOpacity={0.75}>
                <Feather name="camera" size={18} color={colors.pink} />
                <Text style={s.evidenceBtnText}>Take Photo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.evidenceBtn} onPress={pickFromGallery} activeOpacity={0.75}>
              <Feather name="image" size={18} color={colors.mutedForeground} />
              <Text style={s.evidenceBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 6 }}>
          Attach a clear photo of the tricycle body number as evidence.
        </Text>

        <Button
          label={submitting ? "Submitting..." : "Submit Report"}
          onPress={handleSubmit}
          loading={submitting}
          fullWidth
          style={{ marginTop: 24 }}
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
            <ScrollView showsVerticalScrollIndicator={false}>
              {tariffs.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={s.pickerItem}
                  onPress={() => {
                    setSelectedTariff(t);
                    setShowTariffPicker(false);
                    Haptics.selectionAsync();
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={s.pickerItemText}>{t.origin} → {t.destination}</Text>
                  <Text style={s.pickerItemFare}>
                    ₱{t.fares.regular} regular · {t.distance_km} km
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
