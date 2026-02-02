import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Card } from "@/components/ui";
import { BADGE_DEFINITIONS } from "@/constants/badges";
import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";
import { useChild } from "@/hooks/useChildren";
import { supabase } from "@/lib/supabase";

const { width } = Dimensions.get("window");

interface UnlockedBadge {
  badge_id: string;
  unlocked_at: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

interface Milestone {
  id: string;
  title: string;
  emoji: string;
  starsRequired: number;
}

// Define star milestones
const STAR_MILESTONES: Milestone[] = [
  { id: "m1", title: "First Star", emoji: "⭐", starsRequired: 1 },
  { id: "m2", title: "Star Collector", emoji: "🌟", starsRequired: 10 },
  { id: "m3", title: "Star Explorer", emoji: "✨", starsRequired: 25 },
  { id: "m4", title: "Rising Star", emoji: "🌠", starsRequired: 50 },
  { id: "m5", title: "Star Champion", emoji: "🏆", starsRequired: 100 },
  { id: "m6", title: "Star Master", emoji: "👑", starsRequired: 250 },
  { id: "m7", title: "Star Legend", emoji: "🚀", starsRequired: 500 },
  { id: "m8", title: "Superstar", emoji: "💫", starsRequired: 1000 },
];

export default function GamificationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { child, loading: childLoading } = useChild(id);
  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [id]);

  const loadBadges = async () => {
    if (!id) return;

    try {
      const { data } = await supabase
        .from("badges")
        .select("badge_id, unlocked_at, tier")
        .eq("child_id", id);

      setUnlockedBadges(data || []);
    } catch (error) {
      console.error("Error loading badges:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || childLoading || !child) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </SafeAreaView>
    );
  }

  const totalStars = child.total_stars || 0;

  // Calculate current level based on stars
  const currentLevel = Math.floor(totalStars / 100) + 1;
  const starsInCurrentLevel = totalStars % 100;
  const levelProgress = starsInCurrentLevel / 100;

  // Get unlocked badge names
  const unlockedBadgeNames = unlockedBadges.map((b) => b.badge_id);

  const unlockedCount = unlockedBadges.length;
  const totalBadges = BADGE_DEFINITIONS.length;

  // Stats for display
  const stats = [
    {
      label: "Total Stars",
      value: totalStars,
      icon: "star",
      color: Colors.star,
    },
    {
      label: "Level",
      value: currentLevel,
      icon: "trophy",
      color: Colors.primary[500],
    },
    {
      label: "Badges",
      value: `${unlockedCount}/${totalBadges}`,
      icon: "ribbon",
      color: Colors.success[500],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Achievements</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        {/* Child Info */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Card variant="elevated" style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Avatar
                name={child.first_name}
                seed={child.avatar_seed || child.id}
                size="xl"
              />
              <View style={styles.profileInfo}>
                <Text style={styles.childName}>{child.first_name}</Text>
                <View style={styles.levelBadge}>
                  <Ionicons
                    name="trophy"
                    size={16}
                    color={Colors.primary[500]}
                  />
                  <Text style={styles.levelText}>Level {currentLevel}</Text>
                </View>
              </View>
            </View>

            {/* Level Progress */}
            <View style={styles.levelProgress}>
              <View style={styles.progressBarBg}>
                <Animated.View
                  entering={FadeInUp.delay(500).duration(600)}
                  style={[
                    styles.progressBarFill,
                    { width: `${levelProgress * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {starsInCurrentLevel}/100 to Level {currentLevel + 1}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.statsRow}
        >
          {stats.map((stat, index) => (
            <Animated.View
              key={stat.label}
              entering={FadeInDown.delay(300 + index * 100).duration(400)}
              style={styles.statCard}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: stat.color + "20" },
                ]}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={24}
                  color={stat.color}
                />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Star Milestones */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionTitle}>Star Milestones</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.milestonesScroll}
            contentContainerStyle={styles.milestonesContent}
          >
            {STAR_MILESTONES.map((milestone, index) => {
              const isUnlocked = totalStars >= milestone.starsRequired;
              const progress = Math.min(
                totalStars / milestone.starsRequired,
                1,
              );

              return (
                <Animated.View
                  key={milestone.id}
                  entering={FadeInDown.delay(500 + index * 50).duration(400)}
                  style={[
                    styles.milestoneCard,
                    isUnlocked && styles.milestoneUnlocked,
                  ]}
                >
                  <View
                    style={[
                      styles.milestoneIcon,
                      isUnlocked
                        ? { backgroundColor: Colors.star + "30" }
                        : { backgroundColor: Colors.surfaceVariant },
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{milestone.emoji}</Text>
                  </View>
                  <Text
                    style={[
                      styles.milestoneTitle,
                      isUnlocked && styles.milestoneTitleUnlocked,
                    ]}
                    numberOfLines={2}
                  >
                    {milestone.title}
                  </Text>
                  <Text style={styles.milestoneStars}>
                    {milestone.starsRequired} ⭐
                  </Text>
                  {!isUnlocked && (
                    <View style={styles.miniProgress}>
                      <View
                        style={[
                          styles.miniProgressFill,
                          { width: `${progress * 100}%` },
                        ]}
                      />
                    </View>
                  )}
                  {isUnlocked && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.success[500]}
                      style={styles.checkIcon}
                    />
                  )}
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Badges Section */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <View style={styles.badgesHeader}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <Text style={styles.badgeCount}>
              {unlockedCount}/{totalBadges} Unlocked
            </Text>
          </View>

          <View style={styles.badgesGrid}>
            {BADGE_DEFINITIONS.map((badge, index) => {
              const isUnlocked = unlockedBadgeNames.includes(badge.name);

              return (
                <Animated.View
                  key={badge.name}
                  entering={FadeInDown.delay(700 + index * 30).duration(400)}
                  style={styles.badgeWrapper}
                >
                  <View
                    style={[
                      styles.badgeCard,
                      !isUnlocked && styles.lockedBadge,
                    ]}
                  >
                    <View
                      style={[
                        styles.badgeIcon,
                        {
                          backgroundColor: isUnlocked
                            ? badge.color + "30"
                            : Colors.surfaceVariant,
                        },
                      ]}
                    >
                      <Text
                        style={{ fontSize: 24, opacity: isUnlocked ? 1 : 0.4 }}
                      >
                        {badge.emoji}
                      </Text>
                      {!isUnlocked && (
                        <View style={styles.lockOverlay}>
                          <Ionicons
                            name="lock-closed"
                            size={12}
                            color={Colors.text.tertiary}
                          />
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.badgeName,
                        !isUnlocked && styles.lockedText,
                      ]}
                      numberOfLines={1}
                    >
                      {badge.name}
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Motivational Message */}
        <Animated.View entering={FadeInDown.delay(900).duration(400)}>
          <Card variant="outlined" style={styles.motivationalCard}>
            <Text style={styles.motivationalEmoji}>🌟</Text>
            <Text style={styles.motivationalText}>
              {totalStars < 50
                ? "Great start! Keep going to earn more stars!"
                : totalStars < 200
                  ? "Amazing progress! You're a superstar!"
                  : "Incredible! You're a true champion!"}
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  profileCard: {
    marginBottom: Spacing.md,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  childName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: Spacing.sm,
  },
  levelText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
  },
  levelProgress: {
    marginTop: Spacing.lg,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primary[500],
    borderRadius: 6,
  },
  progressText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: ComponentStyle.borderRadius.lg,
    alignItems: "center",
    ...ComponentStyle.shadow.small,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
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
    color: Colors.text.tertiary,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  milestonesScroll: {
    marginHorizontal: -Spacing.lg,
  },
  milestonesContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  milestoneCard: {
    width: 120,
    backgroundColor: Colors.surface,
    borderRadius: ComponentStyle.borderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    ...ComponentStyle.shadow.small,
    position: "relative",
  },
  milestoneUnlocked: {
    borderWidth: 2,
    borderColor: Colors.star,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  milestoneTitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  milestoneTitleUnlocked: {
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  milestoneStars: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.star,
  },
  miniProgress: {
    width: "100%",
    height: 4,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 2,
    marginTop: Spacing.sm,
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: Colors.primary[300],
    borderRadius: 2,
  },
  checkIcon: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
  },
  badgesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  badgeCount: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  badgeWrapper: {
    width: (width - Spacing.lg * 2 - Spacing.md * 2) / 3,
  },
  badgeCard: {
    alignItems: "center",
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: ComponentStyle.borderRadius.lg,
    ...ComponentStyle.shadow.small,
  },
  lockedBadge: {
    opacity: 0.7,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
    position: "relative",
  },
  lockOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 2,
  },
  badgeName: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.primary,
    textAlign: "center",
  },
  lockedText: {
    color: Colors.text.tertiary,
  },
  motivationalCard: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[200],
    marginTop: Spacing.lg,
  },
  motivationalEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  motivationalText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[700],
    textAlign: "center",
  },
});
