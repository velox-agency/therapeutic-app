import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Avatar } from "@/components/ui";
import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";
import type { Child } from "@/types/database.types";

interface ChildCardProps {
  child: Child;
  delay?: number;
  onPress?: () => void;
}

export function ChildCard({ child, delay = 0, onPress }: ChildCardProps) {
  const age = calculateAge(child.birth_date);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(parent)/children/${child.id}`);
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()}>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.container}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <Avatar
          name={child.first_name}
          seed={child.avatar_seed || undefined}
          size="lg"
        />

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{child.first_name}</Text>
          <Text style={styles.age}>
            {age} {age === 1 ? "year" : "years"} old
          </Text>
        </View>

        {/* Stars */}
        <View style={styles.starsContainer}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.starsCount}>{child.total_stars || 0}</Text>
        </View>

        {/* Chevron */}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.text.tertiary}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 20,
    marginBottom: Spacing.md,
    ...ComponentStyle.shadow.small,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  name: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  age: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 14,
    marginRight: Spacing.sm,
  },
  starIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  starsCount: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.warning[600],
  },
});
