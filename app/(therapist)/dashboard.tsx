import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useTherapistGoals } from "@/hooks/useGoals";
import { supabase } from "@/lib/supabase";

interface Patient {
  id: string;
  childId: string;
  childName: string;
  childAvatarSeed: string | null;
  parentName: string;
  status: string;
}

interface Session {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  session_type: string;
  childName?: string;
}

export default function TherapistDashboard() {
  const { user, profile } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { goals: therapistGoals, refetch: refetchGoals } = useTherapistGoals();
  const [refreshing, setRefreshing] = React.useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [todayStats, setTodayStats] = useState({
    sessions: 0,
    patients: 0,
    goalsDue: 0,
  });

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      // Get today's date range
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ).toISOString();
      const todayEnd = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      ).toISOString();

      // Get patient enrollments
      const { data: enrollments } = await supabase
        .from("patient_therapist")
        .select("id, child_id, status")
        .eq("therapist_id", user.id)
        .eq("status", "active");

      if (enrollments && enrollments.length > 0) {
        const childIds = enrollments.map((e) => e.child_id);

        // Get children data
        const { data: children } = await supabase
          .from("children")
          .select("id, first_name, avatar_seed, parent_id")
          .in("id", childIds);

        // Get parents
        const parentIds = [...new Set(children?.map((c) => c.parent_id) || [])];
        const { data: parents } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", parentIds);

        // Format patients
        const formattedPatients: Patient[] = enrollments.map((e) => {
          const child = children?.find((c) => c.id === e.child_id);
          const parent = parents?.find((p) => p.id === child?.parent_id);
          return {
            id: e.id,
            childId: e.child_id,
            childName: child?.first_name || "Unknown",
            childAvatarSeed: child?.avatar_seed || null,
            parentName: parent?.full_name || "Unknown",
            status: e.status,
          };
        });
        setPatients(formattedPatients);

        // Get today's sessions
        const { data: todaySessions } = await supabase
          .from("sessions")
          .select("*, patient_therapist!inner(child_id)")
          .eq("patient_therapist.therapist_id", user.id)
          .gte("scheduled_at", todayStart)
          .lt("scheduled_at", todayEnd)
          .order("scheduled_at", { ascending: true });

        // Get upcoming sessions (next 7 days)
        const weekFromNow = new Date(
          today.getTime() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString();
        const { data: upcomingSessions } = await supabase
          .from("sessions")
          .select("*, patient_therapist!inner(child_id)")
          .eq("patient_therapist.therapist_id", user.id)
          .gte("scheduled_at", todayStart)
          .lt("scheduled_at", weekFromNow)
          .eq("status", "scheduled")
          .order("scheduled_at", { ascending: true })
          .limit(5);

        // Map sessions with child names
        const sessionsWithNames = (upcomingSessions || []).map((s) => {
          const child = children?.find(
            (c) => c.id === (s.patient_therapist as any)?.child_id,
          );
          return {
            ...s,
            childName: child?.first_name || "Unknown",
          };
        });
        setSessions(sessionsWithNames);

        // Calculate today's stats
        setTodayStats({
          sessions: todaySessions?.length || 0,
          patients: formattedPatients.length,
          goalsDue: therapistGoals.length,
        });
      } else {
        setPatients([]);
        setSessions([]);
        setTodayStats({
          sessions: 0,
          patients: 0,
          goalsDue: therapistGoals.length,
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }, [user?.id, therapistGoals.length]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchGoals(), loadDashboardData()]);
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
            style={StyleSheet.flatten([
              styles.overviewCard,
              { backgroundColor: colors.surface },
            ])}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {t("therapist.todaySchedule")}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {todayStats.sessions}
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
                  {todayStats.patients}
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
                  {todayStats.goalsDue}
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
              onPress={() => router.push("/(therapist)/goals" as any)}
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

          {patients.length === 0 ? (
            <Card
              variant="outlined"
              style={StyleSheet.flatten([
                styles.emptyCard,
                { borderColor: colors.border },
              ])}
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
          ) : (
            <View style={styles.patientsList}>
              {patients.slice(0, 3).map((patient, index) => (
                <Animated.View
                  key={patient.id}
                  entering={FadeInDown.delay(450 + index * 50).duration(400)}
                >
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        `/(therapist)/patients/${patient.childId}` as any,
                      )
                    }
                  >
                    <Card variant="outlined" style={styles.patientCard}>
                      <View style={styles.patientRow}>
                        <Avatar
                          name={patient.childName}
                          seed={patient.childAvatarSeed || patient.childId}
                          size="md"
                        />
                        <View style={styles.patientInfo}>
                          <Text
                            style={[styles.patientName, { color: colors.text }]}
                          >
                            {patient.childName}
                          </Text>
                          <Text
                            style={[
                              styles.patientParent,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Parent: {patient.parentName}
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
                </Animated.View>
              ))}
            </View>
          )}
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
                onPress={() => router.push("/(therapist)/goals" as any)}
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
              style={StyleSheet.flatten([
                styles.emptyCard,
                { borderColor: colors.border },
              ])}
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

          {sessions.length === 0 ? (
            <Card
              variant="outlined"
              style={StyleSheet.flatten([
                styles.emptyCard,
                { borderColor: colors.border },
              ])}
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
          ) : (
            <View style={styles.sessionsList}>
              {sessions.slice(0, 3).map((session, index) => (
                <Animated.View
                  key={session.id}
                  entering={FadeInDown.delay(550 + index * 50).duration(400)}
                >
                  <Card variant="outlined" style={styles.sessionCard}>
                    <View style={styles.sessionRow}>
                      <View
                        style={[
                          styles.sessionIconContainer,
                          { backgroundColor: colors.primaryLight },
                        ]}
                      >
                        <Ionicons
                          name="calendar"
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.sessionInfo}>
                        <Text
                          style={[styles.sessionTitle, { color: colors.text }]}
                        >
                          {session.childName}
                        </Text>
                        <Text
                          style={[
                            styles.sessionTime,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {new Date(session.scheduled_at).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            },
                          )}{" "}
                          at{" "}
                          {new Date(session.scheduled_at).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.durationBadge,
                          { backgroundColor: colors.secondaryLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.durationText,
                            { color: colors.secondary },
                          ]}
                        >
                          {session.duration_minutes}m
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Pending Reviews */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.section}
        >
          <Card
            variant="filled"
            style={StyleSheet.flatten([
              styles.reviewCard,
              { backgroundColor: colors.primaryLight },
            ])}
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
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
    marginTop: Spacing.md,
  },
  overviewCardContainer: {
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
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: 0.2,
  },
  name: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  overviewCard: {
    marginBottom: Spacing.lg,
    borderRadius: 24,
    padding: Spacing.xl,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.lg,
    textAlign: "center",
    letterSpacing: -0.2,
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
  statValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.caption,
    marginTop: 4,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 44,
    borderRadius: 1,
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
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.2,
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
    ...ComponentStyle.shadow.small,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    borderRadius: 20,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.md,
    letterSpacing: -0.1,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    textAlign: "center",
    marginTop: Spacing.xs,
    letterSpacing: 0.1,
  },
  patientsList: {
    gap: Spacing.md,
  },
  patientCard: {
    padding: Spacing.lg,
    borderRadius: 20,
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: -0.1,
  },
  patientParent: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    marginTop: 4,
    letterSpacing: 0.1,
  },
  sessionsList: {
    gap: Spacing.md,
  },
  sessionCard: {
    padding: Spacing.lg,
    borderRadius: 20,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  sessionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: -0.1,
  },
  sessionTime: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    marginTop: 4,
    letterSpacing: 0.1,
  },
  durationBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
  },
  durationText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.3,
  },
  reviewCard: {},
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  reviewTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
    letterSpacing: -0.1,
  },
  reviewText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    letterSpacing: 0.1,
  },
});
