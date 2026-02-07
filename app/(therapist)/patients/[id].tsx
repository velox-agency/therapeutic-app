import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Button, Card, Input } from "@/components/ui";
import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
    FrequencyPeriod,
    GoalCategory,
    GoalPriority,
} from "@/types/database.types";

const CATEGORIES = [
  { id: "communication", label: "Communication", icon: "chatbubbles" },
  { id: "social", label: "Social Skills", icon: "people" },
  { id: "motor", label: "Motor Skills", icon: "hand-left" },
  { id: "cognitive", label: "Cognitive", icon: "bulb" },
  { id: "self_care", label: "Self Care", icon: "heart" },
  { id: "behavior", label: "Behavior", icon: "happy" },
];

const PRIORITIES = [
  { id: "low", label: "Low", color: Colors.success[500] },
  { id: "medium", label: "Medium", color: Colors.secondary[500] },
  { id: "high", label: "High", color: Colors.error[500] },
];

const FREQUENCIES = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

interface ChildDetail {
  id: string;
  first_name: string;
  birth_date: string;
  gender: string | null;
  avatar_seed: string | null;
  total_stars: number;
  parent: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
  };
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  status: string;
  category: string | null;
  due_date: string | null;
  created_at: string;
}

interface Session {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  session_type: string;
  location: string | null;
  therapist_notes: string | null;
  parent_visible_notes: string | null;
}

interface Screening {
  id: string;
  total_score: number;
  risk_level: string;
  completed_at: string;
  status: string;
}

type TabType = "overview" | "goals" | "sessions" | "screening";

