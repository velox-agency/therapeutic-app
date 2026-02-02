import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { getRiskColor, getRiskDisplayText } from "@/lib/mchat";
import { RiskLevel } from "@/types/database.types";

export default function ScreeningResultScreen() {
  const params = useLocalSearchParams<{
    screeningId: string;
    riskLevel: RiskLevel;
    score: string;
    childName: string;
  }>();

  const riskLevel = params.riskLevel || "low";
  const score = parseInt(params.score || "0", 10);
  const riskColor = getRiskColor(riskLevel);
  const riskText = getRiskDisplayText(riskLevel);

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (riskLevel) {
      case "low":
        return "checkmark-circle";
      case "medium":
        return "alert-circle";
      case "high":
        return "warning";
      default:
        return "information-circle";
    }
  };

  const getMessage = (): string => {
    switch (riskLevel) {
      case "low":
        return "The screening results indicate low risk. If your child is younger than 24 months, consider screening again after their second birthday.";
      case "medium":
        return "The screening results indicate medium risk. We recommend a follow-up screening (M-CHAT-R/F) to gather more information about concerning responses.";
      case "high":
        return "The screening results indicate high risk. We strongly recommend scheduling a diagnostic evaluation with a specialist as soon as possible.";
      default:
        return "";
    }
  };

  const getNextSteps = (): string[] => {
    switch (riskLevel) {
      case "low":
        return [
          "Continue monitoring your child's development",
          "Attend regular pediatric check-ups",
          "Screen again if concerns arise",
        ];
      case "medium":
        return [
          "Complete the M-CHAT-R Follow-Up interview",
          "Discuss results with your pediatrician",
          "Consider a developmental evaluation",
        ];
      case "high":
        return [
          "Schedule a diagnostic evaluation immediately",
          "Contact early intervention services",
          "Connect with a speech-language pathologist",
          "Share results with your pediatrician",
        ];
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Result Icon */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.iconContainer}
        >
          <View
            style={[styles.iconCircle, { backgroundColor: riskColor + "20" }]}
          >
            <Ionicons name={getIconName()} size={80} color={riskColor} />
          </View>
        </Animated.View>

        {/* Result Title */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.childName}>{params.childName}'s Result</Text>
          <Text style={[styles.riskLevel, { color: riskColor }]}>
            {riskText}
          </Text>
          <Text style={styles.score}>Score: {score} / 20</Text>
        </Animated.View>

        {/* Message */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Card variant="elevated" style={styles.messageCard}>
            <Text style={styles.messageText}>{getMessage()}</Text>
          </Card>
        </Animated.View>

        {/* Next Steps */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
          <Card variant="outlined">
            {getNextSteps().map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: riskColor + "20" },
                  ]}
                >
                  <Text style={[styles.stepNumberText, { color: riskColor }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* Disclaimer */}
        <Animated.View entering={FadeInDown.delay(800).duration(500)}>
          <Card variant="filled" style={styles.disclaimerCard}>
            <View style={styles.disclaimerHeader}>
              <Ionicons
                name="information-circle"
                size={20}
                color={Colors.text.secondary}
              />
              <Text style={styles.disclaimerTitle}>Important Note</Text>
            </View>
            <Text style={styles.disclaimerText}>
              This screening is not a diagnosis. Only a qualified healthcare
              professional can diagnose autism spectrum disorder. Please consult
              with your pediatrician or a specialist for a comprehensive
              evaluation.
            </Text>
          </Card>
        </Animated.View>

        {/* Actions */}
        <Animated.View
          entering={FadeInDown.delay(1000).duration(500)}
          style={styles.actions}
        >
          <Button
            title="Find Therapist"
            onPress={() => {}}
            variant="primary"
            fullWidth
            style={styles.primaryAction}
          />

          <Button
            title="Return to Dashboard"
            onPress={() => router.replace("/(parent)/dashboard")}
            variant="outline"
            fullWidth
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
    paddingVertical: Spacing.xl,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  childName: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  riskLevel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  score: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.h4,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  messageCard: {
    marginBottom: Spacing.lg,
  },
  messageText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    lineHeight: Typography.lineHeight.body,
    textAlign: "center",
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  stepNumberText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
  },
  stepText: {
    flex: 1,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
  },
  disclaimerCard: {
    marginBottom: Spacing.lg,
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  disclaimerTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  disclaimerText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.small,
  },
  actions: {
    gap: Spacing.md,
  },
  primaryAction: {
    marginBottom: Spacing.sm,
  },
});
