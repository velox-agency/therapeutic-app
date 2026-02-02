import { Ionicons } from "@expo/vector-icons";
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
import { useAuth } from "@/hooks/useAuth";
import { useTherapistGoals } from "@/hooks/useGoals";

export default function TherapistDashboard() {
  const { profile } = useAuth();
  const { goals: therapistGoals, refetch: refetchGoals } = useTherapistGoals();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchGoals();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.secondary[500]}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>
              Dr. {profile?.full_name?.split(" ")[0] || "Therapist"} 👋
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(therapist)/profile")}>
            <Avatar
              name={profile?.full_name}
              source={profile?.avatar_url}
              size="md"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Today's Overview */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Card variant="elevated" style={styles.overviewCard}>
            <Text style={styles.cardTitle}>Today's Schedule</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Patients</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Goals Due</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: Colors.secondary[50] },
                ]}
              >
                <Ionicons
                  name="person-add"
                  size={28}
                  color={Colors.secondary[500]}
                />
              </View>
              <Text style={styles.actionText}>Add Patient</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: Colors.primary[50] },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={28}
                  color={Colors.primary[500]}
                />
              </View>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: Colors.success[50] },
                ]}
              >
                <Ionicons name="flag" size={28} color={Colors.success[500]} />
              </View>
              <Text style={styles.actionText}>Set Goal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: Colors.error[50] },
                ]}
              >
                <Ionicons
                  name="document-text"
                  size={28}
                  color={Colors.error[500]}
                />
              </View>
              <Text style={styles.actionText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Active Patients */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Patients</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons
              name="people-outline"
              size={48}
              color={Colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No patients yet</Text>
            <Text style={styles.emptySubtitle}>
              Add patients to start managing their therapy goals
            </Text>
          </Card>
        </Animated.View>

        {/* Goal Tracker Preview */}
        <Animated.View
          entering={FadeInDown.delay(450).duration(500)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            {therapistGoals.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/shared/goals" as any)}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {therapistGoals.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons
                name="flag-outline"
                size={48}
                color={Colors.text.tertiary}
              />
              <Text style={styles.emptyTitle}>No active goals</Text>
              <Text style={styles.emptySubtitle}>
                Create goals for your patients to track progress
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
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={Colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No upcoming sessions</Text>
            <Text style={styles.emptySubtitle}>
              Schedule sessions with your patients
            </Text>
          </Card>
        </Animated.View>

        {/* Pending Reviews */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.section}
        >
          <Card variant="filled" style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Ionicons
                name="clipboard"
                size={24}
                color={Colors.primary[500]}
              />
              <Text style={styles.reviewTitle}>Screening Reviews</Text>
            </View>
            <Text style={styles.reviewText}>
              0 screenings pending your review
            </Text>
          </Card>
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
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  greeting: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
  name: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  overviewCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
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
    color: Colors.secondary[500],
  },
  statLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
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
    color: Colors.secondary[500],
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionCard: {
    width: "47%",
    backgroundColor: Colors.surface,
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
    color: Colors.text.primary,
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
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  reviewCard: {
    backgroundColor: Colors.primary[50],
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  reviewTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[700],
    marginLeft: Spacing.sm,
  },
  reviewText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
});
