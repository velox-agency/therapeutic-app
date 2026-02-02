import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";

export default function SessionsScreen() {
  const sessions: any[] = []; // TODO: Fetch from Supabase

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Sessions</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={Colors.secondary[500]} />
          </TouchableOpacity>
        </View>

        {/* Calendar View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity style={[styles.toggleButton, styles.toggleActive]}>
            <Text style={[styles.toggleText, styles.toggleTextActive]}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleButton}>
            <Text style={styles.toggleText}>Calendar</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={Colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No sessions today</Text>
            <Text style={styles.emptySubtitle}>Your schedule is clear</Text>
          </Card>
        </View>

        {/* Upcoming Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons
              name="time-outline"
              size={48}
              color={Colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No upcoming sessions</Text>
            <Text style={styles.emptySubtitle}>
              Schedule sessions with your patients
            </Text>
            <Button
              title="Schedule Session"
              variant="secondary"
              size="small"
              onPress={() => {}}
              style={styles.scheduleButton}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: Colors.surface,
  },
  toggleText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  toggleTextActive: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  scheduleButton: {
    marginTop: Spacing.md,
  },
});
