import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Button, Card } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface Session {
  id: string;
  patient_therapist_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  location: string | null;
  session_type: "in_person" | "virtual" | "home_visit";
  therapist_notes: string | null;
  parent_visible_notes: string | null;
  child: {
    id: string;
    first_name: string;
  };
  parent: {
    full_name: string;
  };
}

interface EnrolledChild {
  id: string;
  patient_therapist_id: string;
  first_name: string;
  parent_name: string;
}

type ViewMode = "calendar" | "list";

export default function TherapistSessionsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [enrolledChildren, setEnrolledChildren] = useState<EnrolledChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // New session modal
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    patient_therapist_id: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    duration_minutes: "45",
    location: "",
    session_type: "in_person" as "in_person" | "virtual" | "home_visit",
  });

  // Session details modal
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      // Get all patient_therapist records for this therapist
      const { data: enrollments, error: enrollError } = await supabase
        .from("patient_therapist")
        .select("id, child_id")
        .eq("therapist_id", user.id);

      if (enrollError) throw enrollError;

      if (!enrollments || enrollments.length === 0) {
        setSessions([]);
        setLoading(false);
        return;
      }

      const ptIds = enrollments.map((e) => e.id);

      // Get sessions for these enrollments
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("*")
        .in("patient_therapist_id", ptIds)
        .order("scheduled_at", { ascending: true });

      if (sessionsError) throw sessionsError;

      // Get children data
      const childIds = enrollments.map((e) => e.child_id);
      const { data: children } = await supabase
        .from("children")
        .select("id, first_name, parent_id")
        .in("id", childIds);

      // Get parents data
      const parentIds = [...new Set(children?.map((c) => c.parent_id) || [])];
      const { data: parents } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", parentIds);

      // Format sessions
      const formattedSessions: Session[] = (sessionsData || []).map(
        (session) => {
          const enrollment = enrollments.find(
            (e) => e.id === session.patient_therapist_id,
          );
          const child = children?.find((c) => c.id === enrollment?.child_id);
          const parent = parents?.find((p) => p.id === child?.parent_id);

          return {
            id: session.id,
            patient_therapist_id: session.patient_therapist_id,
            scheduled_at: session.scheduled_at,
            duration_minutes: session.duration_minutes,
            status: session.status,
            location: session.location,
            session_type: session.session_type,
            therapist_notes: session.therapist_notes,
            parent_visible_notes: session.parent_visible_notes,
            child: {
              id: child?.id || "",
              first_name: child?.first_name || "Unknown",
            },
            parent: {
              full_name: parent?.full_name || "Unknown",
            },
          };
        },
      );

      setSessions(formattedSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadEnrolledChildren = useCallback(async () => {
    if (!user) return;

    try {
      const { data: enrollments, error } = await supabase
        .from("patient_therapist")
        .select("id, child_id")
        .eq("therapist_id", user.id)
        .eq("status", "active");

      if (error) throw error;

      if (!enrollments || enrollments.length === 0) {
        setEnrolledChildren([]);
        return;
      }

      const childIds = enrollments.map((e) => e.child_id);

      const { data: children } = await supabase
        .from("children")
        .select("id, first_name, parent_id")
        .in("id", childIds);

      const parentIds = [...new Set(children?.map((c) => c.parent_id) || [])];
      const { data: parents } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", parentIds);

      const formattedChildren: EnrolledChild[] = (children || []).map(
        (child) => {
          const enrollment = enrollments.find((e) => e.child_id === child.id);
          const parent = parents?.find((p) => p.id === child.parent_id);

          return {
            id: child.id,
            patient_therapist_id: enrollment?.id || "",
            first_name: child.first_name,
            parent_name: parent?.full_name || "Unknown",
          };
        },
      );

      setEnrolledChildren(formattedChildren);
    } catch (error) {
      console.error("Error loading enrolled children:", error);
    }
  }, [user]);

  useEffect(() => {
    loadSessions();
    loadEnrolledChildren();
  }, [loadSessions, loadEnrolledChildren]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadSessions(), loadEnrolledChildren()]);
    setRefreshing(false);
  };

  // Calendar marked dates
  const markedDates = useMemo(() => {
    const marks: { [date: string]: any } = {};

    sessions.forEach((session) => {
      const date = new Date(session.scheduled_at).toISOString().split("T")[0];
      const isCompleted = session.status === "completed";
      const isCancelled = session.status === "cancelled";

      if (!marks[date]) {
        marks[date] = {
          marked: true,
          dots: [],
        };
      }

      marks[date].dots.push({
        key: session.id,
        color: isCompleted
          ? Colors.success[500]
          : isCancelled
            ? Colors.error[500]
            : Colors.primary[500],
      });
    });

    // Add selected date styling
    if (marks[selectedDate]) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: Colors.primary[500],
      };
    } else {
      marks[selectedDate] = {
        selected: true,
        selectedColor: Colors.primary[500],
      };
    }

    return marks;
  }, [sessions, selectedDate]);

  // Sessions for selected date
  const sessionsForDate = useMemo(() => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.scheduled_at)
        .toISOString()
        .split("T")[0];
      return sessionDate === selectedDate;
    });
  }, [sessions, selectedDate]);

  const handleCreateSession = async () => {
    if (!sessionForm.patient_therapist_id) {
      Alert.alert("Error", "Please select a patient");
      return;
    }

    setSavingSession(true);
    try {
      const scheduledAt = new Date(
        `${sessionForm.date}T${sessionForm.time}:00`,
      ).toISOString();

      const { error } = await supabase.from("sessions").insert({
        patient_therapist_id: sessionForm.patient_therapist_id,
        scheduled_at: scheduledAt,
        duration_minutes: parseInt(sessionForm.duration_minutes, 10),
        location: sessionForm.location || null,
        session_type: sessionForm.session_type,
        status: "scheduled",
      });

      if (error) throw error;

      setShowNewSessionModal(false);
      setSessionForm({
        patient_therapist_id: "",
        date: new Date().toISOString().split("T")[0],
        time: "10:00",
        duration_minutes: "45",
        location: "",
        session_type: "in_person",
      });
      await loadSessions();
      Alert.alert("Success", "Session scheduled successfully!");
    } catch (error) {
      console.error("Error creating session:", error);
      Alert.alert("Error", "Failed to schedule session");
    } finally {
      setSavingSession(false);
    }
  };

  const handleUpdateSessionStatus = async (
    sessionId: string,
    newStatus: "completed" | "cancelled" | "no_show",
  ) => {
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", sessionId);

      if (error) throw error;

      await loadSessions();
      setShowSessionDetails(false);
      Alert.alert(
        "Success",
        `Session marked as ${newStatus.replace("_", " ")}`,
      );
    } catch (error) {
      console.error("Error updating session:", error);
      Alert.alert("Error", "Failed to update session");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedSession) return;

    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from("sessions")
        .update({
          therapist_notes: sessionNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedSession.id);

      if (error) throw error;

      await loadSessions();
      Alert.alert("Success", "Notes saved successfully");
    } catch (error) {
      console.error("Error saving notes:", error);
      Alert.alert("Error", "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return Colors.success[500];
      case "cancelled":
        return Colors.error[500];
      case "no_show":
        return Colors.secondary[500];
      default:
        return Colors.primary[500];
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "virtual":
        return "videocam";
      case "home_visit":
        return "home";
      default:
        return "location";
    }
  };

  const renderSessionCard = ({
    item,
    index,
  }: {
    item: Session;
    index: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity
        onPress={() => {
          setSelectedSession(item);
          setSessionNotes(item.therapist_notes || "");
          setShowSessionDetails(true);
        }}
      >
        <Card
          variant="elevated"
          style={
            StyleSheet.flatten([
              styles.sessionCard,
              { backgroundColor: colors.surface },
            ]) as ViewStyle
          }
        >
          <View style={styles.sessionHeader}>
            <View style={styles.timeContainer}>
              <Text style={[styles.sessionTime, { color: colors.primary }]}>
                {formatTime(item.scheduled_at)}
              </Text>
              <Text style={[styles.duration, { color: colors.textSecondary }]}>
                {item.duration_minutes} min
              </Text>
            </View>

            <View style={styles.sessionInfo}>
              <View style={styles.patientRow}>
                <Avatar name={item.child.first_name} size="sm" />
                <Text style={[styles.patientName, { color: colors.text }]}>
                  {item.child.first_name}
                </Text>
              </View>
              <Text
                style={[styles.parentName, { color: colors.textSecondary }]}
              >
                Parent: {item.parent.full_name}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>

          {item.location && (
            <View style={styles.locationRow}>
              <Ionicons
                name={getSessionTypeIcon(item.session_type) as any}
                size={16}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.locationText, { color: colors.textSecondary }]}
              >
                {item.location}
              </Text>
            </View>
          )}

          {item.therapist_notes && (
            <View style={styles.notesPreview}>
              <Ionicons
                name="document-text"
                size={14}
                color={colors.textTertiary}
              />
              <Text
                style={[
                  styles.notesPreviewText,
                  { color: colors.textTertiary },
                ]}
                numberOfLines={1}
              >
                {item.therapist_notes}
              </Text>
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
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("navigation.sessions")}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primaryLight }]}
          onPress={() => setShowNewSessionModal(true)}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View
        style={[styles.viewToggle, { backgroundColor: colors.surfaceVariant }]}
      >
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "calendar" && [
              styles.toggleActive,
              { backgroundColor: colors.surface },
            ],
          ]}
          onPress={() => setViewMode("calendar")}
        >
          <Ionicons
            name="calendar"
            size={18}
            color={
              viewMode === "calendar" ? colors.primary : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.toggleText,
              viewMode === "calendar" && {
                color: colors.text,
                fontWeight: "600",
              },
              {
                color:
                  viewMode === "calendar" ? colors.text : colors.textSecondary,
              },
            ]}
          >
            {t("common.calendar")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "list" && [
              styles.toggleActive,
              { backgroundColor: colors.surface },
            ],
          ]}
          onPress={() => setViewMode("list")}
        >
          <Ionicons
            name="list"
            size={18}
            color={viewMode === "list" ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.toggleText,
              {
                color: viewMode === "list" ? colors.text : colors.textSecondary,
              },
            ]}
          >
            {t("common.list")}
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "calendar" ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Calendar */}
          <Card
            variant="elevated"
            style={
              StyleSheet.flatten([
                styles.calendarCard,
                { backgroundColor: colors.surface },
              ]) as ViewStyle
            }
          >
            <Calendar
              current={selectedDate}
              onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              markingType="multi-dot"
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.textSecondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: "#ffffff",
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                textDisabledColor: colors.textTertiary,
                dotColor: colors.primary,
                selectedDotColor: "#ffffff",
                arrowColor: colors.primary,
                monthTextColor: colors.text,
                textDayFontFamily: Typography.fontFamily.primary,
                textMonthFontFamily: Typography.fontFamily.primaryBold,
                textDayHeaderFontFamily: Typography.fontFamily.primary,
              }}
            />
          </Card>

          {/* Sessions for selected date */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {formatDate(selectedDate)}
            </Text>
            {sessionsForDate.length > 0 ? (
              sessionsForDate.map((session, index) => (
                <View key={session.id}>
                  {renderSessionCard({ item: session, index })}
                </View>
              ))
            ) : (
              <Card
                variant="outlined"
                style={
                  StyleSheet.flatten([
                    styles.emptyCard,
                    { borderColor: colors.border },
                  ]) as ViewStyle
                }
              >
                <Ionicons
                  name="calendar-outline"
                  size={48}
                  color={colors.textTertiary}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t("sessions.noSessionsToday")}
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {t("sessions.scheduleIsClear")}
                </Text>
                <Button
                  title={t("sessions.scheduleSession")}
                  variant="secondary"
                  size="small"
                  onPress={() => {
                    setSessionForm((prev) => ({ ...prev, date: selectedDate }));
                    setShowNewSessionModal(true);
                  }}
                  style={styles.scheduleButton}
                />
              </Card>
            )}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSessionCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Card
              variant="outlined"
              style={
                StyleSheet.flatten([
                  styles.emptyCard,
                  { borderColor: colors.border },
                ]) as ViewStyle
              }
            >
              <Ionicons
                name="calendar-outline"
                size={48}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t("sessions.noSessions") || "No Sessions"}
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
                {t("sessions.scheduleWithPatients")}
              </Text>
              <Button
                title={t("sessions.scheduleSession")}
                variant="secondary"
                size="small"
                onPress={() => setShowNewSessionModal(true)}
                style={styles.scheduleButton}
              />
            </Card>
          }
        />
      )}

      {/* New Session Modal */}
      <Modal
        visible={showNewSessionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewSessionModal(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}
          >
            <TouchableOpacity onPress={() => setShowNewSessionModal(false)}>
              <Text style={[styles.cancelButton, { color: colors.error }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              New Session
            </Text>
            <TouchableOpacity
              onPress={handleCreateSession}
              disabled={savingSession}
            >
              {savingSession ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.saveButton, { color: colors.primary }]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Patient Selection */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Patient
            </Text>
            <View style={styles.patientSelection}>
              {enrolledChildren.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.patientOption,
                    { borderColor: colors.border },
                    sessionForm.patient_therapist_id ===
                      child.patient_therapist_id && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primaryLight,
                    },
                  ]}
                  onPress={() =>
                    setSessionForm((prev) => ({
                      ...prev,
                      patient_therapist_id: child.patient_therapist_id,
                    }))
                  }
                >
                  <Avatar name={child.first_name} size="sm" />
                  <View style={styles.patientOptionInfo}>
                    <Text
                      style={[styles.patientOptionName, { color: colors.text }]}
                    >
                      {child.first_name}
                    </Text>
                    <Text
                      style={[
                        styles.patientOptionParent,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {child.parent_name}
                    </Text>
                  </View>
                  {sessionForm.patient_therapist_id ===
                    child.patient_therapist_id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
              {enrolledChildren.length === 0 && (
                <Text
                  style={[styles.noPatients, { color: colors.textSecondary }]}
                >
                  No active patients. Accept enrollment requests first.
                </Text>
              )}
            </View>

            {/* Date */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Date
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={sessionForm.date}
              onChangeText={(text) =>
                setSessionForm((prev) => ({ ...prev, date: text }))
              }
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textTertiary}
            />

            {/* Time */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Time
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={sessionForm.time}
              onChangeText={(text) =>
                setSessionForm((prev) => ({ ...prev, time: text }))
              }
              placeholder="HH:MM"
              placeholderTextColor={colors.textTertiary}
            />

            {/* Duration */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Duration (minutes)
            </Text>
            <View style={styles.durationOptions}>
              {["30", "45", "60", "90"].map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.durationOption,
                    { borderColor: colors.border },
                    sessionForm.duration_minutes === dur && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primaryLight,
                    },
                  ]}
                  onPress={() =>
                    setSessionForm((prev) => ({
                      ...prev,
                      duration_minutes: dur,
                    }))
                  }
                >
                  <Text
                    style={[
                      styles.durationText,
                      {
                        color:
                          sessionForm.duration_minutes === dur
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    {dur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Session Type */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Session Type
            </Text>
            <View style={styles.typeOptions}>
              {[
                { value: "in_person", label: "In Person", icon: "location" },
                { value: "virtual", label: "Virtual", icon: "videocam" },
                { value: "home_visit", label: "Home Visit", icon: "home" },
              ].map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    { borderColor: colors.border },
                    sessionForm.session_type === type.value && {
                      borderColor: colors.primary,
                      backgroundColor: colors.primaryLight,
                    },
                  ]}
                  onPress={() =>
                    setSessionForm((prev) => ({
                      ...prev,
                      session_type: type.value as
                        | "in_person"
                        | "virtual"
                        | "home_visit",
                    }))
                  }
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={
                      sessionForm.session_type === type.value
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          sessionForm.session_type === type.value
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Location */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Location (optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={sessionForm.location}
              onChangeText={(text) =>
                setSessionForm((prev) => ({ ...prev, location: text }))
              }
              placeholder="e.g., Clinic Room 3"
              placeholderTextColor={colors.textTertiary}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Session Details Modal */}
      <Modal
        visible={showSessionDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSessionDetails(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}
          >
            <TouchableOpacity onPress={() => setShowSessionDetails(false)}>
              <Text
                style={[styles.cancelButton, { color: colors.textSecondary }]}
              >
                Close
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Session Details
            </Text>
            <View style={{ width: 50 }} />
          </View>

          {selectedSession && (
            <ScrollView style={styles.modalContent}>
              {/* Session Info */}
              <Card
                variant="elevated"
                style={
                  StyleSheet.flatten([
                    styles.detailCard,
                    { backgroundColor: colors.surface },
                  ]) as ViewStyle
                }
              >
                <View style={styles.detailRow}>
                  <Avatar name={selectedSession.child.first_name} size="lg" />
                  <View style={styles.detailInfo}>
                    <Text style={[styles.detailName, { color: colors.text }]}>
                      {selectedSession.child.first_name}
                    </Text>
                    <Text
                      style={[
                        styles.detailParent,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Parent: {selectedSession.parent.full_name}
                    </Text>
                  </View>
                </View>

                <View
                  style={[styles.detailMeta, { borderTopColor: colors.border }]}
                >
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="calendar"
                      size={18}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.metaText, { color: colors.text }]}>
                      {formatDate(selectedSession.scheduled_at)}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="time"
                      size={18}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.metaText, { color: colors.text }]}>
                      {formatTime(selectedSession.scheduled_at)}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="hourglass"
                      size={18}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.metaText, { color: colors.text }]}>
                      {selectedSession.duration_minutes} min
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusLarge,
                    {
                      backgroundColor:
                        getStatusColor(selectedSession.status) + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusLargeText,
                      { color: getStatusColor(selectedSession.status) },
                    ]}
                  >
                    {selectedSession.status.replace("_", " ").toUpperCase()}
                  </Text>
                </View>
              </Card>

              {/* Actions for scheduled sessions */}
              {selectedSession.status === "scheduled" && (
                <Card
                  variant="elevated"
                  style={
                    StyleSheet.flatten([
                      styles.detailCard,
                      { backgroundColor: colors.surface },
                    ]) as ViewStyle
                  }
                >
                  <Text style={[styles.sectionLabel, { color: colors.text }]}>
                    Mark Session As
                  </Text>
                  <View style={styles.actionButtons}>
                    <Button
                      title="Completed"
                      variant="primary"
                      onPress={() =>
                        handleUpdateSessionStatus(
                          selectedSession.id,
                          "completed",
                        )
                      }
                      style={styles.actionButton}
                    />
                    <Button
                      title="No Show"
                      variant="outline"
                      onPress={() =>
                        handleUpdateSessionStatus(selectedSession.id, "no_show")
                      }
                      style={styles.actionButton}
                    />
                    <Button
                      title="Cancelled"
                      variant="outline"
                      onPress={() =>
                        Alert.alert(
                          "Cancel Session",
                          "Are you sure you want to cancel this session?",
                          [
                            { text: "No", style: "cancel" },
                            {
                              text: "Yes",
                              style: "destructive",
                              onPress: () =>
                                handleUpdateSessionStatus(
                                  selectedSession.id,
                                  "cancelled",
                                ),
                            },
                          ],
                        )
                      }
                      style={
                        StyleSheet.flatten([
                          styles.actionButton,
                          { borderColor: colors.error },
                        ]) as ViewStyle
                      }
                    />
                  </View>
                </Card>
              )}

              {/* Private Notes (only visible to therapist) */}
              <Card
                variant="elevated"
                style={
                  StyleSheet.flatten([
                    styles.detailCard,
                    { backgroundColor: colors.surface },
                  ]) as ViewStyle
                }
              >
                <View style={styles.notesHeader}>
                  <Text style={[styles.sectionLabel, { color: colors.text }]}>
                    Private Notes
                  </Text>
                  <View style={styles.privateBadge}>
                    <Ionicons
                      name="lock-closed"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.privateText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Only you can see this
                    </Text>
                  </View>
                </View>
                <TextInput
                  style={[
                    styles.notesInput,
                    {
                      backgroundColor: colors.surfaceVariant,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={sessionNotes}
                  onChangeText={setSessionNotes}
                  placeholder="Add session notes, observations, progress..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <Button
                  title={savingNotes ? "Saving..." : "Save Notes"}
                  variant="secondary"
                  onPress={handleSaveNotes}
                  disabled={savingNotes}
                  style={styles.saveNotesButton}
                />
              </Card>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingVertical: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: "700",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  viewToggle: {
    flexDirection: "row",
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.md,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    gap: 6,
    borderRadius: 10,
  },
  toggleActive: {},
  toggleText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
  },
  calendarCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
    borderRadius: 16,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  sessionCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 20,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  timeContainer: {
    alignItems: "center",
    minWidth: 60,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
  },
  sessionTime: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: "600",
  },
  duration: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
    marginTop: 2,
  },
  sessionInfo: {
    flex: 1,
    gap: 4,
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 4,
  },
  patientName: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.body,
    fontWeight: "600",
  },
  parentName: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontFamily: Typography.fontFamily.primarySemiBold,
    fontSize: Typography.fontSize.tiny,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    gap: 8,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  locationText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
  },
  notesPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: 8,
  },
  notesPreviewText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.caption,
    flex: 1,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  scheduleButton: {
    marginTop: Spacing.md,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: "600",
  },
  saveButton: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  inputLabel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.small,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
  },
  patientSelection: {
    gap: Spacing.sm,
  },
  patientOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: 10,
    gap: Spacing.sm,
  },
  patientOptionInfo: {
    flex: 1,
  },
  patientOptionName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: "600",
  },
  patientOptionParent: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
  },
  noPatients: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
  durationOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  durationOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: 10,
  },
  durationText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: "600",
  },
  typeOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  typeOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: 10,
    gap: 4,
  },
  typeText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
  },
  // Detail modal
  detailCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: "600",
  },
  detailParent: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
  },
  detailMeta: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  metaItem: {
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
  },
  statusLarge: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  statusLargeText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: "600",
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  actionButtons: {
    gap: Spacing.sm,
  },
  actionButton: {
    marginBottom: 0,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  privateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  privateText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.tiny,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: Spacing.md,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    minHeight: 120,
  },
  saveNotesButton: {
    marginTop: Spacing.md,
  },
});
