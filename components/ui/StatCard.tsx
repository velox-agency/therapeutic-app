import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Colors, Spacing, Typography } from "@/constants/theme";

interface StatCardProps {
  icon: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
  onPress?: () => void;
  delay?: number;
  style?: ViewStyle;
}

export function StatCard({
  icon,
  iconName,
  label,
  value,
  color = Colors.primary[500],
  onPress,
  delay = 0,
  style,
}: StatCardProps) {
  const content = (
    <View style={[styles.card, style]}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        {iconName ? (
          <Ionicons name={iconName} size={24} color={color} />
        ) : (
          <Text style={[styles.icon, { color }]}>{icon}</Text>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={styles.container}
    >
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 16,
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
});
