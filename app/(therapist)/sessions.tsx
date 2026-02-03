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
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function SessionsScreen() {
  const sessions: any[] = []; // TODO: Fetch from Supabase
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("navigation.sessions")}
          </Text>
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: colors.secondary + "20" },
            ]}
          >
            <Ionicons name="add" size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Calendar View Toggle */}
        <View style={[styles.viewToggle, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.toggleActive,
              { backgroundColor: colors.background },
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                styles.toggleTextActive,
                { color: colors.text },
              ]}
            >
              {t("common.list")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleButton}>
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
              {t("common.calendar")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Sessions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("sessions.today")}
          </Text>
          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t("sessions.noSessionsToday")}
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {t("sessions.scheduleIsClear")}
            </Text>
          </Card>
        </View>

        {/* Upcoming Sessions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("sessions.upcoming")}
          </Text>
          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons
              name="time-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t("sessions.noUpcomingSessions")}
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {t("sessions.scheduleWithPatients")}
            </Text>
            <Button
              title={t("sessions.scheduleSession")}
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
