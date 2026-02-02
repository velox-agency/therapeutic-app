import React from "react";
import { View, ViewProps } from "react-native";

import { useColors } from "@/contexts";

type ViewVariant =
  | "background"
  | "surface"
  | "surfaceVariant"
  | "elevated"
  | "transparent";

interface ThemedViewProps extends ViewProps {
  variant?: ViewVariant;
  children?: React.ReactNode;
}

export function ThemedView({
  variant = "background",
  style,
  children,
  ...props
}: ThemedViewProps) {
  const colors = useColors();

  const getBackgroundColor = () => {
    switch (variant) {
      case "background":
        return colors.background;
      case "surface":
        return colors.surface;
      case "surfaceVariant":
        return colors.surfaceVariant;
      case "elevated":
        return colors.surfaceElevated;
      case "transparent":
        return "transparent";
      default:
        return colors.background;
    }
  };

  return (
    <View style={[{ backgroundColor: getBackgroundColor() }, style]} {...props}>
      {children}
    </View>
  );
}
