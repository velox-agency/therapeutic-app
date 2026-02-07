import { Animation, Colors, Spacing, Typography } from "@/constants/theme";
import React, { useEffect } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

type ProgressBarVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "gradient";
type ProgressBarSize = "small" | "medium" | "large";

interface ProgressBarProps {
  progress: number; // 0-100
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
  style?: ViewStyle;
  color?: string; // Custom color override
}

export function ProgressBar({
  progress,
  variant = "default",
  size = "medium",
  showLabel = false,
  showPercentage = false,
  label,
  animated = true,
  style,
  color,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const progressValue = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressValue.value = withSpring(
        clampedProgress,
        Animation.spring.smooth,
      );
    } else {
      progressValue.value = clampedProgress;
    }
  }, [clampedProgress, animated]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  const getBarColor = (): string => {
    // If custom color is provided, use it
    if (color) return color;

    switch (variant) {
      case "success":
        return Colors.success[500];
      case "warning":
        return Colors.secondary[500];
      case "danger":
        return Colors.error[500];
      case "gradient":
        // For gradient, we'll interpolate based on progress
        if (clampedProgress < 33) return Colors.error[500];
        if (clampedProgress < 66) return Colors.secondary[500];
        return Colors.success[500];
      default:
        return Colors.primary[500];
    }
  };

  const getHeight = (): number => {
    switch (size) {
      case "small":
        return 6;
      case "large":
        return 16;
      default:
        return 10;
    }
  };

  const height = getHeight();
  const borderRadius = height / 2;

  return (
    <View style={[styles.container, style]}>
      {(showLabel || showPercentage) && (
        <View style={styles.labelContainer}>
          {showLabel && label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      )}

      <View style={[styles.track, { height, borderRadius }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              borderRadius,
              backgroundColor: getBarColor(),
            },
            animatedProgressStyle,
          ]}
        />
      </View>
    </View>
  );
}

// Star Progress Component for gamification
interface StarProgressProps {
  current: number;
  total: number;
  style?: ViewStyle;
}

export function StarProgress({ current, total, style }: StarProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={[styles.starContainer, style]}>
      <View style={styles.starInfo}>
        <Text style={styles.starIcon}>⭐</Text>
        <Text style={styles.starText}>
          {current} / {total}
        </Text>
      </View>
      <ProgressBar
        progress={progress}
        variant="success"
        size="small"
        style={styles.starBar}
      />
    </View>
  );
}

// Goal Progress Ring Component
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = Colors.primary[500],
  backgroundColor = Colors.border,
  showPercentage = true,
  children,
}: ProgressRingProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withSpring(clampedProgress, Animation.spring.smooth);
  }, [clampedProgress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      {/* Background circle */}
      <View
        style={{
          position: "absolute",
          width: size - strokeWidth,
          height: size - strokeWidth,
          borderRadius: (size - strokeWidth) / 2,
          borderWidth: strokeWidth,
          borderColor: backgroundColor,
        }}
      />
      {/* Progress circle - simplified without SVG */}
      <View
        style={{
          position: "absolute",
          width: size - strokeWidth,
          height: size - strokeWidth,
          borderRadius: (size - strokeWidth) / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: clampedProgress >= 25 ? color : "transparent",
          borderRightColor: clampedProgress >= 50 ? color : "transparent",
          borderBottomColor: clampedProgress >= 75 ? color : "transparent",
          borderLeftColor: clampedProgress >= 100 ? color : "transparent",
          transform: [{ rotate: "-90deg" }],
        }}
      />
      <View style={styles.ringContent}>
        {showPercentage && !children ? (
          <Text style={styles.ringPercentage}>
            {Math.round(clampedProgress)}%
          </Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  label: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  percentage: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  track: {
    backgroundColor: Colors.divider,
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  // Star Progress styles
  starContainer: {
    width: "100%",
  },
  starInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  starIcon: {
    fontSize: Typography.fontSize.h4,
    marginRight: Spacing.xs,
  },
  starText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.star,
  },
  starBar: {
    flex: 1,
  },
  // Progress Ring styles
  ringContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ringPercentage: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
});
