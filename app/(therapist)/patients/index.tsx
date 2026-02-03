import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Button, Card } from "@/components/ui";
import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface PatientEnrollment {
  id: string;
  status: "pending" | "active" | "declined";
  child: {
    id: string;
    first_name: string;
    birth_date: string;
    gender: string | null;
    avatar_seed: string | null;
    total_stars: number;
  };
  parent: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

type TabFilter = "all" | "active" | "pending";

export default function PatientsListScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [patients, setPatients] = useState<PatientEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const loadPatients = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // First get patient_therapist records
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("patient_therapist")
        .select("*")
        .eq("therapist_id", user.id);

      if (enrollmentError) throw enrollmentError;

      if (!enrollments || enrollments.length === 0) {
        setPatients([]);
        return;
      }

      // Get unique child IDs
      const childIds = [...new Set(enrollments.map((e) => e.child_id))];

      // Fetch children data with parent_id
      const { data: children, error: childrenError } = await supabase
        .from("children")
        .select(
          "id, parent_id, first_name, birth_date, gender, avatar_seed, total_stars",
        )
        .in("id", childIds);

      if (childrenError) throw childrenError;

      // Get parent IDs from children
      const parentIds = [...new Set(children?.map((c) => c.parent_id) || [])];

      // Fetch parents data
      const { data: parents, error: parentsError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", parentIds);

      if (parentsError) throw parentsError;

      // Combine the data - filter out enrollments where child or parent wasn't found (RLS restriction)
      const formatted = enrollments
        .map((enrollment) => {
          const child = children?.find((c) => c.id === enrollment.child_id);
          const parent = parents?.find((p) => p.id === child?.parent_id);

          return {
            id: enrollment.id,
            status: enrollment.status,
            child,
            parent,
          };
        })
        .filter(
          (item) => item.child !== undefined && item.parent !== undefined,
        ) as PatientEnrollment[];

      setPatients(formatted);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
  };

  const handleAccept = async (enrollmentId: string) => {
    Alert.alert(
      "Accept Patient",
      "Are you sure you want to accept this enrollment request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("patient_therapist")
                .update({ status: "active" })
                .eq("id", enrollmentId);

              if (error) throw error;
              await loadPatients();
              Alert.alert("Success", "Patient enrollment accepted!");
            } catch (error) {
              console.error("Error accepting:", error);
              Alert.alert("Error", "Failed to accept enrollment");
            }
          },
        },
      ],
    );
  };

  const handleDecline = async (enrollmentId: string) => {
    Alert.alert(
      "Decline Request",
      "Are you sure you want to decline this enrollment request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("patient_therapist")
                .update({ status: "declined" })
                .eq("id", enrollmentId);

              if (error) throw error;
              await loadPatients();
            } catch (error) {
              console.error("Error declining:", error);
              Alert.alert("Error", "Failed to decline enrollment");
            }
          },
        },
      ],
    );
  };

  const filteredPatients = patients.filter((p) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && p.status === "active") ||
      (activeTab === "pending" && p.status === "pending");

    const matchesSearch =
      !searchQuery ||
      p.child.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.parent.full_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const pendingCount = patients.filter((p) => p.status === "pending").length;
  const activeCount = patients.filter((p) => p.status === "active").length;

  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const renderPatient = ({
    item,
    index,
  }: {
    item: PatientEnrollment;
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity
        onPress={() =>
          item.status === "active" &&
          router.push(`/(therapist)/patients/${item.child.id}`)
        }
        disabled={item.status !== "active"}
      >
        <Card
          variant="elevated"
          style={
            StyleSheet.flatten([
              styles.patientCard,
              item.status === "pending" && styles.pendingCard,
            ]) as ViewStyle
          }
        >
          <View style={styles.cardHeader}>
            <Avatar name={item.child.first_name} size="lg" />
            <View style={styles.patientInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.patientName}>{item.child.first_name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === "active"
                      ? styles.activeBadge
                      : item.status === "pending"
                        ? styles.pendingBadge
                        : styles.declinedBadge,
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.ageText}>
                {calculateAge(item.child.birth_date)} years old
              </Text>
              <View style={styles.parentRow}>
                <Ionicons
                  name="person-outline"
                  size={14}
                  color={Colors.text.tertiary}
                />
                <Text style={styles.parentName}>{item.parent.full_name}</Text>
              </View>
            </View>
          </View>

          {item.status === "pending" && (
            <View style={styles.actionButtons}>
              <Button
                title="Accept"
                onPress={() => handleAccept(item.id)}
                variant="primary"
                size="small"
                style={{ flex: 1, marginRight: Spacing.sm }}
              />
              <Button
                title="Decline"
                onPress={() => handleDecline(item.id)}
                variant="outline"
                size="small"
                style={{ flex: 1 }}
              />
            </View>
          )}

          {item.status === "active" && (
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() =>
                  router.push(
                    `/(therapist)/patients/${item.child.id}?tab=goals`,
                  )
                }
              >
                <Ionicons name="flag" size={20} color={Colors.success[500]} />
                <Text style={styles.quickActionText}>Goals</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() =>
                  router.push(
                    `/(therapist)/patients/${item.child.id}?tab=sessions`,
                  )
                }
              >
                <Ionicons
                  name="calendar"
                  size={20}
                  color={Colors.primary[500]}
                />
                <Text style={styles.quickActionText}>Sessions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() =>
                  router.push(
                    `/(therapist)/patients/${item.child.id}?tab=screening`,
                  )
                }
              >
                <Ionicons
                  name="clipboard"
                  size={20}
                  color={Colors.secondary[500]}
                />
                <Text style={styles.quickActionText}>Screening</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.secondary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("therapist.myPatients")}
        </Text>
        {pendingCount > 0 && (
          <View
            style={[
              styles.pendingCounter,
              { backgroundColor: colors.secondary },
            ]}
          >
            <Text style={styles.pendingCounterText}>
              {pendingCount} {t("therapist.pendingRequests").toLowerCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t("common.search") + "..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Filters */}
      <View style={styles.tabsContainer}>
        {(["all", "active", "pending"] as TabFilter[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              { backgroundColor: colors.surfaceVariant },
              activeTab === tab && { backgroundColor: colors.secondary },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "all"
                ? `${t("common.all") || "All"} (${patients.length})`
                : tab === "active"
                  ? `${t("goals.active")} (${activeCount})`
                  : `${t("therapist.pendingRequests")} (${pendingCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Patient List */}
      {filteredPatients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="people-outline"
            size={80}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {activeTab === "pending"
              ? t("therapist.noPendingRequests") || "No pending requests"
              : activeTab === "active"
                ? t("therapist.noActivePatients") || "No active patients"
                : t("therapist.noPatients")}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {t("therapist.parentsEnrollChildren")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          renderItem={renderPatient}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.secondary}
            />
          }
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
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
  pendingCounter: {
    backgroundColor: Colors.secondary[500],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  pendingCounterText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: "#fff",
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: ComponentStyle.borderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    paddingVertical: Spacing.xs,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
  },
  activeTab: {
    backgroundColor: Colors.secondary[500],
  },
  tabText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: Typography.fontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  patientCard: {
    marginBottom: Spacing.md,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary[500],
  },
  cardHeader: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  patientInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  patientName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadge: {
    backgroundColor: Colors.success[50],
  },
  pendingBadge: {
    backgroundColor: Colors.secondary[50],
  },
  declinedBadge: {
    backgroundColor: Colors.error[50],
  },
  statusText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "capitalize",
  },
  ageText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  parentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  parentName: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.tertiary,
  },
  diagnosisRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  diagnosisText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.primary[600],
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  quickAction: {
    alignItems: "center",
    gap: 4,
  },
  quickActionText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
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
});
