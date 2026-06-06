import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "../hooks/useColors";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const colors = useColors();

  function handlePress() {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  }

  const containerStyle: ViewStyle = {
    backgroundColor:
      variant === "primary"
        ? colors.primary
        : variant === "destructive"
        ? colors.destructive
        : variant === "secondary"
        ? colors.secondary
        : "transparent",
    borderWidth: variant === "outline" ? 1 : 0,
    borderColor: variant === "outline" ? colors.primary : "transparent",
    borderRadius: colors.radius,
    paddingVertical: size === "sm" ? 8 : size === "lg" ? 16 : 12,
    paddingHorizontal: size === "sm" ? 12 : size === "lg" ? 28 : 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? ("100%" as any) : undefined,
  };

  const labelStyle: TextStyle = {
    color:
      variant === "primary" || variant === "destructive"
        ? "#ffffff"
        : variant === "outline" || variant === "ghost"
        ? colors.primary
        : colors.foreground,
    fontFamily: "Inter_600SemiBold",
    fontSize: size === "sm" ? 13 : size === "lg" ? 17 : 15,
    letterSpacing: 0.2,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[containerStyle, style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#ffffff" : colors.primary}
        />
      ) : (
        <Text style={[labelStyle, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
