import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { BadgeDefinition } from "@/constants/badges";
import { Colors, Spacing, Typography } from "@/constants/theme";

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export interface DisplayBadge extends BadgeDefinition {
  id: string;
  tier: BadgeTier;
  icon: string;
}

interface BadgeCardProps {
  badge: DisplayBadge;
  unlocked: boolean;
  unlockedAt?: string;
  onPress?: () => void;
}

export function BadgeCard({
  badge,
  unlocked,
  unlockedAt,
  onPress,
}: BadgeCardProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tierColors = {
    bronze: "#CD7F32",
    silver: "#C0C0C0",
    gold: "#FFD700",
    platinum: "#E5E4E2",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.container, animatedStyle, !unlocked && styles.locked]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: unlocked
                ? Colors.primary[50]
                : Colors.surfaceVariant,
            },
          ]}
        >
          <Ionicons
            name={badge.icon as any}
            size={32}
            color={unlocked ? Colors.primary[500] : Colors.text.tertiary}
          />
          {!unlocked && (
            <View style={styles.lockOverlay}>
              <Ionicons
                name="lock-closed"
                size={16}
                color={Colors.text.tertiary}
              />
            </View>
          )}
        </View>

        <Text
          style={[styles.name, !unlocked && styles.lockedText]}
          numberOfLines={1}
        >
          {badge.name}
        </Text>

        <Text
          style={[styles.description, !unlocked && styles.lockedText]}
          numberOfLines={2}
        >
          {badge.description}
        </Text>

        {unlocked && (
          <View
            style={[
              styles.tierBadge,
              { backgroundColor: tierColors[badge.tier] + "20" },
            ]}
          >
            <Ionicons name="medal" size={12} color={tierColors[badge.tier]} />
            <Text style={[styles.tierText, { color: tierColors[badge.tier] }]}>
              {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}
            </Text>
          </View>
        )}

        {unlocked && unlockedAt && (
          <Text style={styles.unlockedText}>
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

interface BadgeGridProps {
  badges: DisplayBadge[];
  unlockedBadges: Array<{ badge_id: string; unlocked_at: string }>;
  onBadgePress?: (badge: DisplayBadge) => void;
}

export function BadgeGrid({
  badges,
  unlockedBadges,
  onBadgePress,
}: BadgeGridProps) {
  const isUnlocked = (badgeId: string) =>
    unlockedBadges.some((b) => b.badge_id === badgeId);

  const getUnlockedAt = (badgeId: string) =>
    unlockedBadges.find((b) => b.badge_id === badgeId)?.unlocked_at;

  return (
    <View style={styles.grid}>
      {badges.map((badge) => (
        <View key={badge.id} style={styles.gridItem}>
          <BadgeCard
            badge={badge}
            unlocked={isUnlocked(badge.id)}
            unlockedAt={getUnlockedAt(badge.id)}
            onPress={() => onBadgePress?.(badge)}
          />
        </View>
      ))}
    </View>
  );
}

interface BadgeUnlockModalProps {
  badge: DisplayBadge;
  visible: boolean;
  onClose: () => void;
}

export function BadgeUnlockModal({
  badge,
  visible,
  onClose,
}: BadgeUnlockModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.modal}>
        <View style={styles.modalIconContainer}>
          <Ionicons
            name={badge.icon as any}
            size={64}
            color={Colors.primary[500]}
          />
        </View>
        <Text style={styles.modalTitle}>Badge Unlocked!</Text>
        <Text style={styles.modalName}>{badge.name}</Text>
        <Text style={styles.modalDescription}>{badge.description}</Text>
        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>Awesome!</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  locked: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  lockOverlay: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  description: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 16,
  },
  lockedText: {
    color: Colors.text.tertiary,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: Spacing.sm,
  },
  tierText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: 4,
  },
  unlockedText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  gridItem: {
    width: "47%",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  modalIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
    marginBottom: Spacing.sm,
  },
  modalName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  modalDescription: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  modalButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 16,
  },
  modalButtonText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.surface,
  },
});
