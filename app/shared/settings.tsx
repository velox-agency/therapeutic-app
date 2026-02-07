import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui";
import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsScreen() {
  const { theme, mode, setMode, colors } = useTheme();
  const { language, setLanguage, t, availableLanguages } = useLanguage();

  const themeOptions = [
    {
      value: "system" as const,
      label: "System",
      icon: "phone-portrait-outline",
    },
    { value: "light" as const, label: "Light", icon: "sunny-outline" },
    { value: "dark" as const, label: "Dark", icon: "moon-outline" },
  ];

  const cardStyle: ViewStyle = {
    ...styles.card,
    backgroundColor: colors.surface,
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Appearance
          </Text>

          <Card variant="elevated" style={cardStyle}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name="color-palette-outline"
                  size={24}
                  color={Colors.primary[500]}
                />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Theme
                </Text>
              </View>
            </View>

            <View style={styles.themeOptions}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.themeOption,
                    mode === option.value && styles.themeOptionActive,
                    {
                      borderColor:
                        mode === option.value
                          ? Colors.primary[500]
                          : colors.border,
                    },
                  ]}
                  onPress={() => setMode(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={
                      mode === option.value
                        ? Colors.primary[500]
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      {
                        color:
                          mode === option.value
                            ? Colors.primary[500]
                            : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Language
          </Text>

          <Card variant="elevated" style={cardStyle}>
            {availableLanguages.map((lang, index) => (
              <React.Fragment key={lang.code}>
                <TouchableOpacity
                  style={styles.languageRow}
                  onPress={() => setLanguage(lang.code)}
                >
                  <View style={styles.languageInfo}>
                    <Text style={[styles.languageName, { color: colors.text }]}>
                      {lang.nativeName}
                    </Text>
                    <Text
                      style={[
                        styles.languageSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {lang.name}
                    </Text>
                  </View>
                  {language === lang.code && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={Colors.primary[500]}
                    />
                  )}
                </TouchableOpacity>
                {index < availableLanguages.length - 1 && (
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: colors.divider },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </Card>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            About
          </Text>

          <Card variant="elevated" style={cardStyle}>
            <View style={styles.aboutRow}>
              <Text
                style={[styles.aboutLabel, { color: colors.textSecondary }]}
              >
                Version
              </Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>
                1.0.0
              </Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.divider }]}
            />
            <View style={styles.aboutRow}>
              <Text
                style={[styles.aboutLabel, { color: colors.textSecondary }]}
              >
                Build
              </Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>
                Expo SDK 54
              </Text>
            </View>
          </Card>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.text }]}>
            Therapeutic App
          </Text>
          <Text style={[styles.appTagline, { color: colors.textTertiary }]}>
            Empowering families on the journey to progress
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    padding: Spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
  },
  themeOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  themeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderWidth: 2,
    borderRadius: ComponentStyle.borderRadius.md,
  },
  themeOptionActive: {
    backgroundColor: Colors.primary[50],
  },
  themeOptionText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  languageInfo: {},
  languageName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
  },
  languageSubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  aboutLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
  },
  aboutValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
  },
  appInfo: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  appName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
  },
  appTagline: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
});
