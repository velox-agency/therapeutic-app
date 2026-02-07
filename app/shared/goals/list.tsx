import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, ProgressBar } from "@/components/ui";
import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useChildren } from "@/hooks/useChildren";
import { useParentGoals } from "@/hooks/useGoals";
import { Goal, GoalPriority } from "@/types/database.types";

type FilterType = "all" | "active" | "completed";

export default function GoalsListScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { children } = useChildren();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const childIds = useMemo(() => children.map((c) => c.id), [children]);
  const { goals, loading, refetch } = useParentGoals(childIds);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredGoals = useMemo(() => {
    switch (activeFilter) {
      case "active":
        return goals.filter((g) => g.status === "active");
      case "completed":
        return goals.filter((g) => g.status === "completed");
      default:
        return goals;
    }
  }, [goals, activeFilter]);

  const categoryIcons: Record<string, string> = {
    communication: "chatbubbles",
    social: "people",
    motor: "hand-left",
    cognitive: "bulb",
    self_care: "heart",
    behavior: "happy",
  };

  const priorityColors: Record<GoalPriority, string> = {
    low: colors.success,
    medium: colors.secondary,
    high: colors.error,
  };

  const renderGoalCard = ({
    item,
    index,
  }: {
    item: Goal & { child?: { first_name: string; id: string } };
    index: number;
  }) => {
    const goalPriority = (item.priority as GoalPriority) || "medium";
    const isCompleted = item.status === "completed";

    return (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <TouchableOpacity
          onPress={() => router.push(`/shared/goals/${item.id}` as any)}
          activeOpacity={0.7}
        >
          <Card
            variant="elevated"
            style={
              StyleSheet.flatten([
                styles.goalCard,
                isCompleted && styles.completedCard,
              ]) as ViewStyle
            }
          >
            <View style={styles.goalHeader}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Ionicons
                  name={(categoryIcons[item.category] || "flag") as any}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.goalInfo}>
                <Text
                  style={[styles.goalTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.child && (
                  <Text
                    style={[styles.childName, { color: colors.textSecondary }]}
                  >
                    For {item.child.first_name}
                  </Text>
                )}
              </View>
              {isCompleted ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.success}
                />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textTertiary}
                />
              )}
            </View>

            {!isCompleted && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text
                    style={[
                      styles.progressLabel,
                      { color: colors.textTertiary },
                    ]}
                  >
                    {item.target_frequency}x / {item.frequency_period}
                  </Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: priorityColors[goalPriority] + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: priorityColors[goalPriority] },
                      ]}
                    >
                      {goalPriority}
                    </Text>
                  </View>
                </View>
                <ProgressBar
                  progress={0} // Will be calculated from daily logs
                  color={colors.primary}
                />
              </View>
            )}

            {item.description && (
              <Text
                style={[
                  styles.goalDescription,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Goals</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setActiveFilter(filter.key)}
            style={[
              styles.filterButton,
              { backgroundColor: colors.surface },
              activeFilter === filter.key && [
                styles.filterButtonActive,
                { backgroundColor: colors.primary },
              ],
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: colors.textSecondary },
                activeFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Goals List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredGoals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="flag-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {activeFilter === "all"
              ? "No Goals Yet"
              : activeFilter === "active"
                ? "No Active Goals"
                : "No Completed Goals"}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {activeFilter === "all"
              ? "Goals set by your child's therapist will appear here"
              : activeFilter === "active"
                ? "All goals have been completed!"
                : "Complete goals to see them here"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredGoals}
          renderItem={renderGoalCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  filterButtonActive: {},
  filterText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
  },
  filterTextActive: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.tabBarClearance,
  },
  goalCard: {
    marginBottom: Spacing.md,
  },
  completedCard: {
    opacity: 0.7,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  goalInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  goalTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
  },
  childName: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    marginTop: Spacing.xs,
  },
  progressSection: {
    marginTop: Spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "capitalize",
  },
  goalDescription: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    marginTop: Spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
});
