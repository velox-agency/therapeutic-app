import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { Card, ProgressBar } from "@/components/ui";
import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { DailyLog, Goal } from "@/types/database.types";

interface GoalCardProps {
  goal: Goal;
  progress?: number;
  onPress?: () => void;
  onCheckIn?: () => void;
}

export function GoalCard({
  goal,
  progress = 0,
  onPress,
  onCheckIn,
}: GoalCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const priorityColors = {
    low: colors.success,
    medium: colors.secondary,
    high: colors.error,
  };

  const categoryIcons: Record<string, string> = {
    communication: "chatbubbles",
    social: "people",
    motor: "hand-left",
    cognitive: "bulb",
    self_care: "heart",
    behavior: "happy",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View entering={FadeIn.duration(300)} style={animatedStyle}>
        <Card variant="elevated" style={styles.container}>
          <View style={styles.header}>
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons
                name={(categoryIcons[goal.category] || "flag") as any}
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.headerContent}>
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={2}
              >
                {goal.title}
              </Text>
              <View style={styles.meta}>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: priorityColors[goal.priority] + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      { color: priorityColors[goal.priority] },
                    ]}
                  >
                    {goal.priority}
                  </Text>
                </View>
                <Text
                  style={[styles.frequency, { color: colors.textSecondary }]}
                >
                  {goal.target_frequency}x / {goal.frequency_period}
                </Text>
              </View>
            </View>
          </View>

          {goal.description && (
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {goal.description}
            </Text>
          )}

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text
                style={[styles.progressLabel, { color: colors.textSecondary }]}
              >
                Progress
              </Text>
              <Text style={[styles.progressValue, { color: colors.primary }]}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <ProgressBar progress={progress} color={colors.primary} />
          </View>

          {onCheckIn && (
            <TouchableOpacity
              style={[
                styles.checkInButton,
                { backgroundColor: colors.successLight },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onCheckIn();
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
              <Text style={[styles.checkInText, { color: colors.success }]}>
                Log Progress
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      </Animated.View>
    </TouchableOpacity>
  );
}

interface DailyCheckInCardProps {
  goal: Goal;
  todayLog?: DailyLog;
  onCheckIn: (completed: boolean, notes?: string) => void;
}

export function DailyCheckInCard({
  goal,
  todayLog,
  onCheckIn,
}: DailyCheckInCardProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onCheckIn(true);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCheckIn(false, "Skipped");
  };

  return (
    <Card variant="outlined" style={styles.checkInCard}>
      <View style={styles.checkInHeader}>
        <View style={styles.checkInInfo}>
          <Text style={[styles.checkInTitle, { color: colors.text }]}>
            {goal.title}
          </Text>
          <Text style={[styles.checkInTarget, { color: colors.textSecondary }]}>
            Target: {goal.target_frequency}x / {goal.frequency_period}
          </Text>
        </View>
        {todayLog ? (
          <View
            style={[styles.completedBadge, { backgroundColor: colors.success }]}
          >
            <Ionicons name="checkmark" size={16} color={colors.surface} />
          </View>
        ) : (
          <View
            style={[
              styles.pendingBadge,
              { backgroundColor: colors.warningLight },
            ]}
          >
            <Ionicons name="time" size={16} color={colors.secondary} />
          </View>
        )}
      </View>

      {!todayLog && (
        <View style={styles.checkInActions}>
          <TouchableOpacity
            style={[styles.skipButton, { borderColor: colors.border }]}
            onPress={handleSkip}
          >
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
              Skip
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: colors.success }]}
            onPress={handleComplete}
          >
            <Ionicons name="checkmark" size={20} color={colors.surface} />
            <Text style={[styles.completeText, { color: colors.surface }]}>
              Done!
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {todayLog && (
        <View style={styles.loggedInfo}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[styles.loggedText, { color: colors.success }]}>
            Logged at {new Date(todayLog.logged_at).toLocaleTimeString()}
          </Text>
        </View>
      )}
    </Card>
  );
}

interface GoalListProps {
  goals: Goal[];
  onGoalPress?: (goal: Goal) => void;
  onCheckIn?: (goal: Goal) => void;
  emptyMessage?: string;
}

export function GoalList({
  goals,
  onGoalPress,
  onCheckIn,
  emptyMessage,
}: GoalListProps) {
  const { colors } = useTheme();

  if (goals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="flag-outline" size={48} color={colors.textTertiary} />
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          {emptyMessage || "No goals yet"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {goals.map((goal, index) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onPress={() => onGoalPress?.(goal)}
          onCheckIn={onCheckIn ? () => onCheckIn(goal) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    borderRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priorityText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "capitalize",
  },
  frequency: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.tiny,
  },
  description: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.small,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  progressSection: {
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.small,
  },
  progressValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
  },
  checkInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: 16,
  },
  checkInText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
  },
  checkInCard: {
    marginBottom: Spacing.md,
    borderRadius: 20,
  },
  checkInHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkInInfo: {
    flex: 1,
  },
  checkInTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: -0.2,
  },
  checkInTarget: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.small,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingBadge: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkInActions: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  skipButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
  },
  skipText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    fontWeight: "500",
  },
  completeButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: 16,
  },
  completeText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
  },
  loggedInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  loggedText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.tiny,
    marginLeft: Spacing.sm,
  },
  listContainer: {
    gap: Spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.body,
    marginTop: Spacing.lg,
  },
});
