import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Colors, Spacing, Typography } from "@/constants/theme";
import { RiskLevel, getRiskColor, getRiskDisplayText } from "@/lib/mchat";

interface RiskIndicatorProps {
  riskLevel: RiskLevel;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

export function RiskIndicator({
  riskLevel,
  size = "medium",
  showLabel = true,
}: RiskIndicatorProps) {
  const color = getRiskColor(riskLevel);
  const text = getRiskDisplayText(riskLevel);

  const sizes = {
    small: { icon: 24, container: 40 },
    medium: { icon: 32, container: 56 },
    large: { icon: 48, container: 80 },
  };

  const iconName = {
    low: "checkmark-circle" as const,
    medium: "alert-circle" as const,
    high: "warning" as const,
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            width: sizes[size].container,
            height: sizes[size].container,
            borderRadius: sizes[size].container / 2,
            backgroundColor: color + "20",
          },
        ]}
      >
        <Ionicons
          name={iconName[riskLevel]}
          size={sizes[size].icon}
          color={color}
        />
      </View>
      {showLabel && <Text style={[styles.label, { color }]}>{text}</Text>}
    </View>
  );
}

interface RiskScoreDisplayProps {
  score: number;
  maxScore: number;
  riskLevel: RiskLevel;
}

export function RiskScoreDisplay({
  score,
  maxScore,
  riskLevel,
}: RiskScoreDisplayProps) {
  const color = getRiskColor(riskLevel);

  return (
    <View style={styles.scoreContainer}>
      <View style={styles.scoreCircle}>
        <Text style={[styles.scoreValue, { color }]}>{score}</Text>
        <Text style={styles.scoreDivider}>/ {maxScore}</Text>
      </View>
      <RiskIndicator riskLevel={riskLevel} size="small" />
    </View>
  );
}

interface RiskExplanationProps {
  riskLevel: RiskLevel;
}

export function RiskExplanation({ riskLevel }: RiskExplanationProps) {
  const explanations = {
    low: {
      title: "Low Risk",
      description:
        "The screening results indicate low risk for autism spectrum disorder. Continue monitoring your child's development and maintain regular pediatric check-ups.",
      recommendation: "No immediate action required, but stay observant.",
    },
    medium: {
      title: "Medium Risk",
      description:
        "The screening results indicate some developmental concerns that may benefit from further evaluation. This does not mean your child has ASD.",
      recommendation:
        "Consider scheduling a follow-up screening or consultation with a specialist.",
    },
    high: {
      title: "High Risk",
      description:
        "The screening results suggest your child may benefit from a comprehensive developmental evaluation by a qualified specialist.",
      recommendation:
        "We strongly recommend consulting with a developmental pediatrician or specialist.",
    },
  };

  const info = explanations[riskLevel];
  const color = getRiskColor(riskLevel);

  return (
    <View style={[styles.explanationContainer, { borderLeftColor: color }]}>
      <Text style={[styles.explanationTitle, { color }]}>{info.title}</Text>
      <Text style={styles.explanationDescription}>{info.description}</Text>
      <View style={styles.recommendationContainer}>
        <Ionicons name="bulb" size={20} color={Colors.secondary[500]} />
        <Text style={styles.recommendationText}>{info.recommendation}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.sm,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  scoreCircle: {
    alignItems: "center",
  },
  scoreValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.bold,
  },
  scoreDivider: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
  explanationContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderLeftWidth: 4,
  },
  explanationTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  explanationDescription: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  recommendationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.secondary[50],
    padding: Spacing.md,
    borderRadius: 12,
  },
  recommendationText: {
    flex: 1,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.secondary[700],
    marginLeft: Spacing.sm,
    lineHeight: 20,
  },
});
