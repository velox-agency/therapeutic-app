import { Animation, Colors, ComponentStyle, Spacing } from "@/constants/theme";
import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CardVariant = "elevated" | "outlined" | "filled";
type CardSize = "small" | "medium" | "large";

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function Card({
  children,
  variant = "elevated",
  size = "medium",
  onPress,
  disabled = false,
  style,
  contentStyle,
}: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(0.98, Animation.spring.snappy);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.bounce);
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: Colors.surface,
          ...ComponentStyle.shadow.medium,
        };
      case "outlined":
        return {
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.border,
        };
      case "filled":
        return {
          backgroundColor: Colors.surfaceVariant,
        };
      default:
        return {};
    }
  };

  const getPaddingStyle = (): ViewStyle => {
    switch (size) {
      case "small":
        return { padding: Spacing.sm };
      case "large":
        return { padding: Spacing.lg };
      default:
        return { padding: Spacing.md };
    }
  };

  const cardContent = (
    <View style={[styles.content, getPaddingStyle(), contentStyle]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.card,
          getVariantStyle(),
          disabled && styles.disabled,
          animatedStyle,
          style,
        ]}
      >
        {cardContent}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View
      style={[styles.card, getVariantStyle(), animatedStyle, style]}
    >
      {cardContent}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: ComponentStyle.borderRadius.lg,
    overflow: "hidden",
  },
  content: {
    flex: 1,
  },
  disabled: {
    opacity: 0.6,
  },
});
