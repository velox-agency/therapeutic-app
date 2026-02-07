import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, ProgressBar } from "@/components/ui";
import { MCHAT_QUESTIONS } from "@/constants/mchat-questions";
import { Animation, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useScreening } from "@/hooks/useScreening";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ScreeningStartScreen() {
  const params = useLocalSearchParams<{ childId: string; childName: string }>();
  const { colors } = useTheme();
  const {
    answers,
    currentQuestion,
    isComplete,
    setAnswer,
    nextQuestion,
    previousQuestion,
    submitScreening,
    reset,
  } = useScreening();

  const [submitting, setSubmitting] = useState(false);
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const question = MCHAT_QUESTIONS[currentQuestion - 1];
  const progress = (Object.keys(answers).length / 20) * 100;
  const currentAnswer = answers[String(currentQuestion)];

  const animateCardChange = (direction: "next" | "prev") => {
    const targetX = direction === "next" ? -SCREEN_WIDTH : SCREEN_WIDTH;

    translateX.value = withTiming(targetX, { duration: 200 }, () => {
      if (direction === "next") {
        runOnJS(nextQuestion)();
      } else {
        runOnJS(previousQuestion)();
      }
      translateX.value = -targetX;
      translateX.value = withSpring(0, Animation.spring.smooth);
    });
  };

  const handleAnswer = (answer: boolean) => {
    setAnswer(currentQuestion, answer);

    if (currentQuestion < 20) {
      setTimeout(() => animateCardChange("next"), 150);
    }
  };

  const handleSubmit = async () => {
    if (!params.childId) {
      Alert.alert("Error", "No child selected");
      return;
    }

    if (!isComplete) {
      Alert.alert(
        "Incomplete",
        "Please answer all 20 questions before submitting.",
      );
      return;
    }

    setSubmitting(true);
    const { data, error } = await submitScreening(params.childId);
    setSubmitting(false);

    if (error) {
      Alert.alert("Error", "Failed to save screening. Please try again.");
    } else if (data) {
      router.replace({
        pathname: "/(parent)/screening/result",
        params: {
          screeningId: data.id,
          riskLevel: data.risk_level,
          score: String(data.total_score),
          childName: params.childName,
        },
      });
    }
  };

  const handleClose = () => {
    Alert.alert(
      "Exit Screening?",
      "Your progress will be lost. Are you sure you want to exit?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", style: "destructive", onPress: () => router.back() },
      ],
    );
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: cardOpacity.value,
  }));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          M-CHAT-R
        </Text>
        <Text style={[styles.questionCount, { color: colors.textSecondary }]}>
          {currentQuestion}/20
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} size="small" />
      </View>

      {/* Child Name */}
      <Text style={[styles.childName, { color: colors.textSecondary }]}>
        Screening for {params.childName}
      </Text>

      {/* Question Card */}
      <Animated.View
        style={[styles.cardContainer, { marginBottom: 16 }, animatedCardStyle]}
      >
        <Card variant="elevated" style={styles.questionCard}>
          <Text style={[styles.questionNumber, { color: colors.primary }]}>
            Question {currentQuestion}
          </Text>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {question.question}
          </Text>

          {question.examples && question.examples.length > 0 && (
            <View
              style={[
                styles.examplesContainer,
                { backgroundColor: colors.surfaceVariant },
              ]}
            >
              <Text
                style={[styles.examplesTitle, { color: colors.textSecondary }]}
              >
                Examples:
              </Text>
              {question.examples.map((example, index) => (
                <Text
                  key={index}
                  style={[styles.exampleText, { color: colors.textSecondary }]}
                >
                  • {example}
                </Text>
              ))}
            </View>
          )}
        </Card>
      </Animated.View>

      {/* Answer Buttons */}
      <View style={styles.answerContainer}>
        <TouchableOpacity
          style={[
            styles.answerButton,
            styles.yesButton,
            {
              borderColor: colors.success,
              backgroundColor: colors.successLight,
            },
            currentAnswer === true && { backgroundColor: colors.success },
          ]}
          onPress={() => handleAnswer(true)}
        >
          <Ionicons
            name={
              currentAnswer === true
                ? "checkmark-circle"
                : "checkmark-circle-outline"
            }
            size={32}
            color={currentAnswer === true ? colors.textInverse : colors.success}
          />
          <Text
            style={[
              styles.answerText,
              { color: colors.text },
              currentAnswer === true && { color: colors.textInverse },
            ]}
          >
            Yes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.answerButton,
            styles.noButton,
            { borderColor: colors.error, backgroundColor: colors.errorLight },
            currentAnswer === false && { backgroundColor: colors.error },
          ]}
          onPress={() => handleAnswer(false)}
        >
          <Ionicons
            name={
              currentAnswer === false ? "close-circle" : "close-circle-outline"
            }
            size={32}
            color={currentAnswer === false ? colors.textInverse : colors.error}
          />
          <Text
            style={[
              styles.answerText,
              { color: colors.text },
              currentAnswer === false && { color: colors.textInverse },
            ]}
          >
            No
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => animateCardChange("prev")}
          disabled={currentQuestion === 1}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentQuestion === 1 ? colors.textSecondary : colors.text}
          />
          <Text
            style={[
              styles.navText,
              { color: colors.text },
              currentQuestion === 1 && { color: colors.textSecondary },
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {currentQuestion === 20 ? (
          <Button
            title={
              isComplete ? "Submit" : `${20 - Object.keys(answers).length} left`
            }
            onPress={handleSubmit}
            disabled={!isComplete}
            loading={submitting}
            variant={isComplete ? "success" : "ghost"}
            size="medium"
          />
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => animateCardChange("next")}
          >
            <Text style={[styles.navText, { color: colors.text }]}>Next</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
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
  headerTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
  },
  questionCount: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  childName: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  cardContainer: {
    flex: 0.8,
    paddingHorizontal: Spacing.lg,
  },
  questionCard: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: Spacing.xl,
  },
  questionNumber: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  questionText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    lineHeight: Typography.lineHeight.h3,
  },
  examplesContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
  },
  examplesTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  exampleText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    marginBottom: Spacing.xs,
  },
  answerContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  answerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  yesButton: {},
  noButton: {},
  answerText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  navText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
  },
  navTextDisabled: {},
});
