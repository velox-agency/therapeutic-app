import React from "react";
import { Text, TextProps } from "react-native";

import { Typography } from "@/constants/theme";
import { useColors } from "@/contexts";

type TextVariant =
  | "hero"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "small"
  | "tiny"
  | "micro";

type TextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "disabled"
  | "inverse"
  | "accent"
  | "success"
  | "error"
  | "warning";

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
  bold?: boolean;
  center?: boolean;
  children: React.ReactNode;
}

export function ThemedText({
  variant = "body",
  color = "primary",
  bold = false,
  center = false,
  style,
  children,
  ...props
}: ThemedTextProps) {
  const colors = useColors();

  const getColor = () => {
    switch (color) {
      case "primary":
        return colors.text;
      case "secondary":
        return colors.textSecondary;
      case "tertiary":
        return colors.textTertiary;
      case "disabled":
        return colors.textDisabled;
      case "inverse":
        return colors.textInverse;
      case "accent":
        return colors.primary;
      case "success":
        return colors.success;
      case "error":
        return colors.error;
      case "warning":
        return colors.warning;
      default:
        return colors.text;
    }
  };

  const getFontSize = () => {
    return Typography.fontSize[variant];
  };

  const getLineHeight = () => {
    return Typography.lineHeight[variant];
  };

  const getFontFamily = () => {
    if (bold || ["hero", "h1", "h2", "h3", "h4"].includes(variant)) {
      return Typography.fontFamily.primaryBold;
    }
    return Typography.fontFamily.primary;
  };

  return (
    <Text
      style={[
        {
          color: getColor(),
          fontSize: getFontSize(),
          lineHeight: getLineHeight(),
          fontFamily: getFontFamily(),
          fontWeight: bold
            ? Typography.fontWeight.bold
            : Typography.fontWeight.regular,
          textAlign: center ? "center" : "left",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
