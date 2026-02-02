import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Input } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useGoals } from "@/hooks/useGoals";
import {
  FrequencyPeriod,
  GoalCategory,
  GoalPriority,
} from "@/types/database.types";

const CATEGORIES = [
  { id: "communication", label: "Communication", icon: "chatbubbles" },
  { id: "social", label: "Social Skills", icon: "people" },
  { id: "motor", label: "Motor Skills", icon: "hand-left" },
  { id: "cognitive", label: "Cognitive", icon: "bulb" },
  { id: "self_care", label: "Self Care", icon: "heart" },
  { id: "behavior", label: "Behavior", icon: "happy" },
];

const PRIORITIES = [
  { id: "low", label: "Low", color: Colors.success[500] },
  { id: "medium", label: "Medium", color: Colors.secondary[500] },
  { id: "high", label: "High", color: Colors.error[500] },
];

const FREQUENCIES = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

export default function CreateGoalScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { createGoal, loading } = useGoals(childId || "");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("communication");
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [frequency, setFrequency] = useState<FrequencyPeriod>("daily");
  const [targetFrequency, setTargetFrequency] = useState("1");

  const handleCreate = async () => {
    if (!title.trim() || !childId) return;

    const goal = await createGoal({
      child_id: childId,
      title: title.trim(),
      description: description.trim() || null,
      category,
      priority,
      target_frequency: parseInt(targetFrequency) || 1,
      frequency_period: frequency,
      status: "active",
    });

    if (goal) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.text.primary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Goal</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Input
              label="Goal Title"
              placeholder="e.g., Say 5 new words"
              value={title}
              onChangeText={setTitle}
              leftIcon="flag"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Input
              label="Description (Optional)"
              placeholder="Describe the goal in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </Animated.View>

          {/* Category */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.optionsGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    category === cat.id && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setCategory(cat.id as GoalCategory)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={24}
                    color={
                      category === cat.id
                        ? Colors.primary[500]
                        : Colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.id && styles.categoryTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Priority */}
          <Animated.View
            entering={FadeInDown.delay(250).duration(500)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.priorityOption,
                    { borderColor: p.color },
                    priority === p.id && { backgroundColor: p.color },
                  ]}
                  onPress={() => setPriority(p.id as GoalPriority)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      { color: priority === p.id ? Colors.surface : p.color },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Frequency */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Target Frequency</Text>
            <View style={styles.frequencyRow}>
              <Input
                placeholder="1"
                value={targetFrequency}
                onChangeText={setTargetFrequency}
                keyboardType="number-pad"
                style={styles.frequencyInput}
              />
              <Text style={styles.frequencyLabel}>times per</Text>
              <View style={styles.frequencyOptions}>
                {FREQUENCIES.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[
                      styles.frequencyOption,
                      frequency === f.id && styles.frequencyOptionSelected,
                    ]}
                    onPress={() => setFrequency(f.id as FrequencyPeriod)}
                  >
                    <Text
                      style={[
                        styles.frequencyOptionText,
                        frequency === f.id &&
                          styles.frequencyOptionTextSelected,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Create Button */}
          <Animated.View
            entering={FadeInDown.delay(350).duration(500)}
            style={styles.buttonContainer}
          >
            <Button
              title="Create Goal"
              onPress={handleCreate}
              variant="primary"
              fullWidth
              loading={loading}
              disabled={!title.trim()}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
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
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryOption: {
    width: "31%",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  categoryOptionSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  categoryText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  categoryTextSelected: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
  },
  priorityRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  priorityText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
  },
  frequencyRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  frequencyInput: {
    width: 60,
  },
  frequencyLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
  frequencyOptions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  frequencyOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  frequencyOptionSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  frequencyOptionText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  frequencyOptionTextSelected: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.surface,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
});
