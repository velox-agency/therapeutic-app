import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  CRITICAL_ITEM_NUMBERS,
  MChatQuestion,
} from "@/constants/mchat-questions";
import { Colors, Spacing, Typography } from "@/constants/theme";

interface QuestionCardProps {
  question: MChatQuestion;
  answer?: boolean;
  onAnswer: (answer: boolean) => void;
  index: number;
}

export function QuestionCard({
  question,
  answer,
  onAnswer,
  index,
}: QuestionCardProps) {
  const yesScale = useSharedValue(1);
  const noScale = useSharedValue(1);

  // Check if this is a critical item
  const isCritical = CRITICAL_ITEM_NUMBERS.includes(question.number);

  const handleYes = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAnswer(true);
  };

  const handleNo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAnswer(false);
  };

  const yesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: yesScale.value }],
  }));

  const noAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: noScale.value }],
  }));

  return (
    <Animated.View
      entering={SlideInRight.delay(100).duration(300)}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.questionNumber}>
          <Text style={styles.questionNumberText}>{question.number}</Text>
        </View>
        {isCritical && (
          <View style={styles.criticalBadge}>
            <Ionicons name="alert-circle" size={14} color={Colors.error[500]} />
            <Text style={styles.criticalText}>Critical</Text>
          </View>
        )}
      </View>

      <Text style={styles.questionText}>{question.question}</Text>

      {question.examples && question.examples.length > 0 && (
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleLabel}>Example:</Text>
          <Text style={styles.exampleText}>{question.examples[0]}</Text>
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={handleNo}
          onPressIn={() => {
            noScale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            noScale.value = withSpring(1);
          }}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.answerButton,
              styles.noButton,
              answer === false && styles.noButtonSelected,
              noAnimatedStyle,
            ]}
          >
            <Ionicons
              name="close"
              size={32}
              color={answer === false ? Colors.surface : Colors.error[500]}
            />
            <Text
              style={[
                styles.answerText,
                styles.noText,
                answer === false && styles.answerTextSelected,
              ]}
            >
              No
            </Text>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleYes}
          onPressIn={() => {
            yesScale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            yesScale.value = withSpring(1);
          }}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.answerButton,
              styles.yesButton,
              answer === true && styles.yesButtonSelected,
              yesAnimatedStyle,
            ]}
          >
            <Ionicons
              name="checkmark"
              size={32}
              color={answer === true ? Colors.surface : Colors.success[500]}
            />
            <Text
              style={[
                styles.answerText,
                styles.yesText,
                answer === true && styles.answerTextSelected,
              ]}
            >
              Yes
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

interface ScreeningProgressProps {
  current: number;
  total: number;
  answeredCount: number;
}

export function ScreeningProgress({
  current,
  total,
  answeredCount,
}: ScreeningProgressProps) {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          Question {current} of {total}
        </Text>
        <Text style={styles.answeredText}>{answeredCount} answered</Text>
      </View>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: `${(current / total) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  questionNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
  },
  questionNumberText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.surface,
  },
  criticalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.error[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: Spacing.sm,
  },
  criticalText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.error[500],
    marginLeft: 4,
  },
  questionText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.h4,
    color: Colors.text.primary,
    lineHeight: 28,
    marginBottom: Spacing.md,
  },
  exampleContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  exampleLabel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[700],
    marginBottom: 4,
  },
  exampleText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.primary[700],
    fontStyle: "italic",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  answerButton: {
    width: 100,
    height: 100,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  yesButton: {
    backgroundColor: Colors.success[50],
    borderColor: Colors.success[200],
  },
  yesButtonSelected: {
    backgroundColor: Colors.success[500],
    borderColor: Colors.success[500],
  },
  noButton: {
    backgroundColor: Colors.error[50],
    borderColor: Colors.error[200],
  },
  noButtonSelected: {
    backgroundColor: Colors.error[500],
    borderColor: Colors.error[500],
  },
  answerText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 4,
  },
  yesText: {
    color: Colors.success[500],
  },
  noText: {
    color: Colors.error[500],
  },
  answerTextSelected: {
    color: Colors.surface,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  progressText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  answeredText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary[500],
    borderRadius: 4,
  },
});
