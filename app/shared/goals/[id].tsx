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
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useDailyLogs, useGoal } from "@/hooks/useGoals";
import { GoalPriority } from "@/types/database.types";

export default function GoalDetailScreen() {
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.error[500]} />
          <Text style={styles.errorText}>Goal not found</Text>
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
    low: Colors.success[500],
    medium: Colors.secondary[500],
    high: Colors.error[500],
  };

  const goalPriority = (goal.priority as GoalPriority) || "medium";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons
              name="create-outline"
              size={24}
              color={Colors.primary[500]}
            />
          </TouchableOpacity>
        </View>

        {/* Goal Info */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Card variant="elevated" style={styles.goalCard}>
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: Colors.primary[50] },
              ]}
            >
              <Ionicons
                name={(categoryIcons[goal.category] || "flag") as any}
                size={32}
                color={Colors.primary[500]}
              />
            </View>

            <Text style={styles.goalTitle}>{goal.title}</Text>

            {goal.description && (
              <Text style={styles.goalDescription}>{goal.description}</Text>
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
                style={[styles.badge, { backgroundColor: Colors.primary[50] }]}
              >
                <Text
                  style={[styles.badgeText, { color: Colors.primary[500] }]}
                >
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
          <Text style={styles.sectionTitle}>Progress</Text>
          <Card variant="outlined">
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                This {goal.frequency_period}
              </Text>
              <Text style={styles.progressValue}>
                {currentPeriodProgress} / {goal.target_frequency}
              </Text>
            </View>
            <ProgressBar
              progress={progressPercentage / 100}
              color={Colors.primary[500]}
            />
          </Card>
        </Animated.View>

        {/* Recent Logs */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {logsLoading ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={styles.emptyText}>Loading...</Text>
            </Card>
          ) : logs.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={Colors.text.tertiary}
              />
              <Text style={styles.emptyText}>No activity logged yet</Text>
              <Text style={styles.emptySubtext}>
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
                        color={Colors.primary[500]}
                      />
                      <Text style={styles.logDate}>
                        {new Date(log.log_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                    {log.stars_earned > 0 && (
                      <View style={styles.starsContainer}>
                        <Text style={styles.starsText}>
                          ⭐ {log.stars_earned}
                        </Text>
                      </View>
                    )}
                  </View>
                  {log.notes && (
                    <Text style={styles.logNotes}>{log.notes}</Text>
                  )}
                  {log.achieved_value !== null &&
                    log.achieved_value !== undefined && (
                      <Text style={styles.logValue}>
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[50],
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
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  goalDescription: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
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
    color: Colors.text.primary,
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
    color: Colors.text.secondary,
  },
  progressValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
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
    color: Colors.text.primary,
  },
  starsContainer: {
    backgroundColor: Colors.secondary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  starsText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary[600],
  },
  logNotes: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  logValue: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.tertiary,
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
    color: Colors.text.secondary,
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
    color: Colors.text.primary,
    marginVertical: Spacing.md,
  },
});
