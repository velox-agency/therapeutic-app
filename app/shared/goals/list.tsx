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
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useChildren } from "@/hooks/useChildren";
import { useParentGoals } from "@/hooks/useGoals";
import { Goal, GoalPriority } from "@/types/database.types";

type FilterType = "all" | "active" | "completed";

export default function GoalsListScreen() {
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
    low: Colors.success[500],
    medium: Colors.secondary[500],
    high: Colors.error[500],
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
                  { backgroundColor: Colors.primary[50] },
                ]}
              >
                <Ionicons
                  name={(categoryIcons[item.category] || "flag") as any}
                  size={24}
                  color={Colors.primary[500]}
                />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.child && (
                  <Text style={styles.childName}>
                    For {item.child.first_name}
                  </Text>
                )}
              </View>
              {isCompleted ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.success[500]}
                />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.text.tertiary}
                />
              )}
            </View>

            {!isCompleted && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
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
                  color={Colors.primary[500]}
                />
              </View>
            )}

            {item.description && (
              <Text style={styles.goalDescription} numberOfLines={2}>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goals</Text>
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
              activeFilter === filter.key && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
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
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      ) : filteredGoals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="flag-outline"
            size={64}
            color={Colors.text.tertiary}
          />
          <Text style={styles.emptyTitle}>
            {activeFilter === "all"
              ? "No Goals Yet"
              : activeFilter === "active"
                ? "No Active Goals"
                : "No Completed Goals"}
          </Text>
          <Text style={styles.emptySubtitle}>
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
              tintColor={Colors.primary[500]}
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
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
    backgroundColor: Colors.surface,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  filterText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
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
    color: Colors.text.primary,
  },
  childName: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
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
    color: Colors.text.tertiary,
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
    color: Colors.text.secondary,
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
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
});
