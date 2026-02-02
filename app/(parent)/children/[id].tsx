import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Card, ProgressBar } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useChild } from "@/hooks/useChildren";
import { getNextMilestone } from "@/lib/gamification";

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { child, loading } = useChild(id);

  if (loading || !child) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity>
            <Ionicons
              name="settings-outline"
              size={24}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Child Profile */}
        <Card variant="elevated" style={styles.profileCard}>
          <Avatar
            name={child.first_name}
            seed={child.avatar_seed || child.id}
            size="xxl"
          />
          <Text style={styles.childName}>{child.first_name}</Text>
          <Text style={styles.childAge}>{age} years old</Text>

          {/* Stars Progress */}
          <View style={styles.starsSection}>
            <View style={styles.starsHeader}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={styles.starsCount}>{child.total_stars} Stars</Text>
            </View>
            {nextMilestone && (
              <View style={styles.milestoneProgress}>
                <ProgressBar
                  progress={nextMilestone.progress}
                  variant="success"
                  showLabel
                  label={`Next: ${nextMilestone.title}`}
                  showPercentage
                />
                <Text style={styles.milestoneHint}>
                  {nextMilestone.remaining} more stars to go!
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
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
              <Text style={styles.actionText}>Start Screening</Text>
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
              <Text style={styles.actionText}>View Progress</Text>
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
              <Text style={styles.actionText}>Badges</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Card variant="outlined" style={styles.emptyActivity}>
            <Ionicons
              name="time-outline"
              size={48}
              color={Colors.text.tertiary}
            />
            <Text style={styles.emptyText}>No recent activity</Text>
            <Text style={styles.emptySubtext}>
              Complete goals and screenings to see activity here
            </Text>
          </Card>
        </View>

        {/* Active Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Add Goal</Text>
            </TouchableOpacity>
          </View>
          <Card variant="outlined" style={styles.emptyActivity}>
            <Ionicons
              name="flag-outline"
              size={48}
              color={Colors.text.tertiary}
            />
            <Text style={styles.emptyText}>No active goals</Text>
            <Text style={styles.emptySubtext}>
              Connect with a therapist to set therapy goals
            </Text>
          </Card>
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
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
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
});
