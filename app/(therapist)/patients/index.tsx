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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface PatientEnrollment {
  id: string;
  status: "pending" | "active" | "declined";
  created_at: string;
  child: {
    id: string;
    first_name: string;
    last_name: string | null;
    date_of_birth: string;
    avatar_url: string | null;
    diagnosis_status: string | null;
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
  const [patients, setPatients] = useState<PatientEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const loadPatients = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("patient_therapist")
        .select(
          `
          id,
          status,
          created_at,
          child:child_id(
            id,
            first_name,
            last_name,
            date_of_birth,
            avatar_url,
            diagnosis_status
          ),
          parent:parent_id(
            id,
            full_name,
            avatar_url
          )
        `,
        )
        .eq("therapist_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((item: any) => ({
        id: item.id,
        status: item.status,
        created_at: item.created_at,
        child: item.child,
        parent: item.parent,
      })) as PatientEnrollment[];

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
            <Avatar
              name={item.child.first_name}
              source={item.child.avatar_url}
              size="lg"
            />
            <View style={styles.patientInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.patientName}>
                  {item.child.first_name} {item.child.last_name || ""}
                </Text>
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
                {calculateAge(item.child.date_of_birth)} years old
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

          {item.child.diagnosis_status && (
            <View style={styles.diagnosisRow}>
              <Ionicons
                name="medical-outline"
                size={16}
                color={Colors.primary[500]}
              />
              <Text style={styles.diagnosisText}>
                {item.child.diagnosis_status}
              </Text>
            </View>
          )}

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
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Patients</Text>
        {pendingCount > 0 && (
          <View style={styles.pendingCounter}>
            <Text style={styles.pendingCounterText}>
              {pendingCount} pending
            </Text>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.tertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.text.tertiary}
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
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "all"
                ? `All (${patients.length})`
                : tab === "active"
                  ? `Active (${activeCount})`
                  : `Pending (${pendingCount})`}
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
            color={Colors.text.tertiary}
          />
          <Text style={styles.emptyTitle}>
            {activeTab === "pending"
              ? "No pending requests"
              : activeTab === "active"
                ? "No active patients"
                : "No patients yet"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === "pending"
              ? "You'll see enrollment requests here when parents request your services"
              : "When parents request enrollment, accept them to start managing their therapy"}
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
              tintColor={Colors.secondary[500]}
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
