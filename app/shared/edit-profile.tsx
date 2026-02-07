import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Button, Card } from "@/components/ui";
import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";
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

export default function EditProfileScreen() {
  const { profile, user, refreshProfile } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const isTherapist = profile?.role === "therapist";

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Therapist-specific fields
  const [therapistProfile, setTherapistProfile] =
    useState<TherapistProfile | null>(null);
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [loadingTherapistProfile, setLoadingTherapistProfile] = useState(false);

  // Load therapist profile if user is a therapist
  useEffect(() => {
    if (isTherapist && user?.id) {
      loadTherapistProfile();
    }
  }, [isTherapist, user?.id]);

  const loadTherapistProfile = async () => {
    if (!user?.id) return;

    setLoadingTherapistProfile(true);
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
        setSpecialization(data.specialization || "");
        setLicenseNumber(data.license_number || "");
        setClinicAddress(data.clinic_address || "");
        setBio(data.bio || "");
        setYearsExperience(data.years_experience?.toString() || "");
      }
    } catch (error) {
      console.error("Error loading therapist profile:", error);
    } finally {
      setLoadingTherapistProfile(false);
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        t("common.error"),
        t("profile.photoPermissionRequired") ||
          "Please allow access to your photo library to upload a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your camera to take a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Profile Picture", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageUri || !user) return null;

    setUploadingImage(true);

    try {
      // Get file extension
      const ext = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/avatar.${ext}`;

      // Fetch the image as blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Convert blob to ArrayBuffer
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, arrayBuffer, {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert(
        t("common.error"),
        t("profile.enterName") || "Please enter your name",
      );
      return;
    }

    setSaving(true);

    try {
      let avatarUrl = profile?.avatar_url;

      // Upload new image if selected
      if (imageUri) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      // Update therapist profile if user is a therapist
      if (isTherapist && user?.id) {
        const { error: therapistError } = await supabase
          .from("therapist_profiles")
          .update({
            specialization: specialization.trim() || null,
            license_number: licenseNumber.trim() || null,
            clinic_address: clinicAddress.trim() || null,
            bio: bio.trim() || null,
            years_experience: yearsExperience
              ? parseInt(yearsExperience, 10)
              : null,
          })
          .eq("id", user.id);

        if (therapistError) {
          console.error("Error updating therapist profile:", therapistError);
          throw therapistError;
        }
      }

      // Refresh profile data
      await refreshProfile?.();

      Alert.alert(
        t("common.success"),
        t("profile.profileUpdated") || "Profile updated successfully!",
        [{ text: t("common.ok"), onPress: () => router.back() }],
      );
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert(
        t("common.error"),
        t("profile.failedToSave") ||
          "Failed to save profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.header}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: colors.surface }]}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t("profile.editProfile")}
            </Text>
            <View style={{ width: 44 }} />
          </Animated.View>

          {/* Avatar Section */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.avatarSection}
          >
            <TouchableOpacity
              onPress={showImageOptions}
              style={styles.avatarContainer}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatarImage} />
              ) : (
                <Avatar
                  name={fullName || profile?.full_name}
                  source={profile?.avatar_url}
                  size="xxl"
                />
              )}
              <View style={styles.editBadge}>
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={16} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>
              {t("profile.tapToChangePhoto") || "Tap to change photo"}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card variant="elevated" style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t("auth.fullName")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.border,
                    },
                  ]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t("profile.enterName") || "Enter your name"}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t("auth.email")}
                </Text>
                <View
                  style={[
                    styles.emailContainer,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.emailText, { color: colors.textSecondary }]}
                  >
                    {user?.email}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={Colors.success[500]}
                    />
                    <Text style={styles.verifiedText}>
                      {t("profile.verified") || "Verified"}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.helperText, { color: colors.textSecondary }]}
                >
                  {t("profile.emailCannotBeChanged") ||
                    "Email cannot be changed"}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t("auth.phone")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.border,
                    },
                  ]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={
                    t("profile.enterPhone") || "Enter your phone number"
                  }
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t("profile.role") || "Role"}
                </Text>
                <View
                  style={[
                    styles.roleContainer,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.roleBadge}>
                    <Ionicons name="person" size={16} color={colors.primary} />
                    <Text style={[styles.roleText, { color: colors.text }]}>
                      {profile?.role === "parent"
                        ? t("common.parent")
                        : t("common.therapist")}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.helperText, { color: colors.textSecondary }]}
                >
                  {t("profile.roleCannotBeChanged") ||
                    "Role cannot be changed. Contact support if needed."}
                </Text>
              </View>
            </Card>
          </Animated.View>

          {/* Therapist-specific fields */}
          {isTherapist && (
            <Animated.View entering={FadeInDown.delay(250).duration(400)}>
              <Card variant="elevated" style={styles.formCard}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t("profile.professionalInfo")}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t("profile.specialization")}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.surfaceVariant,
                        borderColor: colors.border,
                      },
                    ]}
                    value={specialization}
                    onChangeText={setSpecialization}
                    placeholder={
                      t("profile.enterSpecialization") ||
                      "e.g., Speech-Language Pathology"
                    }
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t("profile.licenseNumber")}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.surfaceVariant,
                        borderColor: colors.border,
                      },
                    ]}
                    value={licenseNumber}
                    onChangeText={setLicenseNumber}
                    placeholder={
                      t("profile.enterLicenseNumber") ||
                      "Enter your license number"
                    }
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t("profile.yearsExperience") || "Years of Experience"}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.surfaceVariant,
                        borderColor: colors.border,
                      },
                    ]}
                    value={yearsExperience}
                    onChangeText={setYearsExperience}
                    placeholder={t("profile.enterYearsExperience") || "e.g., 5"}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t("profile.clinicAddress")}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.multilineInput,
                      {
                        color: colors.text,
                        backgroundColor: colors.surfaceVariant,
                        borderColor: colors.border,
                      },
                    ]}
                    value={clinicAddress}
                    onChangeText={setClinicAddress}
                    placeholder={
                      t("profile.enterClinicAddress") ||
                      "Enter your clinic address"
                    }
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t("profile.bio") || "Bio"}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.bioInput,
                      {
                        color: colors.text,
                        backgroundColor: colors.surfaceVariant,
                        borderColor: colors.border,
                      },
                    ]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder={
                      t("profile.enterBio") ||
                      "Tell parents about yourself and your experience..."
                    }
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </Card>
            </Animated.View>
          )}

          {/* Save Button */}
          <Animated.View
            entering={FadeInDown.delay(isTherapist ? 350 : 300).duration(400)}
          >
            <Button
              title={
                saving
                  ? t("common.saving") || "Saving..."
                  : t("profile.saveChanges") || "Save Changes"
              }
              onPress={handleSave}
              variant="primary"
              fullWidth
              loading={saving}
              disabled={saving || uploadingImage || loadingTherapistProfile}
              style={styles.saveButton}
            />
          </Animated.View>

          {/* Danger Zone */}
          <Animated.View
            entering={FadeInDown.delay(isTherapist ? 400 : 350).duration(400)}
          >
            <Card variant="outlined" style={styles.dangerCard}>
              <Text style={styles.dangerTitle}>
                {t("profile.dangerZone") || "Danger Zone"}
              </Text>
              <Text style={styles.dangerText}>
                {t("profile.deleteWarning") ||
                  "Deleting your account is permanent and cannot be undone."}
              </Text>
              <Button
                title={t("profile.deleteAccount")}
                onPress={() => {
                  Alert.alert(
                    t("profile.deleteAccount"),
                    t("profile.deleteConfirmation") ||
                      "Are you sure you want to delete your account? This action cannot be undone.",
                    [
                      { text: t("common.cancel"), style: "cancel" },
                      {
                        text: t("common.delete"),
                        style: "destructive",
                        onPress: () => {
                          // TODO: Implement account deletion
                          Alert.alert(
                            t("profile.contactSupport") || "Contact Support",
                            t("profile.contactSupportMessage") ||
                              "Please contact support to delete your account.",
                          );
                        },
                      },
                    ],
                  );
                }}
                variant="outline"
                size="small"
                style={styles.deleteButton}
              />
            </Card>
          </Animated.View>
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.tabBarClearance,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  headerTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },
  changePhotoText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.primary[500],
    marginTop: Spacing.sm,
  },
  formCard: {
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: ComponentStyle.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  bioInput: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceVariant,
    borderRadius: ComponentStyle.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.success[600],
  },
  helperText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  roleContainer: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: ComponentStyle.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  roleText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    textTransform: "capitalize",
  },
  saveButton: {
    marginBottom: Spacing.lg,
  },
  dangerCard: {
    borderColor: Colors.error[200],
    backgroundColor: Colors.error[50],
  },
  dangerTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.error[600],
    marginBottom: Spacing.sm,
  },
  dangerText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.error[600],
    marginBottom: Spacing.md,
  },
  deleteButton: {
    borderColor: Colors.error[500],
  },
});
