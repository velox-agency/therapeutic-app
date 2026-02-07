import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";

interface Resource {
  id: string;
  title: string;
  content: string | null;
  type: "article" | "video" | "exercise";
  category: string;
  thumbnail_url: string | null;
  media_url: string | null;
  created_at: string;
}

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  const TYPE_CONFIG = {
    article: { icon: "📝", label: "Article", color: colors.primary },
    video: { icon: "🎥", label: "Video", color: colors.secondary },
    exercise: { icon: "🎯", label: "Exercise", color: colors.success },
  };

  useEffect(() => {
    loadResource();
  }, []);

  const loadResource = async () => {
    try {
      const { data } = await supabase
        .from("resources")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setResource(data as Resource);
    } catch (error) {
      console.error("Error loading resource:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!resource) return;
    try {
      await Share.share({
        message: `Check out this resource: ${resource.title}`,
        title: resource.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Markdown styles using dynamic theme colors
  const markdownStyles = StyleSheet.create({
    body: {
      fontFamily: Typography.fontFamily.primary,
      fontSize: Typography.fontSize.body,
      color: colors.text,
      lineHeight: 26,
    },
    heading1: {
      fontFamily: Typography.fontFamily.primaryBold,
      fontSize: Typography.fontSize.h1,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
      marginTop: Spacing.lg,
      marginBottom: Spacing.md,
    },
    heading2: {
      fontFamily: Typography.fontFamily.primaryBold,
      fontSize: Typography.fontSize.h2,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    heading3: {
      fontFamily: Typography.fontFamily.primaryBold,
      fontSize: Typography.fontSize.h3,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
      marginTop: Spacing.md,
      marginBottom: Spacing.sm,
    },
    heading4: {
      fontFamily: Typography.fontFamily.primaryBold,
      fontSize: Typography.fontSize.h4,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
      marginTop: Spacing.md,
      marginBottom: Spacing.xs,
    },
    paragraph: {
      fontFamily: Typography.fontFamily.primary,
      fontSize: Typography.fontSize.body,
      color: colors.text,
      lineHeight: 26,
      marginBottom: Spacing.md,
    },
    strong: {
      fontFamily: Typography.fontFamily.primaryBold,
      fontWeight: Typography.fontWeight.bold,
    },
    em: {
      fontStyle: "italic",
    },
    link: {
      color: colors.primary,
      textDecorationLine: "underline",
    },
    blockquote: {
      backgroundColor: colors.primaryLight,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      paddingLeft: Spacing.md,
      paddingVertical: Spacing.sm,
      marginVertical: Spacing.md,
    },
    code_inline: {
      fontFamily: "monospace",
      backgroundColor: colors.surfaceVariant,
      paddingHorizontal: Spacing.xs,
      paddingVertical: 2,
      borderRadius: 4,
      color: colors.secondary,
    },
    code_block: {
      fontFamily: "monospace",
      backgroundColor: colors.surfaceVariant,
      padding: Spacing.md,
      borderRadius: 8,
      marginVertical: Spacing.md,
      color: colors.text,
    },
    fence: {
      fontFamily: "monospace",
      backgroundColor: colors.surfaceVariant,
      padding: Spacing.md,
      borderRadius: 8,
      marginVertical: Spacing.md,
      color: colors.text,
    },
    list_item: {
      flexDirection: "row",
      marginVertical: Spacing.xs,
    },
    bullet_list: {
      marginVertical: Spacing.sm,
    },
    ordered_list: {
      marginVertical: Spacing.sm,
    },
    bullet_list_icon: {
      color: colors.primary,
      marginRight: Spacing.sm,
    },
    ordered_list_icon: {
      color: colors.primary,
      marginRight: Spacing.sm,
      fontWeight: Typography.fontWeight.bold,
    },
    hr: {
      backgroundColor: colors.divider,
      height: 1,
      marginVertical: Spacing.lg,
    },
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginVertical: Spacing.md,
    },
    thead: {
      backgroundColor: colors.surfaceVariant,
    },
    th: {
      fontFamily: Typography.fontFamily.primaryBold,
      fontWeight: Typography.fontWeight.bold,
      padding: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    td: {
      padding: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    image: {
      borderRadius: 8,
      marginVertical: Spacing.md,
    },
  });

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!resource) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.textTertiary}
        />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Resource not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={[styles.backLinkText, { color: colors.primary }]}>
            Go back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const config = TYPE_CONFIG[resource.type] || TYPE_CONFIG.article;

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
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Type Badge */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(500)}
          style={styles.typeContainer}
        >
          <View
            style={[styles.typeBadge, { backgroundColor: config.color + "20" }]}
          >
            <Text style={styles.typeIcon}>{config.icon}</Text>
            <Text style={[styles.typeLabel, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={[styles.category, { color: colors.primary }]}>
            {resource.category}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {resource.title}
          </Text>
        </Animated.View>

        {/* Content */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={[styles.contentCard, { backgroundColor: colors.surface }]}
        >
          {resource.content ? (
            <Markdown style={markdownStyles}>{resource.content}</Markdown>
          ) : (
            <View style={styles.noContent}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.textTertiary}
              />
              <Text
                style={[styles.noContentText, { color: colors.textTertiary }]}
              >
                No content available for this resource
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Tips Section */}
        {resource.type === "exercise" && (
          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            style={[
              styles.tipsCard,
              { backgroundColor: colors.secondaryLight },
            ]}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color={colors.secondary} />
              <Text style={[styles.tipsTitle, { color: colors.text }]}>
                Pro Tip
              </Text>
            </View>
            <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
              Practice this exercise at the same time each day to build a
              consistent routine. Start with short sessions and gradually
              increase duration.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    marginTop: Spacing.md,
  },
  backLink: {
    marginTop: Spacing.md,
  },
  backLinkText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.tabBarClearance,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  typeContainer: {
    marginBottom: Spacing.md,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
  },
  typeIcon: {
    fontSize: 16,
  },
  typeLabel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "uppercase",
  },
  category: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 36,
    marginBottom: Spacing.lg,
  },
  contentCard: {
    padding: Spacing.lg,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  noContent: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  noContentText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    marginTop: Spacing.md,
  },
  tipsCard: {
    padding: Spacing.lg,
    borderRadius: 16,
    marginTop: Spacing.lg,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipsTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
  },
  tipsText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    lineHeight: 22,
  },
});
