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
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Spacing, Typography } from "@/constants/theme";
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

const TYPE_CONFIG = {
  article: { icon: "📝", label: "Article", color: Colors.primary[500] },
  video: { icon: "🎥", label: "Video", color: Colors.secondary[500] },
  exercise: { icon: "🎯", label: "Exercise", color: Colors.success[500] },
};

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </SafeAreaView>
    );
  }

  if (!resource) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={Colors.text.tertiary}
        />
        <Text style={styles.errorText}>Resource not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const config = TYPE_CONFIG[resource.type] || TYPE_CONFIG.article;

  return (
    <SafeAreaView style={styles.container}>
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
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons
              name="share-outline"
              size={24}
              color={Colors.text.primary}
            />
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
          <Text style={styles.category}>{resource.category}</Text>
          <Text style={styles.title}>{resource.title}</Text>
        </Animated.View>

        {/* Content */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.contentCard}
        >
          {resource.content ? (
            <Text style={styles.bodyText}>{resource.content}</Text>
          ) : (
            <View style={styles.noContent}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={Colors.text.tertiary}
              />
              <Text style={styles.noContentText}>
                No content available for this resource
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Tips Section */}
        {resource.type === "exercise" && (
          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            style={styles.tipsCard}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color={Colors.secondary[500]} />
              <Text style={styles.tipsTitle}>Pro Tip</Text>
            </View>
            <Text style={styles.tipsText}>
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
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  backLink: {
    marginTop: Spacing.md,
  },
  backLinkText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.primary[500],
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
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
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
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
    color: Colors.primary[600],
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    lineHeight: 36,
    marginBottom: Spacing.lg,
  },
  contentCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  bodyText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    lineHeight: 26,
  },
  noContent: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  noContentText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.tertiary,
    marginTop: Spacing.md,
  },
  tipsCard: {
    backgroundColor: Colors.secondary[50],
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
    color: Colors.secondary[700],
  },
  tipsText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.secondary[700],
    lineHeight: 22,
  },
});
