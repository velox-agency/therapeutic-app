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
import { Animation, Colors, Spacing, Typography } from "@/constants/theme";
import { useScreening } from "@/hooks/useScreening";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ScreeningStartScreen() {
  const params = useLocalSearchParams<{ childId: string; childName: string }>();
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={28} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>M-CHAT-R</Text>
        <Text style={styles.questionCount}>{currentQuestion}/20</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} size="small" />
      </View>

      {/* Child Name */}
      <Text style={styles.childName}>Screening for {params.childName}</Text>

      {/* Question Card */}
      <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
        <Card variant="elevated" style={styles.questionCard}>
          <Text style={styles.questionNumber}>Question {currentQuestion}</Text>
          <Text style={styles.questionText}>{question.question}</Text>

          {question.examples && question.examples.length > 0 && (
            <View style={styles.examplesContainer}>
              <Text style={styles.examplesTitle}>Examples:</Text>
              {question.examples.map((example, index) => (
                <Text key={index} style={styles.exampleText}>
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
            currentAnswer === true && styles.selectedYes,
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
            color={
              currentAnswer === true ? Colors.text.inverse : Colors.success[500]
            }
          />
          <Text
            style={[
              styles.answerText,
              currentAnswer === true && styles.selectedAnswerText,
            ]}
          >
            Yes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.answerButton,
            styles.noButton,
            currentAnswer === false && styles.selectedNo,
          ]}
          onPress={() => handleAnswer(false)}
        >
          <Ionicons
            name={
              currentAnswer === false ? "close-circle" : "close-circle-outline"
            }
            size={32}
            color={
              currentAnswer === false ? Colors.text.inverse : Colors.error[500]
            }
          />
          <Text
            style={[
              styles.answerText,
              currentAnswer === false && styles.selectedAnswerText,
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
            color={
              currentQuestion === 1 ? Colors.text.disabled : Colors.text.primary
            }
          />
          <Text
            style={[
              styles.navText,
              currentQuestion === 1 && styles.navTextDisabled,
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
            <Text style={styles.navText}>Next</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>
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
  headerTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  questionCount: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  childName: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  cardContainer: {
    flex: 1,
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
    color: Colors.primary[500],
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  questionText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: "center",
    lineHeight: Typography.lineHeight.h3,
  },
  examplesContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
  },
  examplesTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  exampleText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
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
  yesButton: {
    borderColor: Colors.success[500],
    backgroundColor: Colors.success[50],
  },
  noButton: {
    borderColor: Colors.error[500],
    backgroundColor: Colors.error[50],
  },
  selectedYes: {
    backgroundColor: Colors.success[500],
  },
  selectedNo: {
    backgroundColor: Colors.error[500],
  },
  answerText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  selectedAnswerText: {
    color: Colors.text.inverse,
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
    color: Colors.text.primary,
  },
  navTextDisabled: {
    color: Colors.text.disabled,
  },
});
