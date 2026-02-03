import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { supabase } from "@/lib/supabase";

interface TherapistProfile {
  specialization: string | null;
  license_number: string | null;
  clinic_address: string | null;
  bio: string | null;
  years_experience: number | null;
  is_verified: boolean;
}

export default function TherapistProfileScreen() {
  const { profile, user, signOut, loading } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [therapistProfile, setTherapistProfile] =
    useState<TherapistProfile | null>(null);

  // Load therapist profile data
  const loadTherapistProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("therapist_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading therapist profile:", error);
      }

      if (data) {
        setTherapistProfile(data);
      }
    } catch (error) {
      console.error("Error loading therapist profile:", error);
    }
  }, [user?.id]);

  // Reload when screen is focused (to get updates after editing)
  useFocusEffect(
    useCallback(() => {
      loadTherapistProfile();
    }, [loadTherapistProfile]),
  );

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
                { backgroundColor: colors.secondary + "20" },
              ]}
            >
              <Ionicons name="medical" size={14} color={colors.secondary} />
              <Text style={[styles.roleText, { color: colors.secondary }]}>
                {t("common.therapist")}
              </Text>
            </View>
            <View style={styles.verificationBadge}>
              <Ionicons
                name={
                  therapistProfile?.is_verified
                    ? "shield-checkmark"
                    : "shield-outline"
                }
                size={14}
                color={
                  therapistProfile?.is_verified
                    ? Colors.success[500]
                    : Colors.warning[500]
                }
              />
              <Text
                style={[
                  styles.verificationText,
                  { color: colors.textSecondary },
                ]}
              >
                {therapistProfile?.is_verified
                  ? t("profile.verified") || "Verified"
                  : t("profile.pendingVerification")}
              </Text>
            </View>
          </View>
        </Card>

        {/* Professional Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("profile.professionalInfo")}
          </Text>

          <Card variant="elevated">
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/shared/edit-profile" as any)}
            >
              <Ionicons
                name="school-outline"
                size={24}
                color={colors.textSecondary}
              />
              <View style={styles.menuContent}>
                <Text
                  style={[styles.menuLabel, { color: colors.textSecondary }]}
                >
                  {t("profile.specialization")}
                </Text>
                <Text style={[styles.menuValue, { color: colors.text }]}>
                  {therapistProfile?.specialization || t("profile.notSet")}
                </Text>
              </View>
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
              onPress={() => router.push("/shared/edit-profile" as any)}
            >
              <Ionicons
                name="document-text-outline"
                size={24}
                color={colors.textSecondary}
              />
              <View style={styles.menuContent}>
                <Text
                  style={[styles.menuLabel, { color: colors.textSecondary }]}
                >
                  {t("profile.licenseNumber")}
                </Text>
                <Text style={[styles.menuValue, { color: colors.text }]}>
                  {therapistProfile?.license_number || t("profile.notSet")}
                </Text>
              </View>
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
              onPress={() => router.push("/shared/edit-profile" as any)}
            >
              <Ionicons
                name="location-outline"
                size={24}
                color={colors.textSecondary}
              />
              <View style={styles.menuContent}>
                <Text
                  style={[styles.menuLabel, { color: colors.textSecondary }]}
                >
                  {t("profile.clinicAddress")}
                </Text>
                <Text
                  style={[styles.menuValue, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {therapistProfile?.clinic_address || t("profile.notSet")}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {therapistProfile?.bio && (
              <>
                <View
                  style={[
                    styles.menuDivider,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View style={styles.bioSection}>
                  <View style={styles.bioHeader}>
                    <Ionicons
                      name="information-circle-outline"
                      size={24}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.menuLabel,
                        { color: colors.textSecondary, marginLeft: Spacing.md },
                      ]}
                    >
                      {t("profile.bio") || "Bio"}
                    </Text>
                  </View>
                  <Text style={[styles.bioText, { color: colors.text }]}>
                    {therapistProfile.bio}
                  </Text>
                </View>
              </>
            )}
          </Card>
        </View>

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
                name="time-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {t("profile.availability")}
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
  profileCard: {
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  profileName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginBottom: Spacing.sm,
  },
  roleText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.secondary[500],
    marginLeft: Spacing.xs,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  verificationText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  menuContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  menuValue: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
  },
  menuText: {
    flex: 1,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 40,
  },
  bioSection: {
    paddingVertical: Spacing.sm,
  },
  bioHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  bioText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    marginLeft: 40,
    lineHeight: 22,
  },
  signOutSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  version: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.tertiary,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
