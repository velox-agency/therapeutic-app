import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { Goal as DatabaseGoal } from "@/types/database.types";

// Minimal goal interface for flexibility
interface MinimalGoal {
  id: string;
  title: string;
  category?: string | null;
  target_value?: number | null;
  target_frequency?: number;
  unit?: string | null;
}

interface GoalProgressCardProps {
  goal: MinimalGoal | DatabaseGoal;
  progress?: number; // Optional external progress value (0-100)
  currentValue?: number; // Optional current value for display
  delay?: number;
  onPress?: () => void;
}

export function GoalProgressCard({
  goal,
  progress: externalProgress,
  currentValue: externalCurrentValue,
  delay = 0,
  onPress,
}: GoalProgressCardProps) {
  const { colors } = useTheme();
  const targetValue = goal.target_value || goal.target_frequency || 1;
  const currentValue = externalCurrentValue ?? 0;
  const progress = externalProgress ?? (currentValue / targetValue) * 100;
  const isComplete = progress >= 100;

  const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    communication: "chatbubbles",
    social: "people",
    motor: "hand-left",
    cognitive: "bulb",
    self_care: "heart",
    behavior: "happy",
  };

  const content = (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: colors.primaryLight },
          ]}
        >
          <Ionicons
            name={categoryIcons[goal.category || ""] || "flag"}
            size={14}
            color={colors.primary}
          />
          <Text style={[styles.categoryText, { color: colors.primary }]}>
            {goal.category?.replace("_", " ") || "General"}
          </Text>
        </View>
        {isComplete && (
          <View style={styles.completeBadge}>
            <Ionicons name="checkmark" size={12} color={colors.success} />
            <Text style={[styles.completeText, { color: colors.success }]}>
              Complete
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {goal.title}
      </Text>

      <View style={styles.progressContainer}>
        <View
          style={[styles.progressBar, { backgroundColor: colors.primaryLight }]}
        >
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: isComplete ? colors.success : colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {currentValue} / {targetValue} {goal.unit || "times"}
        </Text>
      </View>
    </View>
  );

  return (
    <Animated.View entering={FadeInRight.delay(delay).springify()}>
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
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  categoryText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "capitalize",
  },
  completeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completeText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.bold,
  },
  title: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.sm,
  },
  progressContainer: {
    gap: 6,
  },
  progressBar: {
    height: 8,
    borderRadius: 100,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 100,
  },
  progressText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.small,
  },
});
