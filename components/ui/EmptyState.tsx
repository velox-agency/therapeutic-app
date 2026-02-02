import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  message,
  icon = "📭",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.actionButton}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: ComponentStyle.borderRadius.lg,
    ...ComponentStyle.shadow.small,
  },
  icon: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  message: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  actionButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: ComponentStyle.borderRadius.md,
    marginTop: Spacing.sm,
  },
  actionText: {
    color: Colors.text.inverse,
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
  },
});
