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
import { Colors, Spacing, Typography } from "@/constants/theme";
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
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading goal...</Text>
      </SafeAreaView>
    );
  }

  // Show success celebration
  if (showSuccess) {
    return (
      <SafeAreaView style={[styles.container, styles.successContainer]}>
        <Animated.View
          entering={ZoomIn.springify()}
          style={styles.successContent}
        >
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Great Job!</Text>
          <Text style={styles.successText}>Progress logged successfully</Text>
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Progress</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Completion Status */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>
            Did you complete the goal today?
          </Text>
          <View style={styles.completionOptions}>
            <TouchableOpacity
              style={[
                styles.completionOption,
                completed && styles.completionOptionYes,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setCompleted(true);
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={completed ? Colors.success[500] : Colors.text.tertiary}
              />
              <Text
                style={[
                  styles.completionText,
                  completed && styles.completionTextActive,
                ]}
              >
                Yes!
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.completionOption,
                !completed && styles.completionOptionNo,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCompleted(false);
              }}
            >
              <Ionicons
                name="close-circle"
                size={48}
                color={!completed ? Colors.error[500] : Colors.text.tertiary}
              />
              <Text
                style={[
                  styles.completionText,
                  !completed && styles.completionTextNo,
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
            <Card variant="filled" style={styles.goalInfoCard}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              {goal.target_value && goal.unit && (
                <Text style={styles.goalTarget}>
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
            <Text style={styles.sectionTitle}>How much did they achieve?</Text>
            <View style={styles.valueInputContainer}>
              <TextInput
                value={achievedValue}
                onChangeText={setAchievedValue}
                style={styles.valueInput}
                placeholder="0"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
              />
              <Text style={styles.unitLabel}>{goal.unit}</Text>
            </View>

            {/* Progress Preview */}
            {achievedValue && (
              <View style={styles.progressPreview}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min((parseInt(achievedValue) / (goal.target_value || 1)) * 100, 100)}%`,
                        backgroundColor:
                          parseInt(achievedValue) >= (goal.target_value || 0)
                            ? Colors.success[500]
                            : Colors.primary[500],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
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
          <Text style={styles.sectionTitle}>How did it go?</Text>
          <View style={styles.moodOptions}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.moodOption,
                  mood === m.id && styles.moodOptionSelected,
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
                    mood === m.id && styles.moodLabelSelected,
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
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
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
          <Card variant="filled" style={styles.encouragementCard}>
            <Ionicons name="star" size={24} color={Colors.star} />
            <Text style={styles.encouragementText}>
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
    backgroundColor: Colors.background,
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
    color: Colors.text.primary,
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
    backgroundColor: Colors.surface,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.border,
  },
  completionOptionYes: {
    borderColor: Colors.success[500],
    backgroundColor: Colors.success[50],
  },
  completionOptionNo: {
    borderColor: Colors.error[500],
    backgroundColor: Colors.error[50],
  },
  completionText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  completionTextActive: {
    color: Colors.success[500],
  },
  completionTextNo: {
    color: Colors.error[500],
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
  moodOptionSelected: {
    backgroundColor: Colors.primary[50],
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  moodLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
  },
  moodLabelSelected: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
  },
  encouragementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary[50],
  },
  encouragementText: {
    flex: 1,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.secondary[700],
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
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  successContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
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
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  successText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  starBurstContainer: {
    marginTop: Spacing.md,
  },
  goalInfoCard: {
    backgroundColor: Colors.primary[50],
    padding: Spacing.lg,
    alignItems: "center",
  },
  goalTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[700],
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  goalTarget: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.primary[600],
  },
  valueInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    paddingHorizontal: Spacing.md,
  },
  valueInput: {
    flex: 1,
    padding: Spacing.lg,
    fontSize: 32,
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: "center",
  },
  unitLabel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    color: Colors.text.secondary,
  },
  progressPreview: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.primary[50],
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
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
