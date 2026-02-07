import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
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

import { Avatar, Button, Card, Input } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useChildren } from "@/hooks/useChildren";

export default function AddChildScreen() {
  const { addChild } = useChildren();
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState(new Date());
  const [gender, setGender] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = t("children.firstNameRequired");
    }

    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age > 18) {
      newErrors.birthDate = t("children.childMustBeUnder18");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { data, error } = await addChild({
      first_name: firstName,
      birth_date: birthDate.toISOString().split("T")[0],
      gender: gender || null,
      avatar_seed: Math.random().toString(36).substring(7),
    });
    setLoading(false);

    if (error) {
      Alert.alert(t("common.error"), t("children.failedToAddChild"));
    } else {
      Alert.alert(
        t("common.success"),
        `${firstName} ${t("children.hasBeenAdded")}`,
        [{ text: t("common.ok"), onPress: () => router.back() }],
      );
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(
      language === "ar" ? "ar-SA" : language === "fr" ? "fr-FR" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              {t("children.addChild")}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Preview Avatar */}
          <View style={styles.avatarPreview}>
            <Avatar
              name={firstName || "?"}
              seed={firstName || "default"}
              size="xxl"
            />
            <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
              {t("children.avatarGeneratedFromName")}
            </Text>
          </View>

          {/* Form */}
          <Card variant="elevated" style={styles.formCard}>
            <Input
              label={t("children.firstName")}
              placeholder={t("children.enterFirstName")}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              error={errors.firstName}
              required
              leftIcon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              }
            />

            <View style={styles.inputSpacing}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t("children.dateOfBirth")}{" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDate(birthDate)}
                </Text>
              </TouchableOpacity>
              {errors.birthDate && (
                <Text style={styles.errorText}>{errors.birthDate}</Text>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={birthDate}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setBirthDate(date);
                }}
              />
            )}

            <View style={styles.inputSpacing}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t("children.genderOptional")}
              </Text>
              <View style={styles.genderOptions}>
                {["Male", "Female"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderOption,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      gender === option && styles.genderOptionActive,
                    ]}
                    onPress={() => setGender(option)}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        { color: colors.textSecondary },
                        gender === option && styles.genderTextActive,
                      ]}
                    >
                      {option === "Male"
                        ? t("children.male")
                        : t("children.female")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              title={t("children.addChild")}
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              style={styles.submitButton}
            />
          </Card>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  avatarPreview: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  avatarHint: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.tertiary,
    marginTop: Spacing.md,
  },
  formCard: {
    marginBottom: Spacing.lg,
  },
  inputSpacing: {
    marginTop: Spacing.lg,
  },
  label: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.error[500],
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  dateText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  errorText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.error[500],
    marginTop: Spacing.xs,
  },
  genderOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  genderOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    alignItems: "center",
  },
  genderOptionActive: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  genderText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  genderTextActive: {
    color: Colors.primary[500],
    fontWeight: Typography.fontWeight.bold,
  },
  submitButton: {
    marginTop: Spacing.xl,
  },
});
