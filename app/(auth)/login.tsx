import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, Input } from "@/components/ui";
import { Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const { signIn, loading } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const { error } = await signIn(email, password);

    if (error) {
      Alert.alert(
        "Login Failed",
        error.message || "Please check your credentials",
      );
    }
    // Navigation will be handled by auth state change listener in _layout
    // The profile role will determine which dashboard to show
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={["top"]}>
          <Animated.View
            entering={FadeInUp.delay(100).springify()}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/adaptive-icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Therapeutic</Text>
            <Text style={styles.subtitle}>
              {t("common.tagline") ||
                "Empowering families on the journey to progress"}
            </Text>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Card
              variant="elevated"
              style={
                [styles.formCard, { backgroundColor: colors.surface }] as any
              }
            >
              <Text style={[styles.formTitle, { color: colors.text }]}>
                {t("auth.welcomeBack")} 👋
              </Text>
              <Text
                style={[styles.formSubtitle, { color: colors.textSecondary }]}
              >
                {t("auth.signInContinue") || "Sign in to continue your journey"}
              </Text>

              <View style={styles.inputSection}>
                <Input
                  label={t("auth.email")}
                  placeholder={t("auth.enterEmail") || "Enter your email"}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email}
                  leftIcon={
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={colors.primary}
                    />
                  }
                />

                <View style={styles.inputSpacing}>
                  <Input
                    label={t("auth.password")}
                    placeholder={
                      t("auth.enterPassword") || "Enter your password"
                    }
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    error={errors.password}
                    leftIcon={
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={colors.primary}
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

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text
                    style={[
                      styles.forgotPasswordText,
                      { color: colors.primary },
                    ]}
                  >
                    {t("auth.forgotPassword")}
                  </Text>
                </TouchableOpacity>

                <Button
                  title={t("auth.login")}
                  onPress={handleLogin}
                  loading={loading}
                  fullWidth
                  style={styles.loginButton}
                />
              </View>
            </Card>
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.signupContainer}
          >
            <Text style={[styles.signupText, { color: colors.textSecondary }]}>
              {t("auth.noAccount")}{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={[styles.signupLink, { color: colors.primary }]}>
                {t("auth.signup")}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Features */}
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            style={styles.featuresContainer}
          >
            <View style={styles.feature}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.secondaryLight },
                ]}
              >
                <Ionicons
                  name="clipboard-outline"
                  size={20}
                  color={colors.secondary}
                />
              </View>
              <Text
                style={[styles.featureText, { color: colors.textSecondary }]}
              >
                M-CHAT-R Screening
              </Text>
            </View>
            <View style={styles.feature}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.successLight },
                ]}
              >
                <Ionicons
                  name="trophy-outline"
                  size={20}
                  color={colors.success}
                />
              </View>
              <Text
                style={[styles.featureText, { color: colors.textSecondary }]}
              >
                Progress Tracking
              </Text>
            </View>
            <View style={styles.feature}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[styles.featureText, { color: colors.textSecondary }]}
              >
                Expert Therapists
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientHeader: {
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.body,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },
  keyboardView: {
    flex: 1,
    marginTop: -Spacing.xl,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  formCard: {
    marginBottom: Spacing.lg,
    borderRadius: 24,
  },
  formTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  inputSection: {},
  inputSpacing: {
    marginTop: Spacing.lg,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.xs,
  },
  forgotPasswordText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    fontWeight: "500",
  },
  loginButton: {
    marginTop: Spacing.sm,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  signupText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.body,
  },
  signupLink: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: Spacing.md,
  },
  feature: {
    alignItems: "center",
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontFamily: Typography.fontFamily.secondary,
    fontSize: Typography.fontSize.tiny,
    textAlign: "center",
    lineHeight: 16,
  },
});
