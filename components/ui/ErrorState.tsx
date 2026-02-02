import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: string;
}

export function ErrorState({
  title = "Oops!",
  message = "Something went wrong",
  onRetry,
  icon = "⚠️",
}: ErrorStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  message: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: ComponentStyle.borderRadius.lg,
    ...ComponentStyle.shadow.small,
  },
  retryText: {
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
  },
});
