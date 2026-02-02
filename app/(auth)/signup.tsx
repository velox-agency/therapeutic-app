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
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/database.types";

export default function SignUpScreen() {
  const { signUp, loading } = useAuth();
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
    } else {
      Alert.alert(
        "Account Created",
        "Please check your email to verify your account.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
      );
    }
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
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              {role === "therapist"
                ? "Join as a Speech Therapist"
                : "Join as a Parent"}
            </Text>
          </View>

          {/* Role Selector */}
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === "parent" && styles.roleOptionActive,
              ]}
              onPress={() => router.setParams({ role: "parent" })}
            >
              <Ionicons
                name="people"
                size={24}
                color={
                  role === "parent"
                    ? Colors.primary[500]
                    : Colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.roleText,
                  role === "parent" && styles.roleTextActive,
                ]}
              >
                Parent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                role === "therapist" && styles.roleOptionActive,
              ]}
              onPress={() => router.setParams({ role: "therapist" })}
            >
              <Ionicons
                name="medical"
                size={24}
                color={
                  role === "therapist"
                    ? Colors.primary[500]
                    : Colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.roleText,
                  role === "therapist" && styles.roleTextActive,
                ]}
              >
                Therapist
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <Card variant="elevated" style={styles.formCard}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              error={errors.fullName}
              required
              leftIcon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.text.secondary}
                />
              }
            />

            <View style={styles.inputSpacing}>
              <Input
                label="Email"
                placeholder="Enter your email"
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
                    color={Colors.text.secondary}
                  />
                }
              />
            </View>

            <View style={styles.inputSpacing}>
              <Input
                label="Phone (Optional)"
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon={
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={Colors.text.secondary}
                  />
                }
              />
            </View>

            <View style={styles.inputSpacing}>
              <Input
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                error={errors.password}
                required
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={Colors.text.secondary}
                  />
                }
                rightIcon={
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.text.secondary}
                  />
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
            </View>

            <View style={styles.inputSpacing}>
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                error={errors.confirmPassword}
                required
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={Colors.text.secondary}
                  />
                }
              />
            </View>

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              fullWidth
              style={styles.signupButton}
            />
          </Card>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
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
  },
  roleSelector: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  roleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  roleOptionActive: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  roleText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
  roleTextActive: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
  },
  formCard: {
    marginBottom: Spacing.lg,
  },
  inputSpacing: {
    marginTop: Spacing.md,
  },
  signupButton: {
    marginTop: Spacing.lg,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: Spacing.xl,
  },
  loginText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
  loginLink: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
  },
});
