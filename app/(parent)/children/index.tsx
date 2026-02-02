import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Button, Card } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useChildren } from "@/hooks/useChildren";
import { Child } from "@/types/database.types";

export default function ChildrenListScreen() {
  const { children, loading, refetch } = useChildren();

  const renderChild = ({ item }: { item: Child }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(parent)/children/${item.id}`)}
    >
      <Card variant="elevated" style={styles.childCard}>
        <View style={styles.childInfo}>
          <Avatar
            name={item.first_name}
            seed={item.avatar_seed || item.id}
            size="lg"
          />
          <View style={styles.childDetails}>
            <Text style={styles.childName}>{item.first_name}</Text>
            <Text style={styles.childAge}>
              Born: {new Date(item.birth_date).toLocaleDateString()}
            </Text>
            <View style={styles.starsContainer}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={styles.starCount}>
                {item.total_stars} stars earned
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Colors.text.tertiary}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Children</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(parent)/children/add")}
        >
          <Ionicons name="add" size={24} color={Colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {children.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="people-outline"
            size={80}
            color={Colors.text.tertiary}
          />
          <Text style={styles.emptyTitle}>No children added yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your child to start tracking their progress and screenings
          </Text>
          <Button
            title="Add Your First Child"
            onPress={() => router.push("/(parent)/children/add")}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={children}
          renderItem={renderChild}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refetch}
        />
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  childCard: {
    marginBottom: Spacing.md,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  childDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  childName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  childAge: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starEmoji: {
    fontSize: 16,
  },
  starCount: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.star,
    marginLeft: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    minWidth: 200,
  },
});
