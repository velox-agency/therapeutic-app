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

import { Avatar, Button, Card } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useChildren } from "@/hooks/useChildren";

export default function ParentDashboard() {
  const { profile, signOut } = useAuth();
  const { children, loading, refetch } = useChildren();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const totalStars = children.reduce(
    (sum, child) => sum + (child.total_stars || 0),
    0,
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary[500]}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{profile?.full_name || "Parent"} 👋</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(parent)/profile")}>
            <Avatar
              name={profile?.full_name}
              source={profile?.avatar_url}
              size="md"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Card variant="elevated" style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: Colors.primary[50] },
                  ]}
                >
                  <Ionicons
                    name="people"
                    size={24}
                    color={Colors.primary[500]}
                  />
                </View>
                <Text style={styles.statValue}>{children.length}</Text>
                <Text style={styles.statLabel}>Children</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#FFF9E6" }]}>
                  <Text style={styles.starEmoji}>⭐</Text>
                </View>
                <Text style={styles.statValue}>{totalStars}</Text>
                <Text style={styles.statLabel}>Total Stars</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: Colors.success[50] },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.success[500]}
                  />
                </View>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Goals Met</Text>
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
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/(parent)/children/add")}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: Colors.primary[50] },
                ]}
              >
                <Ionicons
                  name="person-add"
                  size={28}
                  color={Colors.primary[500]}
                />
              </View>
              <Text style={styles.actionText}>Add Child</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/(parent)/screening/start")}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: Colors.secondary[50] },
                ]}
              >
                <Ionicons
                  name="clipboard"
                  size={28}
                  color={Colors.secondary[500]}
                />
              </View>
              <Text style={styles.actionText}>M-CHAT-R</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: Colors.success[50] },
                ]}
              >
                <Ionicons
                  name="trending-up"
                  size={28}
                  color={Colors.success[500]}
                />
              </View>
              <Text style={styles.actionText}>Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: Colors.error[50] },
                ]}
              >
                <Ionicons name="book" size={28} color={Colors.error[500]} />
              </View>
              <Text style={styles.actionText}>Resources</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Children List */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Children</Text>
            {children.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/(parent)/children")}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {children.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons
                name="people-outline"
                size={48}
                color={Colors.text.tertiary}
              />
              <Text style={styles.emptyTitle}>No children added yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your child to start tracking their progress
              </Text>
              <Button
                title="Add Your First Child"
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
                <Card variant="elevated" style={styles.childCard}>
                  <View style={styles.childInfo}>
                    <Avatar
                      name={child.first_name}
                      seed={child.avatar_seed || child.id}
                      size="md"
                    />
                    <View style={styles.childDetails}>
                      <Text style={styles.childName}>{child.first_name}</Text>
                      <View style={styles.childStars}>
                        <Text style={styles.starEmoji}>⭐</Text>
                        <Text style={styles.starCount}>
                          {child.total_stars} stars
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.text.tertiary}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </Animated.View>

        {/* Tip of the Day */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          style={styles.section}
        >
          <Card variant="filled" style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={24} color={Colors.secondary[500]} />
              <Text style={styles.tipTitle}>Tip of the Day</Text>
            </View>
            <Text style={styles.tipText}>
              Consistency is key! Try to practice speech exercises at the same
              time each day to help your child build a routine.
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
  statsCard: {
    marginBottom: Spacing.lg,
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
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
  starEmoji: {
    fontSize: 20,
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
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
  childCard: {
    marginBottom: Spacing.sm,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  childDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  childName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  childStars: {
    flexDirection: "row",
    alignItems: "center",
  },
  starCount: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  tipCard: {
    backgroundColor: Colors.secondary[50],
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  tipTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary[600],
    marginLeft: Spacing.sm,
  },
  tipText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.small,
  },
});
