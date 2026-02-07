import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/database.types";

export default function SignUpScreen() {
  const { signUp, loading } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ role?: string }>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const role = (params.role as UserRole) || "parent";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    const { error } = await signUp({
      email,
      password,
      fullName,
      role,
      phone: phone || undefined,
    });

    if (error) {
      Alert.alert("Sign Up Failed", error.message || "Please try again");
    } else if (role === "therapist") {
      // Redirect therapists to onboarding to complete their profile
      router.replace("/(auth)/therapist-onboarding" as any);
    }
    // For parents, the auth state change will trigger navigation automatically
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t("auth.createAccount")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {role === "therapist"
                ? t("auth.therapistRoleDesc")
                : t("auth.parentRoleDesc")}
            </Text>
          </View>

          {/* Role Selector */}
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                role === "parent" && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryLight,
                },
              ]}
              onPress={() => router.setParams({ role: "parent" })}
            >
              <Ionicons
                name="people"
                size={24}
                color={
                  role === "parent" ? colors.primary : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.roleText,
                  { color: colors.textSecondary },
                  role === "parent" && {
                    color: colors.primary,
                    fontWeight: "bold",
                  },
                ]}
              >
                {t("auth.parentRole")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                role === "therapist" && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryLight,
                },
              ]}
              onPress={() => router.setParams({ role: "therapist" })}
            >
              <Ionicons
                name="medical"
                size={24}
                color={
                  role === "therapist" ? colors.primary : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.roleText,
                  { color: colors.textSecondary },
                  role === "therapist" && {
                    color: colors.primary,
                    fontWeight: "bold",
                  },
                ]}
              >
                {t("auth.therapistRole")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <Card
            variant="elevated"
            style={StyleSheet.flatten([
              styles.formCard,
              { backgroundColor: colors.surface },
            ])}
          >
            <Input
              label={t("auth.fullName")}
              placeholder={t("auth.enterName") || "Enter your full name"}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              error={errors.fullName}
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
              <Input
                label={t("auth.email")}
                placeholder={t("auth.enterEmail") || "Enter your email"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
                required
                leftIcon={
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                }
              />
            </View>

            <View style={styles.inputSpacing}>
              <Input
                label={t("auth.phone")}
                placeholder={t("auth.enterPhone") || "Enter your phone number"}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon={
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                }
              />
            </View>

            <View style={styles.inputSpacing}>
              <Input
                label={t("auth.password")}
                placeholder={t("auth.createPassword") || "Create a password"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                error={errors.password}
                required
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                }
                rightIcon={
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
            </View>

            <View style={styles.inputSpacing}>
              <Input
                label={t("auth.confirmPassword")}
                placeholder={
                  t("auth.confirmYourPassword") || "Confirm your password"
                }
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                error={errors.confirmPassword}
                required
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                }
              />
            </View>

            <Button
              title={t("auth.createAccount")}
              onPress={handleSignUp}
              loading={loading}
              fullWidth
              style={styles.signupButton}
            />
          </Card>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              {t("auth.hasAccount")}{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                {t("auth.login")}
              </Text>
            </TouchableOpacity>
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
    paddingVertical: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  roleSelector: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  roleOption: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 90,
  },
  roleOptionActive: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  roleText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  roleTextActive: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
  },
  formCard: {
    marginBottom: Spacing.xl,
    borderRadius: 24,
  },
  inputSpacing: {
    marginTop: Spacing.lg,
  },
  signupButton: {
    marginTop: Spacing.xl,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: Spacing.xxl,
  },
  loginText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
  loginLink: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
  },
});
