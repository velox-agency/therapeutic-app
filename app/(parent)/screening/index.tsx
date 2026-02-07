import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useChildren } from "@/hooks/useChildren";

export default function ScreeningIndexScreen() {
  const { children } = useChildren();
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Screenings</Text>
        </View>

        {/* Info Card */}
        <Card
          variant="filled"
          style={{ ...styles.infoCard, backgroundColor: colors.primaryLight }}
        >
          <View style={styles.infoHeader}>
            <Ionicons
              name="information-circle"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.infoTitle, { color: colors.primary }]}>
              M-CHAT-R Screening
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            The Modified Checklist for Autism in Toddlers, Revised (M-CHAT-R) is
            a scientifically validated screening tool for children between 16-30
            months old.
          </Text>
        </Card>

        {/* Start Screening */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Start New Screening
          </Text>

          {children.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons
                name="people-outline"
                size={48}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No children added
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                Add a child first to begin a screening
              </Text>
              <Button
                title="Add Child"
                onPress={() => router.push("/(parent)/children/add")}
                variant="primary"
                size="small"
                style={styles.addButton}
              />
            </Card>
          ) : (
            children.map((child) => (
              <TouchableOpacity
                key={child.id}
                onPress={() =>
                  router.push({
                    pathname: "/(parent)/screening/start",
                    params: { childId: child.id, childName: child.first_name },
                  })
                }
              >
                <Card variant="elevated" style={styles.childCard}>
                  <View style={styles.childInfo}>
                    <View
                      style={[
                        styles.childIcon,
                        { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Ionicons
                        name="person"
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.childDetails}>
                      <Text style={[styles.childName, { color: colors.text }]}>
                        {child.first_name}
                      </Text>
                      <Text
                        style={[
                          styles.childHint,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Tap to start screening
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color={colors.textTertiary}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Previous Screenings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Previous Screenings
          </Text>
          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No screenings yet
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              Complete a screening to see results here
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.tabBarClearance,
  },
  header: {
    paddingVertical: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
  },
  infoCard: {
    marginBottom: Spacing.lg,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
  },
  infoText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    lineHeight: Typography.lineHeight.small,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
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
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  addButton: {
    marginTop: Spacing.md,
  },
  childCard: {
    marginBottom: Spacing.sm,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  childIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  childDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  childName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
  },
  childHint: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
  },
});
