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
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useChildren } from "@/hooks/useChildren";

export default function ScreeningIndexScreen() {
  const { children } = useChildren();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Screenings</Text>
        </View>

        {/* Info Card */}
        <Card variant="filled" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons
              name="information-circle"
              size={24}
              color={Colors.primary[500]}
            />
            <Text style={styles.infoTitle}>M-CHAT-R Screening</Text>
          </View>
          <Text style={styles.infoText}>
            The Modified Checklist for Autism in Toddlers, Revised (M-CHAT-R) is
            a scientifically validated screening tool for children between 16-30
            months old.
          </Text>
        </Card>

        {/* Start Screening */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start New Screening</Text>

          {children.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons
                name="people-outline"
                size={48}
                color={Colors.text.tertiary}
              />
              <Text style={styles.emptyTitle}>No children added</Text>
              <Text style={styles.emptySubtitle}>
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
                    <View style={styles.childIcon}>
                      <Ionicons
                        name="person"
                        size={24}
                        color={Colors.primary[500]}
                      />
                    </View>
                    <View style={styles.childDetails}>
                      <Text style={styles.childName}>{child.first_name}</Text>
                      <Text style={styles.childHint}>
                        Tap to start screening
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color={Colors.text.tertiary}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Previous Screenings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Previous Screenings</Text>
          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={Colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No screenings yet</Text>
            <Text style={styles.emptySubtitle}>
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
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingVertical: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  infoCard: {
    backgroundColor: Colors.primary[50],
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
    color: Colors.primary[700],
    marginLeft: Spacing.sm,
  },
  infoText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.small,
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
    backgroundColor: Colors.primary[50],
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
    color: Colors.text.primary,
  },
  childHint: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
});
