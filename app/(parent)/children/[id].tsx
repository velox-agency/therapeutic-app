import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Card, ProgressBar } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useChild } from "@/hooks/useChildren";
import { getNextMilestone } from "@/lib/gamification";
import { supabase } from "@/lib/supabase";
import { DailyLog, Goal } from "@/types/database.types";

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { child, loading } = useChild(id);
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [recentActivity, setRecentActivity] = useState<
    (DailyLog & { goal?: { title: string } })[]
  >([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchChildData = useCallback(async () => {
    if (!id) return;

    setDataLoading(true);

    // Fetch recent activity (daily logs)
    const { data: activityData } = await supabase
      .from("daily_logs")
      .select(
        `
        *,
        goal:goals(title)
      `,
      )
      .eq("child_id", id)
      .order("log_date", { ascending: false })
      .limit(5);

    setRecentActivity(activityData || []);

    // Fetch active goals for this child
    const { data: goalsData } = await supabase
      .from("goals")
      .select("*")
      .eq("child_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5);

    setActiveGoals(goalsData || []);
    setDataLoading(false);
  }, [id]);

  useEffect(() => {
    fetchChildData();
  }, [fetchChildData]);

  if (loading || !child) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>{t("common.loading")}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const nextMilestone = getNextMilestone(child.total_stars);
  const age = Math.floor(
    (new Date().getTime() - new Date(child.birth_date).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000),
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("navigation.profile")}
          </Text>
          <View style={styles.headerButton} />
        </View>

        {/* Child Profile */}
        <Card variant="elevated" style={styles.profileCard}>
          <Avatar
            name={child.first_name}
            seed={child.avatar_seed || child.id}
            size="xxl"
          />
          <Text style={[styles.childName, { color: colors.text }]}>
            {child.first_name}
          </Text>
          <Text style={[styles.childAge, { color: colors.textSecondary }]}>
            {age} {t("children.yearsOld")}
          </Text>

          {/* Stars Progress */}
          <View
            style={[styles.starsSection, { borderTopColor: colors.border }]}
          >
            <View style={styles.starsHeader}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={[styles.starsCount, { color: Colors.star }]}>
                {child.total_stars} {t("children.stars")}
              </Text>
            </View>
            {nextMilestone && (
              <View style={styles.milestoneProgress}>
                <ProgressBar
                  progress={nextMilestone.progress}
                  variant="success"
                  showLabel
                  label={`${t("children.next")}: ${nextMilestone.title}`}
                  showPercentage
                />
                <Text
                  style={[
                    styles.milestoneHint,
                    { color: colors.textSecondary },
                  ]}
                >
                  {nextMilestone.remaining} {t("children.moreStarsToGo")}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("children.actions")}
          </Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/(parent)/screening/start?childId=${id}`)
              }
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: Colors.secondary[50] },
                ]}
              >
                <Ionicons
                  name="clipboard"
                  size={24}
                  color={Colors.secondary[500]}
                />
              </View>
              <Text
                style={[styles.actionText, { color: colors.textSecondary }]}
              >
                {t("children.startScreening")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/(parent)/children/gamification?id=${id}`)
              }
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: Colors.success[50] },
                ]}
              >
                <Ionicons
                  name="trending-up"
                  size={24}
                  color={Colors.success[500]}
                />
              </View>
              <Text
                style={[styles.actionText, { color: colors.textSecondary }]}
              >
                {t("children.viewProgress")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/(parent)/children/gamification?id=${id}`)
              }
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: Colors.primary[50] },
                ]}
              >
                <Ionicons name="trophy" size={24} color={Colors.primary[500]} />
              </View>
              <Text
                style={[styles.actionText, { color: colors.textSecondary }]}
              >
                {t("children.badges")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("children.recentActivity")}
          </Text>
          {dataLoading ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : recentActivity.length > 0 ? (
            <View style={styles.activityList}>
              {recentActivity.map((activity) => (
                <Card
                  key={activity.id}
                  variant="outlined"
                  style={styles.activityCard}
                >
                  <View style={styles.activityRow}>
                    <View
                      style={[
                        styles.activityIcon,
                        { backgroundColor: Colors.star + "20" },
                      ]}
                    >
                      <Text style={{ fontSize: 16 }}>⭐</Text>
                    </View>
                    <View style={styles.activityContent}>
                      <Text
                        style={[styles.activityTitle, { color: colors.text }]}
                      >
                        {activity.goal?.title || t("children.goalCompleted")}
                      </Text>
                      <Text
                        style={[
                          styles.activityDate,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {new Date(activity.log_date).toLocaleDateString()} • +
                        {activity.stars_earned || 1} ⭐
                      </Text>
                      {activity.notes && (
                        <Text
                          style={[
                            styles.activityNotes,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {activity.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card variant="outlined" style={styles.emptyActivity}>
              <Ionicons
                name="time-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                {t("children.noRecentActivity")}
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                {t("children.completeGoalsToSee")}
              </Text>
            </Card>
          )}
        </View>

        {/* Active Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("children.activeGoals")}
            </Text>
          </View>
          {dataLoading ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : activeGoals.length > 0 ? (
            <View style={styles.goalsList}>
              {activeGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => router.push(`/shared/goals/${goal.id}`)}
                >
                  <Card variant="outlined" style={styles.goalCard}>
                    <View style={styles.goalRow}>
                      <View
                        style={[
                          styles.goalIcon,
                          { backgroundColor: Colors.primary[50] },
                        ]}
                      >
                        <Ionicons
                          name="flag"
                          size={20}
                          color={Colors.primary[500]}
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
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Card variant="outlined" style={styles.emptyActivity}>
              <Ionicons
                name="flag-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                {t("children.noActiveGoals")}
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                {t("children.connectWithTherapist")}
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.tabBarClearance,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: "center",
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  childName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  childAge: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  starsSection: {
    width: "100%",
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  starsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  starEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  starsCount: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.star,
  },
  milestoneProgress: {
    paddingHorizontal: Spacing.md,
  },
  milestoneHint: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.primary[500],
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  emptyActivity: {
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
  loadingSection: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  activityList: {
    gap: Spacing.sm,
  },
  activityCard: {
    padding: Spacing.md,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  activityDate: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  activityNotes: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.tertiary,
    marginTop: 2,
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
  goalIcon: {
    width: 40,
    height: 40,
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
});
