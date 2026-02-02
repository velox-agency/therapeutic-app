import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Colors, Spacing, Typography } from "@/constants/theme";

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

const TYPE_CONFIG: Record<
  ResourceType,
  { icon: string; color: string; bgColor: string }
> = {
  article: {
    icon: "📝",
    color: Colors.primary[500],
    bgColor: Colors.primary[50],
  },
  video: {
    icon: "🎥",
    color: Colors.secondary[500],
    bgColor: Colors.secondary[50],
  },
  exercise: {
    icon: "🎯",
    color: Colors.success[500],
    bgColor: Colors.success[50],
  },
};

export function ResourceCard({
  resource,
  onPress,
  delay = 0,
}: ResourceCardProps) {
  const config = TYPE_CONFIG[resource.type] || TYPE_CONFIG.article;

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()}>
      <TouchableOpacity
        onPress={onPress}
        style={styles.container}
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
          <Text style={styles.title} numberOfLines={2}>
            {resource.title}
          </Text>
          {resource.content && (
            <Text style={styles.preview} numberOfLines={2}>
              {resource.content}
            </Text>
          )}
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.text.tertiary}
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
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  typeBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  typeIcon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  category: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  preview: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginTop: 2,
  },
  arrowContainer: {
    padding: Spacing.xs,
  },
});

export default ResourceCard;
