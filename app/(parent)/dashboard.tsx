import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { GoalProgressCard } from "@/components/goals";
import { Avatar, Button, Card } from "@/components/ui";
import { Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useChildren } from "@/hooks/useChildren";
import { useParentGoals } from "@/hooks/useGoals";

export default function ParentDashboard() {
  const { profile, signOut } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { children, loading, refetch } = useChildren();
  const [refreshing, setRefreshing] = React.useState(false);

  // Get child IDs for goal fetching
  const childIds = useMemo(() => children.map((c) => c.id), [children]);
  const { goals: parentGoals, refetch: refetchGoals } =
    useParentGoals(childIds);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchGoals()]);
    setRefreshing(false);
  };

  const totalStars = children.reduce(
    (sum, child) => sum + (child.total_stars || 0),
    0,
  );

  // Count completed goals
  const goalsMetCount = parentGoals.filter(
    (g) => g.status === "completed",
  ).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={["top"]}>
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            style={styles.header}
          >
            <View>
              <Text style={styles.greeting}>{t("parent.welcome")}</Text>
              <Text style={styles.name}>
                {profile?.full_name || t("common.parent") || "Parent"} 👋
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(parent)/profile")}>
              <Avatar
                name={profile?.full_name}
                source={profile?.avatar_url}
                size="md"
              />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Quick Stats */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.statsCardContainer}
        >
          <Card
            variant="elevated"
            style={
              StyleSheet.flatten([
                styles.statsCard,
                { backgroundColor: colors.surface },
              ]) as ViewStyle
            }
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Ionicons name="people" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {children.length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  {t("navigation.children")}
                </Text>
              </View>

              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: colors.divider },
                ]}
              />

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#FFF9E6" }]}>
                  <Text style={styles.starEmoji}>⭐</Text>
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {totalStars}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  {t("parent.totalStars")}
                </Text>
              </View>

              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: colors.divider },
                ]}
              />

              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: colors.successLight },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.success}
                  />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {goalsMetCount}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  {t("goals.goalsMet") || "Goals Met"}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("common.quickActions") || "Quick Actions"}
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push("/(parent)/children/add")}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Ionicons name="person-add" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                {t("parent.addChild")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push("/(parent)/screening")}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.secondaryLight },
                ]}
              >
                <Ionicons name="clipboard" size={28} color={colors.secondary} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                M-CHAT-R
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push("/(parent)/therapists" as any)}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.successLight },
                ]}
              >
                <Ionicons name="search" size={28} color={colors.success} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                {t("navigation.therapists") || "Therapists"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push("/shared/resources")}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.errorLight },
                ]}
              >
                <Ionicons name="book" size={28} color={colors.error} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                {t("navigation.resources")}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Children List */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("parent.myChildren")}
            </Text>
            {children.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/(parent)/children")}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  {t("common.seeAll")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {children.length === 0 ? (
            <Card
              variant="outlined"
              style={
                StyleSheet.flatten([
                  styles.emptyCard,
                  { borderColor: colors.border },
                ]) as ViewStyle
              }
            >
              <Ionicons
                name="people-outline"
                size={48}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t("parent.noChildren")}
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                {t("parent.addChildPrompt")}
              </Text>
              <Button
                title={t("parent.addFirstChild") || "Add Your First Child"}
                onPress={() => router.push("/(parent)/children/add")}
                variant="primary"
                size="medium"
                style={styles.emptyButton}
              />
            </Card>
          ) : (
            children.slice(0, 3).map((child) => (
              <TouchableOpacity
                key={child.id}
                onPress={() => router.push(`/(parent)/children/${child.id}`)}
              >
                <Card
                  variant="elevated"
                  style={
                    StyleSheet.flatten([
                      styles.childCard,
                      { backgroundColor: colors.surface },
                    ]) as ViewStyle
                  }
                >
                  <View style={styles.childInfo}>
                    <Avatar
                      name={child.first_name}
                      seed={child.avatar_seed || child.id}
                      size="md"
                    />
                    <View style={styles.childDetails}>
                      <Text style={[styles.childName, { color: colors.text }]}>
                        {child.first_name}
                      </Text>
                      <View style={styles.childStars}>
                        <Text style={styles.starEmoji}>⭐</Text>
                        <Text
                          style={[
                            styles.starCount,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {child.total_stars}{" "}
                          {t("gamification.stars").toLowerCase()}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textTertiary}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </Animated.View>

        {/* Goal Tracker Preview */}
        {children.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(500).duration(500)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("goals.activeGoals")}
              </Text>
              {parentGoals.length > 0 && (
                <TouchableOpacity
                  onPress={() => router.push("/shared/goals/list" as any)}
                >
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>
                    {t("common.seeAll")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {parentGoals.length === 0 ? (
              <Card
                variant="outlined"
                style={
                  StyleSheet.flatten([
                    styles.emptyCard,
                    { borderColor: colors.border },
                  ]) as ViewStyle
                }
              >
                <Ionicons
                  name="flag-outline"
                  size={48}
                  color={colors.textTertiary}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t("goals.noActiveGoals")}
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {t("goals.goalsFromTherapist") ||
                    "Goals set by therapists will appear here"}
                </Text>
              </Card>
            ) : (
              parentGoals.slice(0, 3).map((goal, index) => {
                const currentValue = goal.currentPeriodLogs || 0;
                const targetValue = goal.target_frequency || 1;
                const progress = Math.min(
                  (currentValue / targetValue) * 100,
                  100,
                );

                return (
                  <GoalProgressCard
                    key={goal.id}
                    goal={goal}
                    progress={progress}
                    currentValue={currentValue}
                    delay={index * 100}
                    onPress={() =>
                      router.push(`/shared/goals/${goal.id}` as any)
                    }
                  />
                );
              })
            )}
          </Animated.View>
        )}

        {/* Tip of the Day */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.section}
        >
          <Card
            variant="filled"
            style={
              StyleSheet.flatten([
                styles.tipCard,
                { backgroundColor: colors.secondaryLight },
              ]) as ViewStyle
            }
          >
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={24} color={colors.secondary} />
              <Text style={[styles.tipTitle, { color: colors.text }]}>
                {t("common.tipOfDay") || "Tip of the Day"}
              </Text>
            </View>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              {t("tips.consistency") ||
                "Consistency is key! Try to practice speech exercises at the same time each day to help your child build a routine."}
            </Text>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientHeader: {
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.tabBarClearance,
    marginTop: Spacing.md,
  },
  statsCardContainer: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  greeting: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.body,
    color: "rgba(255, 255, 255, 0.9)",
  },
  name: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    color: "#FFFFFF",
  },
  statsCard: {
    marginBottom: Spacing.lg,
    borderRadius: 24,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    gap: Spacing.md,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  statIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.tiny,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 48,
    opacity: 0.5,
  },
  starEmoji: {
    fontSize: 22,
  },
  section: {
    marginBottom: Spacing.xl,
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
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    fontWeight: "500",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionCard: {
    width: "47%",
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: "center",
    ...{
      shadowColor: "#6B7280",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  actionText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    fontWeight: "500",
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    borderRadius: 24,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.body,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
    maxWidth: 280,
  },
  emptyButton: {
    minWidth: 220,
  },
  childCard: {
    marginBottom: Spacing.md,
    borderRadius: 20,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  childDetails: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  childName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  childStars: {
    flexDirection: "row",
    alignItems: "center",
  },
  starCount: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.small,
    marginLeft: Spacing.xs,
  },
  tipCard: {},
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  tipTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
  },
  tipText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.small,
    lineHeight: Typography.lineHeight.small,
  },
});
