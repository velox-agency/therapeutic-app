import React from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Colors, Spacing, Typography } from "@/constants/theme";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: "small" | "large";
}

export function LoadingSpinner({
  message,
  fullScreen = true,
  size = "large",
}: LoadingSpinnerProps) {
  const containerStyle = fullScreen ? styles.fullScreen : styles.inline;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={containerStyle}>
      <ActivityIndicator size={size} color={Colors.primary[500]} />
      {message && <Text style={styles.message}>{message}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  inline: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  message: {
    marginTop: Spacing.md,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
