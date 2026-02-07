import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Button, Card } from "@/components/ui";
import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useChildren } from "@/hooks/useChildren";
import { supabase } from "@/lib/supabase";

interface TherapistDetail {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  therapist_profile: {
    specialization: string | null;
    bio: string | null;
    years_experience: number | null;
    clinic_address: string | null;
    license_number: string | null;
    is_verified: boolean;
  } | null;
}

export default function TherapistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { children } = useChildren();

  const [therapist, setTherapist] = useState<TherapistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [existingEnrollments, setExistingEnrollments] = useState<string[]>([]);

  useEffect(() => {
    loadTherapist();
    loadExistingEnrollments();
  }, [id]);

  const loadTherapist = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          avatar_url,
          phone,
          therapist_profile:therapist_profiles(
            specialization,
            bio,
            years_experience,
            clinic_address,
            license_number,
            is_verified
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      setTherapist({
        ...data,
        therapist_profile: data.therapist_profile?.[0] || null,
      } as TherapistDetail);
    } catch (error) {
      console.error("Error loading therapist:", error);
      Alert.alert("Error", "Failed to load therapist details");
    } finally {
      setLoading(false);
    }
  };

  const loadExistingEnrollments = async () => {
    if (!user || !id) return;

    try {
      // Get all children enrolled with this therapist
      const { data } = await supabase
        .from("patient_therapist")
        .select("child_id")
        .eq("therapist_id", id);

      setExistingEnrollments((data || []).map((d) => d.child_id));
    } catch (error) {
      console.error("Error loading enrollments:", error);
    }
  };

  const handleEnrollment = async () => {
    if (!selectedChildId) {
      Alert.alert("Select Child", "Please select a child to enroll");
      return;
    }

    if (!therapist) return;

    setEnrolling(true);
    try {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from("patient_therapist")
        .select("id, status")
        .eq("child_id", selectedChildId)
        .eq("therapist_id", therapist.id)
        .single();

      if (existing) {
        Alert.alert(
          "Already Enrolled",
          existing.status === "pending"
            ? "An enrollment request is already pending for this child."
            : "This child is already enrolled with this therapist.",
        );
        setEnrolling(false);
        return;
      }

      // Create enrollment request
      const { error } = await supabase.from("patient_therapist").insert({
        child_id: selectedChildId,
        therapist_id: therapist.id,
        status: "pending",
      });

      if (error) throw error;

      Alert.alert(
        "Request Sent! 🎉",
        `Your enrollment request has been sent to ${therapist.full_name}. You'll be notified once they accept.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      console.error("Error enrolling:", error);
      Alert.alert(
        "Error",
        "Failed to send enrollment request. Please try again.",
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!therapist) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.textSecondary}
        />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Therapist not found
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="primary"
        />
      </SafeAreaView>
    );
  }

  const availableChildren = children.filter(
    (c) => !existingEnrollments.includes(c.id),
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          <Card variant="elevated" style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Avatar
                name={therapist.full_name}
                source={therapist.avatar_url}
                size="xl"
              />
              <View style={styles.nameContainer}>
                <Text style={[styles.therapistName, { color: colors.text }]}>
                  {therapist.full_name}
                </Text>
                {therapist.therapist_profile?.is_verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={Colors.primary[500]}
                    />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>

            {therapist.therapist_profile?.specialization && (
              <View style={styles.specialtyBadge}>
                <Ionicons
                  name="medical"
                  size={16}
                  color={Colors.primary[600]}
                />
                <Text style={styles.specialtyText}>
                  {therapist.therapist_profile.specialization}
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.statsRow}
        >
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons
              name="time-outline"
              size={24}
              color={Colors.primary[500]}
            />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {therapist.therapist_profile?.years_experience || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Years Exp.
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color={Colors.success[500]}
            />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {therapist.therapist_profile?.is_verified ? "Yes" : "No"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Verified
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Ionicons
              name="star-outline"
              size={24}
              color={Colors.secondary[500]}
            />
            <Text style={[styles.statValue, { color: colors.text }]}>--</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Rating
            </Text>
          </View>
        </Animated.View>

        {/* Bio Section */}
        {therapist.therapist_profile?.bio && (
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <Card variant="elevated" style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                About
              </Text>
              <Text style={[styles.bioText, { color: colors.textSecondary }]}>
                {therapist.therapist_profile.bio}
              </Text>
            </Card>
          </Animated.View>
        )}

        {/* Contact Info */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Contact & Location
            </Text>

            {therapist.therapist_profile?.clinic_address && (
              <View
                style={[styles.infoRow, { borderBottomColor: colors.border }]}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={Colors.primary[500]}
                />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {therapist.therapist_profile.clinic_address}
                </Text>
              </View>
            )}

            {therapist.phone && (
              <View
                style={[styles.infoRow, { borderBottomColor: colors.border }]}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={Colors.primary[500]}
                />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {therapist.phone}
                </Text>
              </View>
            )}

            {therapist.therapist_profile?.license_number && (
              <View
                style={[styles.infoRow, { borderBottomColor: colors.border }]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={Colors.primary[500]}
                />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  License: {therapist.therapist_profile.license_number}
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Enrollment Section */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Request Enrollment
            </Text>
            <Text
              style={[styles.enrollmentDesc, { color: colors.textSecondary }]}
            >
              Select a child to enroll with this therapist. They will receive
              your request and can accept or decline.
            </Text>

            {availableChildren.length === 0 ? (
              <View
                style={[
                  styles.noChildrenContainer,
                  { backgroundColor: colors.surfaceVariant },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    styles.noChildrenText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {children.length === 0
                    ? "Add a child first to request enrollment"
                    : "All your children are already enrolled or have pending requests with this therapist"}
                </Text>
                {children.length === 0 && (
                  <Button
                    title="Add Child"
                    onPress={() => router.push("/(parent)/children/add")}
                    variant="outline"
                    size="small"
                    style={{ marginTop: Spacing.md }}
                  />
                )}
              </View>
            ) : (
              <>
                <Text style={[styles.selectLabel, { color: colors.text }]}>
                  Select Child:
                </Text>
                <View style={styles.childrenList}>
                  {availableChildren.map((child) => (
                    <TouchableOpacity
                      key={child.id}
                      onPress={() => setSelectedChildId(child.id)}
                      style={[
                        styles.childOption,
                        {
                          backgroundColor: colors.surfaceVariant,
                          borderColor: colors.border,
                        },
                        selectedChildId === child.id &&
                          styles.childOptionSelected,
                      ]}
                    >
                      <Ionicons
                        name={
                          selectedChildId === child.id
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={24}
                        color={
                          selectedChildId === child.id
                            ? Colors.primary[500]
                            : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.childName,
                          { color: colors.text },
                          selectedChildId === child.id &&
                            styles.childNameSelected,
                        ]}
                      >
                        {child.first_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Button
                  title={
                    enrolling ? "Sending Request..." : "Request Enrollment"
                  }
                  onPress={handleEnrollment}
                  variant="primary"
                  fullWidth
                  loading={enrolling}
                  disabled={!selectedChildId || enrolling}
                  style={{ marginTop: Spacing.md }}
                />
              </>
            )}
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    marginVertical: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...ComponentStyle.shadow.small,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  nameContainer: {
    alignItems: "center",
    marginTop: Spacing.md,
  },
  therapistName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: "center",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  verifiedText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.semibold,
  },
  specialtyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: ComponentStyle.borderRadius.lg,
    gap: Spacing.sm,
  },
  specialtyText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: ComponentStyle.borderRadius.lg,
    alignItems: "center",
    ...ComponentStyle.shadow.small,
  },
  statValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.tertiary,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  bioText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    flex: 1,
  },
  enrollmentDesc: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  selectLabel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  childrenList: {
    gap: Spacing.sm,
  },
  childOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: ComponentStyle.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  childOptionSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  childName: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
  },
  childNameSelected: {
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.semibold,
  },
  noChildrenContainer: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: ComponentStyle.borderRadius.md,
  },
  noChildrenText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
});
