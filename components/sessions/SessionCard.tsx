import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

import { Colors, Spacing, Typography } from "@/constants/theme";
import type { Session } from "@/types/database.types";

interface SessionCardProps {
  session: Session;
  childName?: string;
  therapistName?: string;
  onPress?: () => void;
  delay?: number;
}

const STATUS_CONFIG = {
  scheduled: {
    color: Colors.primary[500],
    label: "Scheduled",
    icon: "calendar" as const,
    bgColor: Colors.primary[50],
  },
  completed: {
    color: Colors.success[500],
    label: "Completed",
    icon: "checkmark-circle" as const,
    bgColor: Colors.success[50],
  },
  cancelled: {
    color: Colors.text.disabled,
    label: "Cancelled",
    icon: "close-circle" as const,
    bgColor: Colors.surfaceVariant,
  },
};

export function SessionCard({
  session,
  childName,
  therapistName,
  onPress,
  delay = 0,
}: SessionCardProps) {
  const date = new Date(session.scheduled_at);
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  const config = STATUS_CONFIG[session.status];

  return (
    <Animated.View entering={FadeInRight.delay(delay).springify()}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.container,
          session.status === "cancelled" && styles.containerCancelled,
        ]}
        activeOpacity={0.7}
      >
        {/* Date/Time Column */}
        <View style={styles.dateColumn}>
          <View
            style={[styles.statusBadge, { backgroundColor: config.bgColor }]}
          >
            <Ionicons name={config.icon} size={24} color={config.color} />
          </View>
          <Text style={styles.time}>{timeStr}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        {/* Info Column */}
        <View style={styles.infoColumn}>
          {childName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoEmoji}>👶</Text>
              <Text style={styles.name}>{childName}</Text>
            </View>
          )}
          {therapistName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoEmoji}>👨‍⚕️</Text>
              <Text style={styles.name}>{therapistName}</Text>
            </View>
          )}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={Colors.text.tertiary}
              />
              <Text style={styles.detailText}>
                {session.duration_minutes} min
              </Text>
            </View>
            {session.location && (
              <View style={styles.detailItem}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={Colors.text.tertiary}
                />
                <Text style={styles.detailText}>{session.location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Column */}
        <View style={styles.statusColumn}>
          <View
            style={[styles.statusPill, { backgroundColor: config.bgColor }]}
          >
            <Text style={[styles.statusLabel, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
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
  containerCancelled: {
    opacity: 0.6,
  },
  dateColumn: {
    alignItems: "center",
    gap: Spacing.xs,
    minWidth: 70,
  },
  statusBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  time: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  date: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
  },
  infoColumn: {
    flex: 1,
    gap: Spacing.xs,
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  infoEmoji: {
    fontSize: 14,
  },
  name: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  detailsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.tertiary,
  },
  statusColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  statusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusLabel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "uppercase",
  },
});

export default SessionCard;
