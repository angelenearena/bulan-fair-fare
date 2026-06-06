import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useColors } from "../hooks/useColors";

interface SkeletonLineProps {
  width?: string | number;
  height?: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonLine({ width = "100%", height = 14, borderRadius = 6, style }: SkeletonLineProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: colors.muted, opacity },
        style,
      ]}
    />
  );
}

export function TariffCardSkeleton() {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
      <SkeletonLine width="70%" height={15} style={{ marginBottom: 8 }} />
      <SkeletonLine width="50%" height={13} style={{ marginBottom: 14 }} />
      <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 12 }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ alignItems: "center", gap: 4 }}>
            <SkeletonLine width={40} height={10} />
            <SkeletonLine width={32} height={16} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function ReportItemSkeleton() {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <SkeletonLine width="60%" height={14} />
        <SkeletonLine width={70} height={22} borderRadius={20} />
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        {[0, 1, 2].map((i) => (
          <SkeletonLine key={i} width={80} height={44} borderRadius={8} />
        ))}
      </View>
      <SkeletonLine width="90%" height={13} style={{ marginBottom: 6 }} />
      <SkeletonLine width="70%" height={13} />
    </View>
  );
}
