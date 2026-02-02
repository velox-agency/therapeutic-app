import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { Colors, Spacing, Typography } from "@/constants/theme";

interface StarAnimationProps {
  count: number;
  onComplete?: () => void;
  delay?: number;
}

export function StarAnimation({
  count,
  onComplete,
  delay = 0,
}: StarAnimationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(-30);

  useEffect(() => {
    const triggerHaptic = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }, () => {
          runOnJS(triggerHaptic)();
        }),
        withSpring(1, { damping: 10, stiffness: 150 }),
      ),
    );

    opacity.value = withDelay(delay, withSpring(1, { damping: 15 }));
    rotate.value = withDelay(
      delay,
      withSpring(0, { damping: 12, stiffness: 100 }),
    );

    if (onComplete) {
      const timeout = setTimeout(onComplete, delay + 800);
      return () => clearTimeout(timeout);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.starContainer}>
        <Ionicons name="star" size={48} color={Colors.star} />
      </View>
      <Text style={styles.countText}>+{count}</Text>
    </Animated.View>
  );
}

interface StarBurstProps {
  totalStars: number;
  onComplete?: () => void;
}

export function StarBurst({ totalStars, onComplete }: StarBurstProps) {
  const stars = Array.from({ length: Math.min(totalStars, 5) });

  return (
    <View style={styles.burstContainer}>
      {stars.map((_, index) => (
        <StarBurstItem key={index} index={index} total={stars.length} />
      ))}
      <View style={styles.burstCenter}>
        <Ionicons name="star" size={64} color={Colors.star} />
        <Text style={styles.burstCount}>+{totalStars}</Text>
      </View>
    </View>
  );
}

interface StarBurstItemProps {
  index: number;
  total: number;
}

function StarBurstItem({ index, total }: StarBurstItemProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    const radius = 80;

    scale.value = withDelay(
      index * 50,
      withSequence(
        withSpring(1, { damping: 8 }),
        withDelay(500, withSpring(0, { damping: 15 })),
      ),
    );

    opacity.value = withDelay(
      index * 50,
      withSequence(
        withSpring(1, { damping: 15 }),
        withDelay(500, withSpring(0, { damping: 15 })),
      ),
    );

    translateX.value = withDelay(
      index * 50,
      withSpring(Math.cos(angle) * radius, { damping: 10 }),
    );

    translateY.value = withDelay(
      index * 50,
      withSpring(Math.sin(angle) * radius, { damping: 10 }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.burstItem, animatedStyle]}>
      <Ionicons name="star" size={24} color={Colors.star} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  starContainer: {
    shadowColor: Colors.star,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  countText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.star,
    marginTop: Spacing.xs,
  },
  burstContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  burstItem: {
    position: "absolute",
  },
  burstCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  burstCount: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.star,
    marginTop: Spacing.xs,
  },
});
