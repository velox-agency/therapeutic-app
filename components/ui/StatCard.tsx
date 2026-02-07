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

import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";

interface StatCardProps {
  icon: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
  onPress?: () => void;
  delay?: number;
  style?: ViewStyle;
  variant?: "default" | "compact";
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
  variant = "default",
}: StatCardProps) {
  const isCompact = variant === "compact";

  const content = (
    <View style={[styles.card, isCompact && styles.cardCompact, style]}>
      <View
        style={[
          styles.iconContainer,
          isCompact && styles.iconContainerCompact,
          { backgroundColor: color + "15" },
        ]}
      >
        {iconName ? (
          <Ionicons name={iconName} size={isCompact ? 20 : 24} color={color} />
        ) : (
          <Text style={[styles.icon, { color, fontSize: isCompact ? 18 : 22 }]}>
            {icon}
          </Text>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.value, isCompact && styles.valueCompact]}>
          {value}
        </Text>
        <Text style={[styles.label, isCompact && styles.labelCompact]}>
          {label}
        </Text>
      </View>
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
    borderRadius: ComponentStyle.borderRadius.lg,
    minHeight: 130,
    ...ComponentStyle.shadow.small,
  },
  cardCompact: {
    minHeight: 100,
    padding: Spacing.md,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: ComponentStyle.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  iconContainerCompact: {
    width: 40,
    height: 40,
    marginBottom: Spacing.sm,
  },
  icon: {
    fontWeight: "600",
  },
  textContainer: {
    gap: 2,
  },
  value: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  valueCompact: {
    fontSize: Typography.fontSize.h3,
  },
  label: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  labelCompact: {
    fontSize: Typography.fontSize.tiny,
  },
});
