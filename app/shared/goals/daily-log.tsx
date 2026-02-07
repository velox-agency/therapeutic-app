import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { StarBurst } from "@/components/gamification";
import { Button, Card, Input } from "@/components/ui";
import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useGoal, useGoals } from "@/hooks/useGoals";
import { awardStars } from "@/lib/gamification";
import { supabase } from "@/lib/supabase";

const MOODS = [
  { id: "great", emoji: "😊", label: "Great", stars: 3 },
  { id: "good", emoji: "🙂", label: "Good", stars: 2 },
  { id: "okay", emoji: "😐", label: "Okay", stars: 1 },
  { id: "difficult", emoji: "😕", label: "Difficult", stars: 1 },
  { id: "challenging", emoji: "😔", label: "Challenging", stars: 0 },
];

export default function DailyLogScreen() {
  const { colors } = useTheme();
  const { childId, goalId } = useLocalSearchParams<{
    childId: string;
    goalId: string;
  }>();
  const { goal, loading: goalLoading } = useGoal(goalId);
  const { logProgress, loading } = useGoals(childId || "");

  const [completed, setCompleted] = useState(true);
  const [achievedValue, setAchievedValue] = useState("");
  const [mood, setMood] = useState("good");
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [starsAwarded, setStarsAwarded] = useState(0);

  // Calculate stars based on performance
  const calculateStars = (): number => {
    if (!completed) return 0;

    // If goal has target value, calculate based on achievement percentage
    if (goal?.target_value && achievedValue) {
      const percentage = (parseInt(achievedValue) / goal.target_value) * 100;
      if (percentage >= 100) return 3;
      if (percentage >= 75) return 2;
      if (percentage >= 50) return 1;
      return 1;
    }

    // Otherwise use mood-based calculation
    const moodData = MOODS.find((m) => m.id === mood);
    return moodData?.stars || 1;
  };

  const handleSubmit = async () => {
    if (!goalId || !childId) return;

    const stars = calculateStars();
    setStarsAwarded(stars);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Log the progress
      const { error: logError } = await supabase.from("daily_logs").insert({
        goal_id: goalId,
        child_id: childId,
        logged_by: user?.id,
        achieved_value: achievedValue
          ? parseInt(achievedValue)
          : completed
            ? 1
            : 0,
        notes: notes.trim() || null,
        stars_earned: stars,
        log_date: new Date().toISOString().split("T")[0],
      });

      if (logError) throw logError;

      // Award stars to child
      if (stars > 0) {
        await awardStars({
          childId,
          starsEarned: stars,
          reason: `Progress on: ${goal?.title || "Goal"}`,
        });
      }

      // Show success animation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);

      // Navigate back after animation
      setTimeout(() => {
        router.back();
      }, 2500);
    } catch (error) {
      console.error("Error logging progress:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Show loading state
  if (goalLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading goal...
        </Text>
      </SafeAreaView>
    );
  }

  // Show success celebration
  if (showSuccess) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.successContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Animated.View
          entering={ZoomIn.springify()}
          style={styles.successContent}
        >
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Great Job!
          </Text>
          <Text style={[styles.successText, { color: colors.textSecondary }]}>
            Progress logged successfully
          </Text>
          {starsAwarded > 0 && (
            <View style={styles.starBurstContainer}>
              <StarBurst totalStars={starsAwarded} />
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Log Progress
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Completion Status */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Did you complete the goal today?
          </Text>
          <View style={styles.completionOptions}>
            <TouchableOpacity
              style={[
                styles.completionOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                completed && [
                  styles.completionOptionYes,
                  {
                    borderColor: colors.success,
                    backgroundColor: colors.successLight,
                  },
                ],
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setCompleted(true);
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={completed ? colors.success : colors.textTertiary}
              />
              <Text
                style={[
                  styles.completionText,
                  { color: colors.textSecondary },
                  completed && { color: colors.success },
                ]}
              >
                Yes!
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.completionOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                !completed && [
                  styles.completionOptionNo,
                  {
                    borderColor: colors.error,
                    backgroundColor: colors.errorLight,
                  },
                ],
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCompleted(false);
              }}
            >
              <Ionicons
                name="close-circle"
                size={48}
                color={!completed ? colors.error : colors.textTertiary}
              />
              <Text
                style={[
                  styles.completionText,
                  { color: colors.textSecondary },
                  !completed && { color: colors.error },
                ]}
              >
                Not today
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Goal Info Card */}
        {goal && (
          <Animated.View
            entering={FadeInDown.delay(150).duration(500)}
            style={styles.section}
          >
            <Card
              variant="filled"
              style={StyleSheet.flatten([
                styles.goalInfoCard,
                { backgroundColor: colors.primaryLight },
              ])}
            >
              <Text style={[styles.goalTitle, { color: colors.primaryDark }]}>
                {goal.title}
              </Text>
              {goal.target_value && goal.unit && (
                <Text style={[styles.goalTarget, { color: colors.primary }]}>
                  🎯 Target: {goal.target_value} {goal.unit}
                </Text>
              )}
            </Card>
          </Animated.View>
        )}

        {/* Achievement Value (only if goal has target) */}
        {goal?.target_value && completed && (
          <Animated.View
            entering={FadeInDown.delay(180).duration(500)}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              How much did they achieve?
            </Text>
            <View
              style={[
                styles.valueInputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                },
              ]}
            >
              <TextInput
                value={achievedValue}
                onChangeText={setAchievedValue}
                style={[styles.valueInput, { color: colors.text }]}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
              />
              <Text style={[styles.unitLabel, { color: colors.textSecondary }]}>
                {goal.unit}
              </Text>
            </View>

            {/* Progress Preview */}
            {achievedValue && (
              <View style={styles.progressPreview}>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min((parseInt(achievedValue) / (goal.target_value || 1)) * 100, 100)}%`,
                        backgroundColor:
                          parseInt(achievedValue) >= (goal.target_value || 0)
                            ? colors.success
                            : colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.progressText, { color: colors.textSecondary }]}
                >
                  {achievedValue} / {goal.target_value} {goal.unit}
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Mood */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            How did it go?
          </Text>
          <View style={styles.moodOptions}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.moodOption,
                  mood === m.id && [
                    styles.moodOptionSelected,
                    { backgroundColor: colors.primaryLight },
                  ],
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setMood(m.id);
                }}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    { color: colors.textSecondary },
                    mood === m.id && {
                      color: colors.primary,
                      fontFamily: Typography.fontFamily.primaryBold,
                      fontWeight: Typography.fontWeight.bold,
                    },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Notes */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notes (Optional)
          </Text>
          <Input
            placeholder="Any observations or notes about today..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </Animated.View>

        {/* Encouragement */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Card
            variant="filled"
            style={StyleSheet.flatten([
              styles.encouragementCard,
              { backgroundColor: colors.secondaryLight },
            ])}
          >
            <Ionicons name="star" size={24} color={colors.star} />
            <Text style={[styles.encouragementText, { color: colors.text }]}>
              {completed
                ? "Great job! Every step counts towards progress! 🌟"
                : "It's okay! Tomorrow is a new opportunity. Keep going! 💪"}
            </Text>
          </Card>
        </Animated.View>

        {/* Submit */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          style={styles.buttonContainer}
        >
          <Button
            title="Save Log"
            onPress={handleSubmit}
            variant="primary"
            fullWidth
            loading={loading}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.tabBarClearance,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
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
  headerPlaceholder: {
    width: 44,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  completionOptions: {
    flexDirection: "row",
    gap: Spacing.lg,
    justifyContent: "center",
  },
  completionOption: {
    width: 120,
    height: 120,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  completionOptionYes: {},
  completionOptionNo: {},
  completionText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.sm,
  },
  moodOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodOption: {
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: 16,
    minWidth: 60,
  },
  moodOptionSelected: {},
  moodEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  moodLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
  },
  encouragementCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  encouragementText: {
    flex: 1,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    marginLeft: Spacing.md,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    marginTop: Spacing.md,
  },
  successContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  successContent: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  successText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.lg,
  },
  starBurstContainer: {
    marginTop: Spacing.md,
  },
  goalInfoCard: {
    padding: Spacing.lg,
    alignItems: "center",
  },
  goalTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  goalTarget: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
  },
  valueInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
  },
  valueInput: {
    flex: 1,
    padding: Spacing.lg,
    fontSize: 32,
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
  },
  unitLabel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
  },
  progressPreview: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    textAlign: "center",
  },
});
