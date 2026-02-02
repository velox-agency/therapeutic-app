import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, Input } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useGoals } from "@/hooks/useGoals";

const MOODS = [
  { id: "great", emoji: "😊", label: "Great" },
  { id: "good", emoji: "🙂", label: "Good" },
  { id: "okay", emoji: "😐", label: "Okay" },
  { id: "difficult", emoji: "😕", label: "Difficult" },
  { id: "challenging", emoji: "😔", label: "Challenging" },
];

export default function DailyLogScreen() {
  const { childId, goalId } = useLocalSearchParams<{
    childId: string;
    goalId: string;
  }>();
  const { logProgress, loading } = useGoals(childId || "");

  const [completed, setCompleted] = useState(true);
  const [mood, setMood] = useState("good");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!goalId || !childId) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await logProgress({
      goalId,
      childId,
      achievedValue: completed ? 1 : 0,
      notes: notes.trim() || undefined,
      starsEarned: completed ? 1 : 0,
    });

    router.back();
  };

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
    paddingBottom: Spacing.xxl,
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
});
