import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, ProgressBar } from "@/components/ui";
import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useDailyLogs, useGoal } from "@/hooks/useGoals";
import { GoalPriority } from "@/types/database.types";

export default function GoalDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goal, loading } = useGoal(id || "");
  const { logs, loading: logsLoading } = useDailyLogs(id || "");

  // Calculate progress for current period
  const currentPeriodProgress = useMemo(() => {
    if (!goal || !logs.length) return 0;

    const now = new Date();
    let periodStart: Date;

    switch (goal.frequency_period) {
      case "daily":
        periodStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        break;
      case "weekly":
        const dayOfWeek = now.getDay();
        periodStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - dayOfWeek,
        );
        break;
      case "monthly":
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        periodStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
    }

    return logs.filter((log) => new Date(log.log_date) >= periodStart).length;
  }, [goal, logs]);

  const progressPercentage = useMemo(() => {
    if (!goal) return 0;
    return Math.min((currentPeriodProgress / goal.target_frequency) * 100, 100);
  }, [currentPeriodProgress, goal]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Goal not found
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  const categoryIcons: Record<string, string> = {
    communication: "chatbubbles",
    social: "people",
    motor: "hand-left",
    cognitive: "bulb",
    self_care: "heart",
    behavior: "happy",
  };

  const priorityColors: Record<GoalPriority, string> = {
    low: colors.success,
    medium: colors.secondary,
    high: colors.error,
  };

  const goalPriority = (goal.priority as GoalPriority) || "medium";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.editButton,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Goal Info */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Card variant="elevated" style={styles.goalCard}>
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons
                name={(categoryIcons[goal.category] || "flag") as any}
                size={32}
                color={colors.primary}
              />
            </View>

            <Text style={[styles.goalTitle, { color: colors.text }]}>
              {goal.title}
            </Text>

            {goal.description && (
              <Text
                style={[
                  styles.goalDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {goal.description}
              </Text>
            )}

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: priorityColors[goalPriority] + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: priorityColors[goalPriority] },
                  ]}
                >
                  {goalPriority} priority
                </Text>
              </View>
              <View
                style={[styles.badge, { backgroundColor: colors.primaryLight }]}
              >
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {goal.target_frequency}x / {goal.frequency_period}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Progress */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Progress
          </Text>
          <Card variant="outlined">
            <View style={styles.progressHeader}>
              <Text
                style={[styles.progressLabel, { color: colors.textSecondary }]}
              >
                This {goal.frequency_period}
              </Text>
              <Text style={[styles.progressValue, { color: colors.primary }]}>
                {currentPeriodProgress} / {goal.target_frequency}
              </Text>
            </View>
            <ProgressBar
              progress={progressPercentage / 100}
              color={colors.primary}
            />
          </Card>
        </Animated.View>

        {/* Recent Logs */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>
          {logsLoading ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Loading...
              </Text>
            </Card>
          ) : logs.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No activity logged yet
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                Start tracking progress by logging daily activities
              </Text>
            </Card>
          ) : (
            <View style={styles.logsContainer}>
              {logs.slice(0, 10).map((log, index) => (
                <Card key={log.id} variant="outlined" style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <View style={styles.logDateContainer}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={[styles.logDate, { color: colors.text }]}>
                        {new Date(log.log_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                    {log.stars_earned > 0 && (
                      <View
                        style={[
                          styles.starsContainer,
                          { backgroundColor: colors.secondaryLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.starsText,
                            { color: colors.secondary },
                          ]}
                        >
                          ⭐ {log.stars_earned}
                        </Text>
                      </View>
                    )}
                  </View>
                  {log.notes && (
                    <Text
                      style={[styles.logNotes, { color: colors.textSecondary }]}
                    >
                      {log.notes}
                    </Text>
                  )}
                  {log.achieved_value !== null &&
                    log.achieved_value !== undefined && (
                      <Text
                        style={[
                          styles.logValue,
                          { color: colors.textTertiary },
                        ]}
                      >
                        Achieved: {log.achieved_value}
                      </Text>
                    )}
                </Card>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Log Progress Button */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.buttonContainer}
        >
          <Button
            title="Log Today's Progress"
            onPress={() =>
              router.push({
                pathname: "/shared/goals/daily-log",
                params: { childId: goal.child_id, goalId: goal.id },
              })
            }
            variant="primary"
            fullWidth
            icon="checkmark-circle"
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.tabBarClearance,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  goalCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  goalTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  goalDescription: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "capitalize",
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
  },
  progressValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  logsContainer: {
    gap: Spacing.sm,
  },
  logCard: {
    paddingVertical: Spacing.md,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  logDate: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
  },
  starsContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  starsText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
  },
  logNotes: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    marginTop: Spacing.sm,
  },
  logValue: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    marginTop: Spacing.xs,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  errorText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    marginVertical: Spacing.md,
  },
});
