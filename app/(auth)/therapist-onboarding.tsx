import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, Input } from "@/components/ui";
import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const SPECIALIZATIONS = [
  { id: "speech_language", label: "Speech-Language Pathology", icon: "💬" },
  { id: "occupational", label: "Occupational Therapy", icon: "🤲" },
  { id: "behavioral", label: "Behavioral Therapy (ABA)", icon: "🧠" },
  { id: "developmental", label: "Developmental Therapy", icon: "🌱" },
  { id: "special_education", label: "Special Education", icon: "📚" },
  { id: "physical", label: "Physical Therapy", icon: "🏃" },
];

export default function TherapistOnboardingScreen() {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("therapist_profiles").upsert({
        id: user.id,
        specialization,
        bio,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null,
        license_number: licenseNumber || null,
        clinic_address: clinicAddress || null,
      });

      if (error) throw error;

      await refreshProfile();
      router.replace("/(therapist)/dashboard");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    router.replace("/(therapist)/dashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${(step / 2) * 100}%` }]}
              />
            </View>
            <Text style={styles.progressText}>Step {step} of 2</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 1 ? "Your Specialization" : "Professional Details"}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? "Help parents find you by selecting your area of expertise"
                : "Share more about your qualifications and practice"}
            </Text>
          </View>

          {step === 1 ? (
            /* Step 1: Specialization Selection */
            <View style={styles.specializationGrid}>
              {SPECIALIZATIONS.map((spec) => (
                <TouchableOpacity
                  key={spec.id}
                  style={[
                    styles.specializationCard,
                    specialization === spec.id && styles.selectedCard,
                  ]}
                  onPress={() => setSpecialization(spec.id)}
                >
                  <Text style={styles.specializationIcon}>{spec.icon}</Text>
                  <Text
                    style={[
                      styles.specializationLabel,
                      specialization === spec.id && styles.selectedLabel,
                    ]}
                  >
                    {spec.label}
                  </Text>
                  {specialization === spec.id && (
                    <View style={styles.checkmark}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={Colors.primary[500]}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            /* Step 2: Professional Details */
            <Card variant="elevated" style={styles.formCard}>
              <Input
                label="About You"
                placeholder="Tell parents about your approach and experience..."
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                leftIcon={
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={Colors.text.secondary}
                  />
                }
              />

              <View style={styles.inputSpacing}>
                <Input
                  label="Years of Experience"
                  placeholder="e.g., 5"
                  value={yearsExperience}
                  onChangeText={setYearsExperience}
                  keyboardType="numeric"
                  leftIcon={
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={Colors.text.secondary}
                    />
                  }
                />
              </View>

              <View style={styles.inputSpacing}>
                <Input
                  label="License Number (Optional)"
                  placeholder="Your professional license number"
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  leftIcon={
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={Colors.text.secondary}
                    />
                  }
                />
              </View>

              <View style={styles.inputSpacing}>
                <Input
                  label="Practice Location (Optional)"
                  placeholder="City, Region or Clinic Address"
                  value={clinicAddress}
                  onChangeText={setClinicAddress}
                  leftIcon={
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={Colors.text.secondary}
                    />
                  }
                />
              </View>
            </Card>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {step === 1 ? (
              <>
                <Button
                  title="Continue"
                  onPress={() => setStep(2)}
                  fullWidth
                  disabled={!specialization}
                />
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                >
                  <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.buttonRow}>
                  <Button
                    title="Back"
                    onPress={() => setStep(1)}
                    variant="outline"
                    style={styles.backButton}
                  />
                  <Button
                    title="Complete Profile"
                    onPress={handleSave}
                    loading={saving}
                    style={styles.saveButton}
                  />
                </View>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                >
                  <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary[500],
    borderRadius: 4,
  },
  progressText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  specializationGrid: {
    gap: Spacing.md,
  },
  specializationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: ComponentStyle.borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    ...ComponentStyle.shadow.small,
  },
  selectedCard: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  specializationIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  specializationLabel: {
    flex: 1,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
  },
  selectedLabel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[700],
  },
  checkmark: {
    marginLeft: Spacing.sm,
  },
  formCard: {
    marginBottom: Spacing.lg,
  },
  inputSpacing: {
    marginTop: Spacing.md,
  },
  actions: {
    marginTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  backButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  skipText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.tertiary,
  },
});
