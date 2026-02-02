import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { SessionCard } from "@/components/sessions";
import { Card } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface SessionWithRelations {
  id: string;
  patient_therapist_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "completed" | "cancelled";
  location: string | null;
  session_notes: string | null;
  created_at: string;
  patient_therapist?: {
    child_id: string;
    children?: { first_name: string };
    therapist_id: string;
    therapist_profiles?: {
      profiles?: { full_name: string };
    };
  };
}

export default function SessionsScreen() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      if (!user) return;

      // Get all children for this parent
      const { data: children } = await supabase
        .from("children")
        .select("id")
        .eq("parent_id", user.id);

      if (!children?.length) {
        setLoading(false);
        return;
      }

      const childIds = children.map((c) => c.id);

      // Get sessions through patient_therapist relationships
      const { data: sessionsData } = await supabase
        .from("sessions")
        .select(
          `
          *,
          patient_therapist!inner(
            child_id,
            children(first_name),
            therapist_id,
            therapist_profiles(profiles(full_name))
          )
        `,
        )
        .in("patient_therapist.child_id", childIds)
        .order("scheduled_at", { ascending: true });

      setSessions((sessionsData as SessionWithRelations[]) || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const now = new Date();
  const upcomingSessions = sessions.filter(
    (s) => new Date(s.scheduled_at) >= now && s.status === "scheduled",
  );
  const pastSessions = sessions.filter(
    (s) => new Date(s.scheduled_at) < now || s.status !== "scheduled",
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary[500]}
          />
        }
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
          <Text style={styles.title}>Sessions 📅</Text>
          <View style={styles.headerPlaceholder} />
        </Animated.View>

        {/* Upcoming Sessions */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Upcoming</Text>
          {upcomingSessions.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={Colors.text.tertiary}
              />
              <Text style={styles.emptyTitle}>No upcoming sessions</Text>
              <Text style={styles.emptySubtitle}>
                Your therapist will schedule sessions for you
              </Text>
            </Card>
          ) : (
            upcomingSessions.map((session, index) => (
              <SessionCard
                key={session.id}
                session={session}
                childName={session.patient_therapist?.children?.first_name}
                therapistName={
                  session.patient_therapist?.therapist_profiles?.profiles
                    ?.full_name
                }
                delay={index * 100}
              />
            ))
          )}
        </Animated.View>

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Past Sessions</Text>
            {pastSessions.slice(0, 5).map((session, index) => (
              <SessionCard
                key={session.id}
                session={session}
                childName={session.patient_therapist?.children?.first_name}
                therapistName={
                  session.patient_therapist?.therapist_profiles?.profiles
                    ?.full_name
                }
                delay={index * 50}
              />
            ))}
            {pastSessions.length > 5 && (
              <TouchableOpacity style={styles.showMoreButton}>
                <Text style={styles.showMoreText}>
                  Show {pastSessions.length - 5} more sessions
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={Colors.primary[500]}
                />
              </TouchableOpacity>
            )}
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
  loadingText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  headerPlaceholder: {
    width: 44,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  showMoreText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.primary[500],
  },
});
