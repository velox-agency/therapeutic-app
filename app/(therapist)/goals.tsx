import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Card } from "@/components/ui";
import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Goal } from "@/types/database.types";

interface PatientWithGoals {
  childId: string;
  childName: string;
  childAvatarSeed: string | null;
  parentName: string;
  goals: (Goal & { currentPeriodLogs?: number })[];
}

const CATEGORY_ICONS: Record<string, string> = {
  communication: "chatbubbles",
  social: "people",
  motor: "hand-left",
  cognitive: "bulb",
  self_care: "heart",
  behavior: "happy",
};

const CATEGORY_COLORS: Record<string, string> = {
  communication: Colors.primary[500],
  social: Colors.secondary[500],
  motor: Colors.success[500],
  cognitive: Colors.warning[500],
  self_care: Colors.error[500],
  behavior: Colors.primary[300],
};

export default function TherapistGoalsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [patientsWithGoals, setPatientsWithGoals] = useState<
    PatientWithGoals[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGoals = useCallback(async () => {
    if (!user) return;

    try {
      // Get all patient enrollments for this therapist
      const { data: enrollments } = await supabase
        .from("patient_therapist")
        .select("id, child_id")
        .eq("therapist_id", user.id)
        .eq("status", "active");

      if (!enrollments || enrollments.length === 0) {
        setPatientsWithGoals([]);
        return;
      }

      const childIds = enrollments.map((e) => e.child_id);

      // Fetch children data
      const { data: children } = await supabase
        .from("children")
        .select("id, first_name, avatar_seed, parent_id")
        .in("id", childIds);

      if (!children) {
        setPatientsWithGoals([]);
        return;
      }

      // Get parent info
      const parentIds = [...new Set(children.map((c) => c.parent_id))];
      const { data: parents } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", parentIds);

      // Get all goals for these children
      const { data: goals } = await supabase
        .from("goals")
        .select("*")
        .in("child_id", childIds)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      // Get daily logs for progress calculation
      const goalIds = goals?.map((g) => g.id) || [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logsData } = await supabase
        .from("daily_logs")
        .select("goal_id, log_date")
        .in("goal_id", goalIds)
        .gte("log_date", thirtyDaysAgo.toISOString().split("T")[0]);

      // Group goals by patient
      const grouped: PatientWithGoals[] = children
        .map((child) => {
          const parent = parents?.find((p) => p.id === child.parent_id);
          const childGoals = (goals || [])
            .filter((g) => g.child_id === child.id)
            .map((goal) => {
              // Calculate current period logs
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

              const periodLogs =
                logsData?.filter(
                  (log) =>
                    log.goal_id === goal.id &&
                    new Date(log.log_date) >= periodStart,
                ).length || 0;

              return {
                ...goal,
                currentPeriodLogs: periodLogs,
              };
            });

          return {
            childId: child.id,
            childName: child.first_name,
            childAvatarSeed: child.avatar_seed,
            parentName: parent?.full_name || "Unknown",
            goals: childGoals,
          };
        })
        .filter((p) => p.goals.length > 0); // Only show patients with goals

      setPatientsWithGoals(grouped);
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  };

  const totalGoals = patientsWithGoals.reduce(
    (sum, p) => sum + p.goals.length,
    0,
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.secondary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("navigation.goals")}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Stats */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.statsContainer}
      >
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="flag" size={24} color={colors.secondary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {totalGoals}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t("goals.activeGoals")}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="people" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {patientsWithGoals.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t("therapist.patients") || "Patients"}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.secondary}
          />
        }
      >
        {patientsWithGoals.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons
                name="flag-outline"
                size={64}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t("goals.noActiveGoals")}
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                {t("goals.createGoalsToTrack") ||
                  "Create goals for your patients to track progress"}
              </Text>
            </Card>
          </Animated.View>
        ) : (
          patientsWithGoals.map((patient, patientIndex) => (
            <Animated.View
              key={patient.childId}
              entering={FadeInDown.delay(200 + patientIndex * 100).duration(
                400,
              )}
              style={styles.patientSection}
            >
              {/* Patient Header */}
              <TouchableOpacity
                style={styles.patientHeader}
                onPress={() =>
                  router.push(`/(therapist)/patients/${patient.childId}`)
                }
              >
                <Avatar
                  name={patient.childName}
                  seed={patient.childAvatarSeed || patient.childId}
                  size="md"
                />
                <View style={styles.patientInfo}>
                  <Text style={[styles.patientName, { color: colors.text }]}>
                    {patient.childName}
                  </Text>
                  <Text
                    style={[styles.parentName, { color: colors.textSecondary }]}
                  >
                    Parent: {patient.parentName}
                  </Text>
                </View>
                <View
                  style={[
                    styles.goalsBadge,
                    { backgroundColor: colors.secondaryLight },
                  ]}
                >
                  <Text
                    style={[styles.goalsBadgeText, { color: colors.secondary }]}
                  >
                    {patient.goals.length}{" "}
                    {patient.goals.length === 1 ? "goal" : "goals"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Goals List */}
              <View style={styles.goalsList}>
                {patient.goals.map((goal, goalIndex) => {
                  const progress =
                    goal.target_frequency > 0
                      ? Math.min(
                          (goal.currentPeriodLogs || 0) / goal.target_frequency,
                          1,
                        )
                      : 0;
                  const categoryIcon = CATEGORY_ICONS[goal.category] || "flag";
                  const categoryColor =
                    CATEGORY_COLORS[goal.category] || colors.secondary;

                  return (
                    <TouchableOpacity
                      key={goal.id}
                      onPress={() => router.push(`/shared/goals/${goal.id}`)}
                    >
                      <Card variant="outlined" style={styles.goalCard}>
                        <View style={styles.goalRow}>
                          <View
                            style={[
                              styles.categoryIcon,
                              { backgroundColor: categoryColor + "20" },
                            ]}
                          >
                            <Ionicons
                              name={categoryIcon as any}
                              size={20}
                              color={categoryColor}
                            />
                          </View>
                          <View style={styles.goalContent}>
                            <Text
                              style={[styles.goalTitle, { color: colors.text }]}
                              numberOfLines={1}
                            >
                              {goal.title}
                            </Text>
                            <Text
                              style={[
                                styles.goalMeta,
                                { color: colors.textSecondary },
                              ]}
                            >
                              {goal.target_frequency}x {goal.frequency_period} •{" "}
                              {goal.category}
                            </Text>
                            <View style={styles.progressContainer}>
                              <View
                                style={[
                                  styles.progressBar,
                                  { backgroundColor: colors.surface },
                                ]}
                              >
                                <View
                                  style={[
                                    styles.progressFill,
                                    {
                                      width: `${progress * 100}%`,
                                      backgroundColor:
                                        progress >= 1
                                          ? Colors.success[500]
                                          : categoryColor,
                                    },
                                  ]}
                                />
                              </View>
                              <Text
                                style={[
                                  styles.progressText,
                                  { color: colors.textSecondary },
                                ]}
                              >
                                {goal.currentPeriodLogs || 0}/
                                {goal.target_frequency}
                              </Text>
                            </View>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={colors.textSecondary}
                          />
                        </View>
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...ComponentStyle.shadow.small,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: ComponentStyle.borderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    ...ComponentStyle.shadow.small,
  },
  statValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  patientSection: {
    marginBottom: Spacing.lg,
  },
  patientHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  patientInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  patientName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  parentName: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  goalsBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  goalsBadgeText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.semibold,
  },
  goalsList: {
    gap: Spacing.sm,
  },
  goalCard: {
    padding: Spacing.md,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  goalMeta: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
    minWidth: 30,
  },
});
