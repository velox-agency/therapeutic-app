import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { GoalProgressCard } from "@/components/goals";
import { Avatar, Card } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useTherapistGoals } from "@/hooks/useGoals";

export default function TherapistDashboard() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { goals: therapistGoals, refetch: refetchGoals } = useTherapistGoals();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchGoals();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.secondary, Colors.secondary[600]]}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={["top"]}>
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            style={styles.header}
          >
            <View>
              <Text style={styles.greeting}>{t("therapist.welcome")}</Text>
              <Text style={styles.name}>
                Dr.{" "}
                {profile?.full_name?.split(" ")[0] ||
                  t("common.therapist") ||
                  "Therapist"}{" "}
                👋
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(therapist)/profile")}
            >
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
            tintColor={colors.secondary}
          />
        }
      >
        {/* Today's Overview */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.overviewCardContainer}
        >
          <Card
            variant="elevated"
            style={[styles.overviewCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {t("therapist.todaySchedule")}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  0
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  {t("navigation.sessions")}
                </Text>
              </View>
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: colors.divider },
                ]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  0
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  {t("navigation.patients")}
                </Text>
              </View>
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: colors.divider },
                ]}
              />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  0
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  {t("goals.goalsDue") || "Goals Due"}
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
              onPress={() => router.push("/(therapist)/patients" as any)}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.secondaryLight },
                ]}
              >
                <Ionicons name="people" size={28} color={colors.secondary} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                {t("therapist.myPatients") || "My Patients"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push("/(therapist)/sessions" as any)}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={28}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                {t("navigation.sessions")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push("/shared/goals" as any)}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.successLight },
                ]}
              >
                <Ionicons name="flag" size={28} color={colors.success} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                {t("navigation.goals")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push("/shared/resources" as any)}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: colors.errorLight },
                ]}
              >
                <Ionicons name="library" size={28} color={colors.error} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                {t("navigation.resources")}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Active Patients */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("therapist.activePatients")}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(therapist)/patients" as any)}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                {t("common.seeAll")}
              </Text>
            </TouchableOpacity>
          </View>

          <Card
            variant="outlined"
            style={[styles.emptyCard, { borderColor: colors.border }]}
          >
            <Ionicons
              name="people-outline"
              size={48}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t("therapist.noPatients")}
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {t("therapist.parentsEnrollChildren") ||
                "Parents will enroll their children with you"}
            </Text>
          </Card>
        </Animated.View>

        {/* Goal Tracker Preview */}
        <Animated.View
          entering={FadeInDown.delay(450).duration(500)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("goals.activeGoals")}
            </Text>
            {therapistGoals.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/shared/goals" as any)}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  {t("common.seeAll")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {therapistGoals.length === 0 ? (
            <Card
              variant="outlined"
              style={[styles.emptyCard, { borderColor: colors.border }]}
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
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                {t("goals.createGoalsToTrack") ||
                  "Create goals for your patients to track progress"}
              </Text>
            </Card>
          ) : (
            therapistGoals
              .slice(0, 3)
              .map((goal, index) => (
                <GoalProgressCard
                  key={goal.id}
                  goal={goal}
                  progress={0}
                  delay={index * 100}
                  onPress={() => router.push(`/shared/goals/${goal.id}` as any)}
                />
              ))
          )}
        </Animated.View>

        {/* Upcoming Sessions */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("sessions.upcomingSessions")}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(therapist)/sessions" as any)}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                {t("common.seeAll")}
              </Text>
            </TouchableOpacity>
          </View>

          <Card
            variant="outlined"
            style={[styles.emptyCard, { borderColor: colors.border }]}
          >
            <Ionicons
              name="calendar-outline"
              size={48}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t("sessions.noSessions")}
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {t("sessions.scheduleWithPatients") ||
                "Schedule sessions with your patients"}
            </Text>
          </Card>
        </Animated.View>

        {/* Pending Reviews */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.section}
        >
          <Card
            variant="filled"
            style={[
              styles.reviewCard,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <View style={styles.reviewHeader}>
              <Ionicons name="clipboard" size={24} color={colors.primary} />
              <Text style={[styles.reviewTitle, { color: colors.text }]}>
                {t("therapist.screeningReviews") || "Screening Reviews"}
              </Text>
            </View>
            <Text style={[styles.reviewText, { color: colors.textSecondary }]}>
              {t("therapist.pendingReviews", { count: 0 }) ||
                "0 screenings pending your review"}
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
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    marginTop: -Spacing.md,
  },
  overviewCardContainer: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  greeting: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: "rgba(255, 255, 255, 0.85)",
  },
  name: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
  },
  overviewCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
  },
  statDivider: {
    width: 1,
    height: 40,
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
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionCard: {
    width: "47%",
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: "center",
    ...{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
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
    fontSize: Typography.fontSize.small,
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  reviewCard: {},
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  reviewTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
  },
  reviewText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
  },
});
