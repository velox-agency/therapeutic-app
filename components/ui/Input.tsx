import {
  Animation,
  ComponentStyle,
  Spacing,
  Typography,
} from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type InputSize = "small" | "medium" | "large";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  hint?: string;
  size?: InputSize;
  leftIcon?: React.ReactNode | string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  style?: ViewStyle; // Allow style prop on container
  required?: boolean;
}

// Helper function to render icons
const renderIcon = (
  icon: React.ReactNode | string,
  color: string,
  size: number = 20,
) => {
  if (typeof icon === "string") {
    return <Ionicons name={icon as any} size={size} color={color} />;
  }
  return icon;
};

const AnimatedView = Animated.createAnimatedComponent(View);

export function Input({
  label,
  error,
  hint,
  size = "medium",
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  containerStyle,
  inputStyle,
  style,
  required = false,
  ...textInputProps
}: InputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = error
      ? colors.error
      : interpolateColor(
          focusProgress.value,
          [0, 1],
          ["transparent", colors.primary],
        );

    const backgroundColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      [colors.surfaceVariant, colors.surface],
    );

    return {
      borderColor,
      backgroundColor,
      borderWidth: 1.5,
    };
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: Animation.duration.fast });
    textInputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: Animation.duration.fast });
    textInputProps.onBlur?.(e);
  };

  const getHeightStyle = (): ViewStyle => {
    const height = ComponentStyle.inputHeight[size];
    return { minHeight: height };
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
    <View style={[styles.container, containerStyle, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            {label}
            {required && (
              <Text style={[styles.required, { color: colors.error }]}> *</Text>
            )}
          </Text>
        </View>
      )}

      <AnimatedView
        style={[
          styles.inputContainer,
          getHeightStyle(),
          animatedBorderStyle,
          disabled && styles.disabled,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIcon}>
            {renderIcon(
              leftIcon,
              isFocused ? colors.primary : colors.textTertiary,
            )}
          </View>
        )}

        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            getTextSize(),
            { color: colors.text },
            leftIcon ? { paddingLeft: 0 } : undefined,
            rightIcon ? { paddingRight: 0 } : undefined,
            inputStyle,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          placeholderTextColor={colors.textTertiary}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </AnimatedView>

      {(error || hint) && (
        <Text
          style={[
            styles.helperText,
            { color: colors.textSecondary },
            error && { color: colors.error },
          ]}
        >
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelContainer: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  label: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.medium,
  },
  required: {},
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: ComponentStyle.borderRadius.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.secondary,
    paddingVertical: Spacing.md,
  },
  leftIcon: {
    marginRight: Spacing.md,
  },
  rightIcon: {
    marginLeft: Spacing.md,
    padding: Spacing.xs,
  },
  disabled: {
    opacity: 0.6,
  },
  helperText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.tiny,
    marginTop: Spacing.sm,
    marginLeft: Spacing.xs,
  },
});
