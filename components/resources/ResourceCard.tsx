import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ComponentStyle, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

type ResourceType = "article" | "video" | "exercise";

interface Resource {
  id: string;
  title: string;
  content?: string;
  type: ResourceType;
  category: string;
  thumbnail_url?: string;
}

interface ResourceCardProps {
  resource: Resource;
  onPress: () => void;
  delay?: number;
}

export function ResourceCard({
  resource,
  onPress,
  delay = 0,
}: ResourceCardProps) {
  const { colors } = useTheme();
  const TYPE_CONFIG_DYNAMIC: Record<
    ResourceType,
    { icon: string; color: string; bgColor: string }
  > = {
    article: {
      icon: "📝",
      color: colors.primary,
      bgColor: colors.primaryLight,
    },
    video: {
      icon: "🎥",
      color: colors.secondary,
      bgColor: colors.secondaryLight,
    },
    exercise: {
      icon: "🎯",
      color: colors.success,
      bgColor: colors.successLight,
    },
  };
  const config =
    TYPE_CONFIG_DYNAMIC[resource.type] || TYPE_CONFIG_DYNAMIC.article;

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.container, { backgroundColor: colors.surface }]}
        activeOpacity={0.7}
      >
        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: config.bgColor }]}>
          <Text style={styles.typeIcon}>{config.icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.category, { color: config.color }]}>
            {resource.category}
          </Text>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {resource.title}
          </Text>
          {resource.content && (
            <Text
              style={[styles.preview, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {resource.content}
            </Text>
          )}
        </View>

        {/* Arrow */}
        <View
          style={[
            styles.arrowContainer,
            { backgroundColor: colors.surfaceVariant },
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: 20,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    ...ComponentStyle.shadow.small,
  },
  typeBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  typeIcon: {
    fontSize: 30,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  category: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  preview: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    lineHeight: 20,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ResourceCard;
