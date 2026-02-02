import {
  Animation,
  Colors,
  ComponentStyle,
  Spacing,
  Typography,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: string; // Icon name for Ionicons
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  icon,
  style,
  textStyle,
  hapticFeedback = true,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, Animation.spring.snappy);
    opacity.value = withTiming(0.9, { duration: Animation.duration.fast });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.bounce);
    opacity.value = withTiming(1, { duration: Animation.duration.fast });
  };

  const handlePress = async () => {
    if (disabled || loading) return;

    if (hapticFeedback) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getBackgroundColor = (): string => {
    if (disabled) return Colors.text.disabled;

    switch (variant) {
      case "primary":
        return Colors.primary[500];
      case "secondary":
        return Colors.secondary[500];
      case "success":
        return Colors.success[500];
      case "danger":
        return Colors.error[500];
      case "outline":
      case "ghost":
        return "transparent";
      default:
        return Colors.primary[500];
    }
  };

  const getTextColor = (): string => {
    if (disabled) return Colors.text.inverse;

    switch (variant) {
      case "outline":
        return Colors.primary[500];
      case "ghost":
        return Colors.text.primary;
      default:
        return Colors.text.inverse;
    }
  };

  const getBorderStyle = (): ViewStyle => {
    if (variant === "outline") {
      return {
        borderWidth: 2,
        borderColor: disabled ? Colors.text.disabled : Colors.primary[500],
      };
    }
    return {};
  };

  const getSizeStyle = (): ViewStyle => {
    const height = ComponentStyle.buttonHeight[size];
    const paddingHorizontal =
      size === "small"
        ? Spacing.md
        : size === "large"
          ? Spacing.xl
          : Spacing.lg;

    return {
      height,
      paddingHorizontal,
    };
  };

  const getTextSize = (): TextStyle => {
    switch (size) {
      case "small":
        return { fontSize: Typography.fontSize.small };
      case "large":
        return { fontSize: Typography.fontSize.h4 };
      default:
        return { fontSize: Typography.fontSize.body };
    }
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[
        styles.button,
        getSizeStyle(),
        getBorderStyle(),
        { backgroundColor: getBackgroundColor() },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          {icon && !leftIcon && (
            <Ionicons
              name={icon as any}
              size={size === "small" ? 16 : size === "large" ? 24 : 20}
              color={getTextColor()}
              style={{ marginRight: Spacing.xs }}
            />
          )}
          <Text
            style={[
              styles.text,
              getTextSize(),
              { color: getTextColor() },
              leftIcon ? { marginLeft: Spacing.sm } : undefined,
              rightIcon ? { marginRight: Spacing.sm } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: ComponentStyle.borderRadius.lg,
    ...ComponentStyle.shadow.small,
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
  },
});
