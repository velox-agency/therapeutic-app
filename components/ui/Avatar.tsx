import { AvatarSize, Colors, Typography } from "@/constants/theme";
import React from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";

type AvatarSizeType = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSizeType;
  seed?: string; // For generating consistent colors
  style?: ViewStyle;
  showBadge?: boolean;
  badgeColor?: string;
}

// Generate a consistent color based on a seed string
const generateColorFromSeed = (seed: string): string => {
  const colors = [
    Colors.primary[400],
    Colors.secondary[400],
    Colors.success[400],
    Colors.primary[500],
    Colors.secondary[500],
    Colors.primary[300],
    Colors.secondary[300],
    Colors.warning[500],
    "#EC4899", // Pink
    "#8B5CF6", // Violet
    "#06B6D4", // Cyan
    "#F97316", // Orange
  ];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name: string): string => {
  const words = name.trim().split(" ").filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export function Avatar({
  source,
  name = "",
  size = "md",
  seed,
  style,
  showBadge = false,
  badgeColor = Colors.success[500],
}: AvatarProps) {
  const dimension = AvatarSize[size];
  const backgroundColor = generateColorFromSeed(seed || name || "default");
  const initials = getInitials(name);

  const getFontSize = (): number => {
    switch (size) {
      case "xs":
        return Typography.fontSize.micro;
      case "sm":
        return Typography.fontSize.tiny;
      case "md":
        return Typography.fontSize.body;
      case "lg":
        return Typography.fontSize.h3;
      case "xl":
        return Typography.fontSize.h1;
      case "xxl":
        return Typography.fontSize.hero;
      default:
        return Typography.fontSize.body;
    }
  };

  const getBadgeSize = (): number => {
    switch (size) {
      case "xs":
        return 6;
      case "sm":
        return 8;
      case "md":
        return 12;
      case "lg":
        return 16;
      case "xl":
        return 20;
      case "xxl":
        return 24;
      default:
        return 12;
    }
  };

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  const imageStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  const badgeSize = getBadgeSize();

  return (
    <View style={[styles.container, containerStyle, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.placeholder, containerStyle, { backgroundColor }]}>
          <Text style={[styles.initials, { fontSize: getFontSize() }]}>
            {initials}
          </Text>
        </View>
      )}

      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColor,
              borderWidth: badgeSize > 10 ? 2 : 1,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "visible",
  },
  image: {
    overflow: "hidden",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    borderColor: Colors.surface,
  },
});
