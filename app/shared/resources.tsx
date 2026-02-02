import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, Input } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";

const RESOURCE_CATEGORIES = [
  { id: "all", label: "All", icon: "grid" },
  { id: "articles", label: "Articles", icon: "document-text" },
  { id: "videos", label: "Videos", icon: "videocam" },
  { id: "activities", label: "Activities", icon: "game-controller" },
  { id: "tips", label: "Tips", icon: "bulb" },
];

const SAMPLE_RESOURCES = [
  {
    id: "1",
    title: "Understanding Autism Spectrum Disorder",
    description: "A comprehensive guide for parents new to the autism journey.",
    type: "article",
    duration: "10 min read",
    icon: "document-text",
    color: Colors.primary[500],
  },
  {
    id: "2",
    title: "Communication Strategies at Home",
    description: "Practical tips to enhance communication with your child.",
    type: "article",
    duration: "8 min read",
    icon: "chatbubbles",
    color: Colors.secondary[500],
  },
  {
    id: "3",
    title: "Visual Schedule Tutorial",
    description: "Learn how to create effective visual schedules.",
    type: "video",
    duration: "15 min watch",
    icon: "videocam",
    color: Colors.success[500],
  },
  {
    id: "4",
    title: "Sensory-Friendly Activities",
    description: "Fun activities designed for sensory needs.",
    type: "activities",
    duration: "20+ activities",
    icon: "game-controller",
    color: Colors.error[500],
  },
  {
    id: "5",
    title: "Daily Routine Tips",
    description: "Quick tips for maintaining consistent routines.",
    type: "tips",
    duration: "5 tips",
    icon: "bulb",
    color: Colors.warning[500],
  },
];

export default function ResourcesScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = SAMPLE_RESOURCES.filter((resource) => {
    const matchesCategory =
      selectedCategory === "all" ||
      resource.type === selectedCategory.slice(0, -1);
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderResource = ({
    item,
    index,
  }: {
    item: (typeof SAMPLE_RESOURCES)[0];
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <TouchableOpacity activeOpacity={0.7}>
        <Card variant="elevated" style={styles.resourceCard}>
          <View
            style={[
              styles.resourceIcon,
              { backgroundColor: item.color + "20" },
            ]}
          >
            <Ionicons name={item.icon as any} size={28} color={item.color} />
          </View>
          <View style={styles.resourceContent}>
            <Text style={styles.resourceTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.resourceDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.resourceMeta}>
              <Ionicons
                name="time-outline"
                size={14}
                color={Colors.text.tertiary}
              />
              <Text style={styles.resourceDuration}>{item.duration}</Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.text.tertiary}
          />
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resources</Text>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Ionicons
            name="bookmark-outline"
            size={24}
            color={Colors.primary[500]}
          />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search resources..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {RESOURCE_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipSelected,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={18}
              color={
                selectedCategory === category.id
                  ? Colors.surface
                  : Colors.text.secondary
              }
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Resources List */}
      <FlatList
        data={filteredResources}
        renderItem={renderResource}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyText}>No resources found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
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
  headerTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  categoryText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  categoryTextSelected: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.surface,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  resourceIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  resourceDescription: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  resourceMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  resourceDuration: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.tertiary,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
});
