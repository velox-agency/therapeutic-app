import {
  Animation,
  Colors,
  ComponentStyle,
  Spacing,
  Typography,
} from "@/constants/theme";
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
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = error
      ? Colors.error[500]
      : interpolateColor(
          focusProgress.value,
          [0, 1],
          [Colors.border, Colors.primary[500]],
        );

    return {
      borderColor,
      borderWidth: focusProgress.value > 0.5 ? 2 : 1,
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
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
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
            {renderIcon(leftIcon, Colors.text.secondary)}
          </View>
        )}

        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            getTextSize(),
            leftIcon ? { paddingLeft: 0 } : undefined,
            rightIcon ? { paddingRight: 0 } : undefined,
            inputStyle,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          placeholderTextColor={Colors.text.tertiary}
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
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || hint}
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
    marginBottom: Spacing.xs,
  },
  label: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  required: {
    color: Colors.error[500],
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: ComponentStyle.borderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.secondary,
    color: Colors.text.primary,
    paddingVertical: Spacing.sm,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  disabled: {
    backgroundColor: Colors.surfaceVariant,
    opacity: 0.7,
  },
  helperText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  errorText: {
    color: Colors.error[500],
  },
});
