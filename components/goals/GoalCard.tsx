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
import { Colors, Spacing, Typography } from "@/constants/theme";
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
    low: Colors.success[500],
    medium: Colors.secondary[500],
    high: Colors.error[500],
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
                { backgroundColor: Colors.primary[50] },
              ]}
            >
              <Ionicons
                name={(categoryIcons[goal.category] || "flag") as any}
                size={24}
                color={Colors.primary[500]}
              />
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.title} numberOfLines={2}>
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
                <Text style={styles.frequency}>
                  {goal.target_frequency}x / {goal.frequency_period}
                </Text>
              </View>
            </View>
          </View>

          {goal.description && (
            <Text style={styles.description} numberOfLines={2}>
              {goal.description}
            </Text>
          )}

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <ProgressBar progress={progress} color={Colors.primary[500]} />
          </View>

          {onCheckIn && (
            <TouchableOpacity
              style={styles.checkInButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onCheckIn();
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success[500]}
              />
              <Text style={styles.checkInText}>Log Progress</Text>
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
          <Text style={styles.checkInTitle}>{goal.title}</Text>
          <Text style={styles.checkInTarget}>
            Target: {goal.target_frequency}x / {goal.frequency_period}
          </Text>
        </View>
        {todayLog ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={16} color={Colors.surface} />
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Ionicons name="time" size={16} color={Colors.secondary[500]} />
          </View>
        )}
      </View>

      {!todayLog && (
        <View style={styles.checkInActions}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
          >
            <Ionicons name="checkmark" size={20} color={Colors.surface} />
            <Text style={styles.completeText}>Done!</Text>
          </TouchableOpacity>
        </View>
      )}

      {todayLog && (
        <View style={styles.loggedInfo}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={Colors.success[500]}
          />
          <Text style={styles.loggedText}>
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
  if (goals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="flag-outline" size={48} color={Colors.text.tertiary} />
        <Text style={styles.emptyText}>{emptyMessage || "No goals yet"}</Text>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "capitalize",
  },
  frequency: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
  },
  description: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
  },
  progressValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
  },
  checkInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.success[50],
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  checkInText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success[500],
    marginLeft: Spacing.xs,
  },
  checkInCard: {
    marginBottom: Spacing.md,
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
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  checkInTarget: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success[500],
    alignItems: "center",
    justifyContent: "center",
  },
  pendingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.secondary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  checkInActions: {
    flexDirection: "row",
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  skipButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  skipText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  completeButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    backgroundColor: Colors.success[500],
  },
  completeText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.surface,
    marginLeft: Spacing.xs,
  },
  loggedInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  loggedText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.success[500],
    marginLeft: Spacing.xs,
  },
  listContainer: {
    gap: Spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.tertiary,
    marginTop: Spacing.md,
  },
});
