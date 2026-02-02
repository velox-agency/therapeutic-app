import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui";
import { Animation, Colors, Spacing, Typography } from "@/constants/theme";

interface RoleCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  delay: number;
}

function RoleCard({
  title,
  description,
  icon,
  color,
  onPress,
  delay,
}: RoleCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, Animation.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.bounce);
  };

  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(500)}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Card variant="elevated" style={styles.roleCard}>
          <View
            style={[styles.iconContainer, { backgroundColor: color + "20" }]}
          >
            <Ionicons name={icon} size={48} color={color} />
          </View>
          <Text style={styles.roleTitle}>{title}</Text>
          <Text style={styles.roleDescription}>{description}</Text>
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward" size={24} color={color} />
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RoleSelectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons
              name="heart-circle"
              size={80}
              color={Colors.primary[500]}
            />
          </View>
          <Text style={styles.title}>Therapeutic</Text>
          <Text style={styles.subtitle}>
            Connecting families with speech therapists for better outcomes
          </Text>
        </View>

        {/* Role Selection */}
        <View style={styles.rolesContainer}>
          <Text style={styles.selectText}>I am a...</Text>

          <RoleCard
            title="Parent"
            description="Track your child's progress, complete screenings, and communicate with therapists"
            icon="people"
            color={Colors.primary[500]}
            onPress={() =>
              router.push({
                pathname: "/(auth)/signup",
                params: { role: "parent" },
              })
            }
            delay={200}
          />

          <RoleCard
            title="Speech Therapist"
            description="Manage patients, set goals, track progress, and provide expert guidance"
            icon="medical"
            color={Colors.secondary[500]}
            onPress={() =>
              router.push({
                pathname: "/(auth)/signup",
                params: { role: "therapist" },
              })
            }
            delay={400}
          />
        </View>

        {/* Login Link */}
        <Animated.View
          entering={FadeIn.delay(600).duration(500)}
          style={styles.loginContainer}
        >
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
    lineHeight: Typography.lineHeight.body,
  },
  rolesContainer: {
    flex: 1,
  },
  selectText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  roleCard: {
    marginBottom: Spacing.md,
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  roleTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  roleDescription: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  arrowContainer: {
    position: "absolute",
    right: Spacing.md,
    top: "50%",
    marginTop: -12,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Spacing.lg,
  },
  loginText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
  loginLink: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
  },
});