export default function PatientDetailScreen() {
  const { id, tab: initialTab } = useLocalSearchParams<{
    id: string;
    tab?: string;
  }>();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>(
    (initialTab as TabType) || "overview",
  );
  const [child, setChild] = useState<ChildDetail | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Goal Modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    category: "communication" as GoalCategory,
    priority: "medium" as GoalPriority,
    frequency: "daily" as FrequencyPeriod,
    targetFrequency: "1",
    targetValue: "",
    unit: "",
  });
  const [savingGoal, setSavingGoal] = useState(false);

  const resetGoalForm = () => {
    setGoalForm({
      title: "",
      description: "",
      category: "communication",
      priority: "medium",
      frequency: "daily",
      targetFrequency: "1",
      targetValue: "",
      unit: "",
    });
  };

  const loadChildData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Get child info
      const { data: childData, error: childError } = await supabase
        .from("children")
        .select(
          "id, first_name, birth_date, gender, avatar_seed, total_stars, parent_id",
        )
        .eq("id", id)
        .single();

      if (childError) throw childError;

      // Get parent info separately
      const { data: parentData, error: parentError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, phone")
        .eq("id", childData.parent_id)
        .single();

      if (parentError) throw parentError;

      // Combine child and parent data
      const combinedData = {
        ...childData,
        parent: parentData,
      };

      setChild(combinedData as unknown as ChildDetail);

      // Get goals
      const { data: goalsData } = await supabase
        .from("goals")
        .select("*")
        .eq("child_id", id)
        .order("created_at", { ascending: false });

      setGoals(goalsData || []);

      // Get patient_therapist record for this child
      const { data: ptData } = await supabase
        .from("patient_therapist")
        .select("id")
        .eq("child_id", id)
        .eq("therapist_id", user?.id)
        .single();

      // Get sessions for this enrollment
      if (ptData) {
        const { data: sessionsData } = await supabase
          .from("sessions")
          .select("*")
          .eq("patient_therapist_id", ptData.id)
          .order("scheduled_at", { ascending: false });

        setSessions(sessionsData || []);
      } else {
        setSessions([]);
      }

      // Get screenings
      const { data: screeningsData } = await supabase
        .from("screenings")
        .select("*")
        .eq("child_id", id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      setScreenings(screeningsData || []);
    } catch (error) {
      console.error("Error loading child data:", error);
      Alert.alert("Error", "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadChildData();
  }, [loadChildData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildData();
    setRefreshing(false);
  };

  const handleCreateGoal = async () => {
    if (!goalForm.title.trim()) {
      Alert.alert("Error", "Please enter a goal title");
      return;
    }

    setSavingGoal(true);
    try {
      const { error } = await supabase.from("goals").insert({
        child_id: id,
        created_by: user?.id,
        title: goalForm.title.trim(),
        description: goalForm.description.trim() || null,
        category: goalForm.category,
        priority: goalForm.priority,
        target_frequency: parseInt(goalForm.targetFrequency) || 1,
        frequency_period: goalForm.frequency,
        target_value: goalForm.targetValue
          ? parseInt(goalForm.targetValue)
          : null,
        unit: goalForm.unit.trim() || null,
        status: "active",
        is_active: true,
      });

      if (error) throw error;

      setShowGoalModal(false);
      resetGoalForm();
      await loadChildData();
      Alert.alert("Success", "Goal created successfully!");
    } catch (error) {
      console.error("Error creating goal:", error);
      Alert.alert("Error", "Failed to create goal");
    } finally {
      setSavingGoal(false);
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, newValue: number) => {
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const newStatus = newValue >= goal.target_value ? "completed" : "active";

      const { error } = await supabase
        .from("goals")
        .update({
          current_value: newValue,
          status: newStatus,
        })
        .eq("id", goalId);

      if (error) throw error;
      await loadChildData();

      if (newStatus === "completed") {
        Alert.alert("🎉 Goal Completed!", "Great progress!");
      }
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

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

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high":
        return Colors.error[500];
      case "medium":
        return Colors.secondary[500];
      case "low":
        return Colors.success[500];
      default:
        return Colors.text.tertiary;
    }
  };

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

  if (!child) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.textSecondary}
        />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Patient not found
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="secondary"
        />
      </SafeAreaView>
    );
  }

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "person" },
    { key: "goals", label: "Goals", icon: "flag" },
    { key: "sessions", label: "Sessions", icon: "calendar" },
    { key: "screening", label: "Screening", icon: "clipboard" },
  ];

  const renderOverview = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.secondary}
        />
      }
    >
      {/* Child Profile Card */}
      <Card variant="elevated" style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Avatar name={child.first_name} size="xl" />
          <View style={styles.profileInfo}>
            <Text style={[styles.childName, { color: colors.text }]}>
              {child.first_name}
            </Text>
            <Text style={[styles.ageText, { color: colors.textSecondary }]}>
              {calculateAge(child.birth_date)} years old
            </Text>
            {child.gender && (
              <View style={styles.diagnosisBadge}>
                <Text style={styles.diagnosisText}>{child.gender}</Text>
              </View>
            )}
          </View>
        </View>

        {child.total_stars > 0 && (
          <View
            style={[styles.notesSection, { borderTopColor: colors.border }]}
          >
            <Text style={[styles.notesLabel, { color: colors.text }]}>
              Stars Earned
            </Text>
            <Text style={[styles.notesText, { color: colors.textSecondary }]}>
              ⭐ {child.total_stars}
            </Text>
          </View>
        )}
      </Card>

      {/* Parent Contact */}
      <Card variant="elevated" style={styles.contactCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Parent/Guardian
        </Text>
        <View style={styles.contactRow}>
          <Avatar
            name={child.parent.full_name}
            source={child.parent.avatar_url}
            size="md"
          />
          <View style={styles.contactInfo}>
            <Text style={[styles.contactName, { color: colors.text }]}>
              {child.parent.full_name}
            </Text>
            {child.parent.phone && (
              <Text
                style={[styles.contactPhone, { color: colors.textSecondary }]}
              >
                {child.parent.phone}
              </Text>
            )}
          </View>
        </View>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>
            {goals.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Goals
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>
            {sessions.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Sessions
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>
            {screenings.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Screenings
          </Text>
        </View>
      </View>

      {/* Recent Activity */}
      {goals.filter((g) => g.status === "active").length > 0 && (
        <Card variant="elevated" style={styles.activityCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Active Goals
          </Text>
          {goals
            .filter((g) => g.status === "active")
            .slice(0, 3)
            .map((goal) => (
              <View key={goal.id} style={styles.goalItem}>
                <Text style={[styles.goalTitle, { color: colors.text }]}>
                  {goal.title}
                </Text>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: colors.surfaceVariant },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          (goal.current_value / goal.target_value) * 100,
                          100,
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.progressText, { color: colors.textSecondary }]}
                >
                  {goal.current_value}/{goal.target_value}
                </Text>
              </View>
            ))}
        </Card>
      )}
    </ScrollView>
  );

  const renderGoals = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: colors.text }]}>
          Goals ({goals.length})
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Colors.secondary[50] }]}
          onPress={() => setShowGoalModal(true)}
        >
          <Ionicons name="add" size={24} color={Colors.secondary[500]} />
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyTab}>
          <Ionicons
            name="flag-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No goals set yet
          </Text>
          <Button
            title="Create First Goal"
            onPress={() => setShowGoalModal(true)}
            variant="secondary"
            size="small"
          />
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50)}>
              <Card
                variant="elevated"
                style={
                  StyleSheet.flatten([
                    styles.goalCard,
                    item.status === "completed" && styles.completedCard,
                  ]) as ViewStyle
                }
              >
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleRow}>
                    <View
                      style={[
                        styles.categoryDot,
                        {
                          backgroundColor:
                            item.category === "communication"
                              ? Colors.primary[500]
                              : item.category === "motor"
                                ? Colors.success[500]
                                : Colors.secondary[500],
                        },
                      ]}
                    />
                    <Text
                      style={[styles.goalCardTitle, { color: colors.text }]}
                    >
                      {item.title}
                    </Text>
                  </View>
                  {item.status === "completed" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={Colors.success[500]}
                    />
                  )}
                </View>

                {item.description && (
                  <Text
                    style={[
                      styles.goalDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.description}
                  </Text>
                )}

                <View style={styles.goalProgress}>
                  <View
                    style={[
                      styles.progressBarLarge,
                      { backgroundColor: colors.surfaceVariant },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFillLarge,
                        {
                          width: `${Math.min(
                            (item.current_value / item.target_value) * 100,
                            100,
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.progressTextLarge,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.current_value}/{item.target_value} (
                    {Math.round((item.current_value / item.target_value) * 100)}
                    %)
                  </Text>
                </View>

                {item.status === "active" && (
                  <View
                    style={[
                      styles.goalActions,
                      { borderTopColor: colors.border },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.incrementButton,
                        { backgroundColor: colors.surfaceVariant },
                      ]}
                      onPress={() =>
                        handleUpdateGoalProgress(
                          item.id,
                          Math.max(0, item.current_value - 10),
                        )
                      }
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={Colors.error[500]}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.incrementButton,
                        { backgroundColor: colors.surfaceVariant },
                      ]}
                      onPress={() =>
                        handleUpdateGoalProgress(
                          item.id,
                          item.current_value + 10,
                        )
                      }
                    >
                      <Ionicons
                        name="add"
                        size={20}
                        color={Colors.success[500]}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const renderSessions = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: colors.text }]}>
          Sessions ({sessions.length})
        </Text>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyTab}>
          <Ionicons
            name="calendar-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No sessions scheduled
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50)}>
              <Card variant="elevated" style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View>
                    <Text style={[styles.sessionDate, { color: colors.text }]}>
                      {new Date(item.scheduled_at).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text
                      style={[
                        styles.sessionTime,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {new Date(item.scheduled_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.sessionStatusBadge,
                      {
                        backgroundColor:
                          item.status === "completed"
                            ? Colors.success[50]
                            : item.status === "scheduled"
                              ? Colors.primary[50]
                              : Colors.error[50],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sessionStatusText,
                        {
                          color:
                            item.status === "completed"
                              ? Colors.success[600]
                              : item.status === "scheduled"
                                ? Colors.primary[600]
                                : Colors.error[600],
                        },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.sessionDetails}>
                  <View style={styles.sessionDetail}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.sessionDetailText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.duration_minutes} min
                    </Text>
                  </View>
                  <View style={styles.sessionDetail}>
                    <Ionicons
                      name="videocam-outline"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.sessionDetailText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.session_type}
                    </Text>
                  </View>
                </View>

                {item.therapist_notes && (
                  <Text
                    style={[
                      styles.sessionNotes,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.therapist_notes}
                  </Text>
                )}
              </Card>
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const renderScreening = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: colors.text }]}>
          Screenings ({screenings.length})
        </Text>
      </View>

      {screenings.length === 0 ? (
        <View style={styles.emptyTab}>
          <Ionicons
            name="clipboard-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No screenings completed
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Parent can complete M-CHAT-R screening from their app
          </Text>
        </View>
      ) : (
        <FlatList
          data={screenings}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50)}>
              <Card variant="elevated" style={styles.screeningCard}>
                <View style={styles.screeningHeader}>
                  <View>
                    <Text
                      style={[styles.screeningType, { color: colors.text }]}
                    >
                      M-CHAT-R
                    </Text>
                    <Text
                      style={[
                        styles.screeningDate,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {new Date(item.completed_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: getRiskColor(item.risk_level) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.riskText,
                        { color: getRiskColor(item.risk_level) },
                      ]}
                    >
                      {item.risk_level} Risk
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.scoreSection,
                    {
                      borderTopColor: colors.border,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.scoreLabel, { color: colors.textSecondary }]}
                  >
                    Total Score
                  </Text>
                  <Text
                    style={[
                      styles.scoreValue,
                      { color: getRiskColor(item.risk_level) },
                    ]}
                  >
                    {item.total_score}/20
                  </Text>
                </View>

                <Button
                  title="View Details"
                  onPress={() => {
                    // Navigate to screening detail
                  }}
                  variant="outline"
                  size="small"
                  fullWidth
                />
              </Card>
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Patient Details
        </Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Tabs */}
      <View
        style={[styles.tabsContainer, { borderBottomColor: colors.border }]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={
                  activeTab === tab.key
                    ? Colors.secondary[500]
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textSecondary },
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "goals" && renderGoals()}
        {activeTab === "sessions" && renderSessions()}
        {activeTab === "screening" && renderScreening()}
      </View>

      {/* Goal Creation Modal */}
      <Modal
        visible={showGoalModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGoalModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Create Goal
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowGoalModal(false);
                  resetGoalForm();
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Goal Title */}
              <Input
                label="Goal Title *"
                placeholder="e.g., Say 5 new words"
                value={goalForm.title}
                onChangeText={(text) =>
                  setGoalForm((prev) => ({ ...prev, title: text }))
                }
                leftIcon="flag"
              />

              {/* Description */}
              <View style={styles.modalInputSpacing}>
                <Input
                  label="Description (Optional)"
                  placeholder="Describe the goal in detail..."
                  value={goalForm.description}
                  onChangeText={(text) =>
                    setGoalForm((prev) => ({ ...prev, description: text }))
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Category */}
              <View style={styles.modalSection}>
                <Text
                  style={[styles.modalSectionTitle, { color: colors.text }]}
                >
                  Category
                </Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryOption,
                        { backgroundColor: colors.surfaceVariant },
                        goalForm.category === cat.id &&
                          styles.categoryOptionSelected,
                      ]}
                      onPress={() =>
                        setGoalForm((prev) => ({
                          ...prev,
                          category: cat.id as GoalCategory,
                        }))
                      }
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={20}
                        color={
                          goalForm.category === cat.id
                            ? Colors.primary[500]
                            : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.categoryOptionText,
                          { color: colors.textSecondary },
                          goalForm.category === cat.id &&
                            styles.categoryOptionTextSelected,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Priority */}
              <View style={styles.modalSection}>
                <Text
                  style={[styles.modalSectionTitle, { color: colors.text }]}
                >
                  Priority
                </Text>
                <View style={styles.priorityRow}>
                  {PRIORITIES.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.priorityOption,
                        {
                          borderColor: p.color,
                          backgroundColor: colors.surface,
                        },
                        goalForm.priority === p.id && {
                          backgroundColor: p.color,
                        },
                      ]}
                      onPress={() =>
                        setGoalForm((prev) => ({
                          ...prev,
                          priority: p.id as GoalPriority,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          {
                            color:
                              goalForm.priority === p.id
                                ? Colors.surface
                                : p.color,
                          },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Frequency */}
              <View style={styles.modalSection}>
                <Text
                  style={[styles.modalSectionTitle, { color: colors.text }]}
                >
                  Target Frequency
                </Text>
                <View style={styles.frequencyRow}>
                  <TextInput
                    style={[
                      styles.frequencyInput,
                      {
                        backgroundColor: colors.surfaceVariant,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={goalForm.targetFrequency}
                    onChangeText={(text) =>
                      setGoalForm((prev) => ({
                        ...prev,
                        targetFrequency: text,
                      }))
                    }
                    keyboardType="number-pad"
                    placeholder="1"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.frequencyLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    times per
                  </Text>
                  <View style={styles.frequencyOptions}>
                    {FREQUENCIES.map((f) => (
                      <TouchableOpacity
                        key={f.id}
                        style={[
                          styles.frequencyOption,
                          {
                            backgroundColor: colors.surfaceVariant,
                            borderColor: colors.border,
                          },
                          goalForm.frequency === f.id &&
                            styles.frequencyOptionSelected,
                        ]}
                        onPress={() =>
                          setGoalForm((prev) => ({
                            ...prev,
                            frequency: f.id as FrequencyPeriod,
                          }))
                        }
                      >
                        <Text
                          style={[
                            styles.frequencyOptionText,
                            { color: colors.textSecondary },
                            goalForm.frequency === f.id &&
                              styles.frequencyOptionTextSelected,
                          ]}
                        >
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Target Value & Unit */}
              <View style={styles.modalSection}>
                <Text
                  style={[styles.modalSectionTitle, { color: colors.text }]}
                >
                  Target Measurement (Optional)
                </Text>
                <Text
                  style={[
                    styles.modalSectionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Set a specific target for progress tracking
                </Text>
                <View style={styles.targetRow}>
                  <View style={styles.targetInputContainer}>
                    <TextInput
                      style={[
                        styles.targetInput,
                        {
                          backgroundColor: colors.surfaceVariant,
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      value={goalForm.targetValue}
                      onChangeText={(text) =>
                        setGoalForm((prev) => ({ ...prev, targetValue: text }))
                      }
                      keyboardType="number-pad"
                      placeholder="5"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                  <View style={styles.unitInputContainer}>
                    <TextInput
                      style={[
                        styles.targetInput,
                        {
                          backgroundColor: colors.surfaceVariant,
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      value={goalForm.unit}
                      onChangeText={(text) =>
                        setGoalForm((prev) => ({ ...prev, unit: text }))
                      }
                      placeholder="seconds"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>
                <Text
                  style={[styles.exampleText, { color: colors.textSecondary }]}
                >
                  💡 Example: "5 seconds" of eye contact, "10 words" spoken
                </Text>
              </View>

              <Button
                title={savingGoal ? "Creating..." : "Create Goal"}
                onPress={handleCreateGoal}
                variant="secondary"
                fullWidth
                loading={savingGoal}
                disabled={savingGoal || !goalForm.title.trim()}
                style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  errorText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    marginVertical: Spacing.md,
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
    ...ComponentStyle.shadow.small,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  tabsContainer: {
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.md,
    gap: Spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Colors.secondary[500],
  },
  tabText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.tertiary,
  },
  activeTabText: {
    color: Colors.secondary[500],
    fontWeight: Typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  profileCard: {
    marginBottom: Spacing.md,
  },
  profileHeader: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  childName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  ageText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  diagnosisBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: Spacing.sm,
  },
  diagnosisText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.primary[600],
  },
  notesSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  notesLabel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  notesText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  contactCard: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  contactPhone: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: ComponentStyle.borderRadius.lg,
    alignItems: "center",
    ...ComponentStyle.shadow.small,
  },
  statValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary[500],
  },
  statLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.tertiary,
  },
  activityCard: {
    marginBottom: Spacing.md,
  },
  goalItem: {
    marginBottom: Spacing.md,
  },
  goalTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.success[500],
    borderRadius: 3,
  },
  progressText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.tertiary,
  },
  tabContent: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  tabTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  emptyTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.secondary,
  },
  emptySubtext: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.tertiary,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  goalCard: {
    marginBottom: Spacing.md,
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success[500],
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  goalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  goalCardTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  goalDescription: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  goalProgress: {
    marginTop: Spacing.md,
  },
  progressBarLarge: {
    height: 10,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 5,
    marginBottom: Spacing.xs,
  },
  progressFillLarge: {
    height: "100%",
    backgroundColor: Colors.success[500],
    borderRadius: 5,
  },
  progressTextLarge: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  goalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  incrementButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionCard: {
    marginBottom: Spacing.md,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sessionDate: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  sessionTime: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  sessionStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sessionStatusText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "capitalize",
  },
  sessionDetails: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  sessionDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  sessionDetailText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  sessionNotes: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.tertiary,
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
  screeningCard: {
    marginBottom: Spacing.md,
  },
  screeningHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  screeningType: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  screeningDate: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  riskBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 10,
  },
  riskText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "capitalize",
  },
  scoreSection: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  scoreLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.tertiary,
  },
  scoreValue: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  inputLabel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: ComponentStyle.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.secondary[500],
    borderColor: Colors.secondary[500],
  },
  categoryButtonText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
    textTransform: "capitalize",
  },
  categoryButtonTextActive: {
    color: "#fff",
    fontWeight: Typography.fontWeight.semibold,
  },
  modalInputSpacing: {
    marginTop: Spacing.md,
  },
  modalSection: {
    marginTop: Spacing.lg,
  },
  modalSectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  modalSectionSubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryOption: {
    width: "31%",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: ComponentStyle.borderRadius.md,
    backgroundColor: Colors.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryOptionSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  categoryOptionText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  categoryOptionTextSelected: {
    color: Colors.primary[500],
    fontWeight: Typography.fontWeight.semibold,
  },
  priorityRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: ComponentStyle.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    backgroundColor: Colors.surface,
  },
  priorityText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.semibold,
  },
  frequencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  frequencyInput: {
    width: 60,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: ComponentStyle.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    textAlign: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  frequencyLabel: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
  frequencyOptions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  frequencyOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: ComponentStyle.borderRadius.md,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  frequencyOptionSelected: {
    backgroundColor: Colors.secondary[500],
    borderColor: Colors.secondary[500],
  },
  frequencyOptionText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  frequencyOptionTextSelected: {
    color: Colors.surface,
    fontWeight: Typography.fontWeight.semibold,
  },
  targetRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  targetInputContainer: {
    flex: 1,
  },
  unitInputContainer: {
    flex: 2,
  },
  targetInput: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: ComponentStyle.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exampleText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
    fontStyle: "italic",
  },
});
