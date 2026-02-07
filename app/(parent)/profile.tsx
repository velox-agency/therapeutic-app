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

import { Avatar, Button, Card } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";

export default function ParentProfileScreen() {
  const { profile, signOut, loading } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("navigation.profile")}
          </Text>
        </View>

        {/* Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar
              name={profile?.full_name}
              source={profile?.avatar_url}
              size="xl"
            />
            <Text style={[styles.profileName, { color: colors.text }]}>
              {profile?.full_name}
            </Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Text style={[styles.roleText, { color: colors.primary }]}>
                {t("common.parent")}
              </Text>
            </View>
          </View>
        </Card>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("profile.settings")}
          </Text>

          <Card variant="elevated">
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/shared/edit-profile" as any)}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("profile.editProfile")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View
              style={[styles.menuDivider, { backgroundColor: colors.border }]}
            />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/shared/settings" as any)}
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("profile.appSettings")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View
              style={[styles.menuDivider, { backgroundColor: colors.border }]}
            />

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("profile.notifications")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View
              style={[styles.menuDivider, { backgroundColor: colors.border }]}
            />

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons
                name="shield-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("profile.privacy")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("profile.learn")}
          </Text>

          <Card variant="elevated">
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/shared/resources" as any)}
            >
              <Ionicons
                name="library-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("profile.resources")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("profile.support")}
          </Text>

          <Card variant="elevated">
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("profile.helpCenter")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View
              style={[styles.menuDivider, { backgroundColor: colors.border }]}
            />

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("profile.termsOfService")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Sign Out */}
        <View
          style={[styles.signOutSection, { borderTopColor: colors.border }]}
        >
          <Button
            title={t("auth.signOut")}
            onPress={handleSignOut}
            variant="danger"
            fullWidth
            loading={loading}
            icon="log-out-outline"
          />
        </View>

        <Text style={[styles.version, { color: colors.textSecondary }]}>
          Version 1.0.0
        </Text>
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
    paddingBottom: 120,
  },
  header: {
    paddingVertical: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  profileCard: {
    marginBottom: Spacing.xl,
    borderRadius: 24,
    padding: Spacing.lg,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  profileName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  roleBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 9999,
  },
  roleText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  menuText: {
    flex: 1,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
    letterSpacing: 0.1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 44,
  },
  signOutSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  version: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.tertiary,
    textAlign: "center",
    marginTop: Spacing.xl,
    letterSpacing: 0.2,
  },
});
