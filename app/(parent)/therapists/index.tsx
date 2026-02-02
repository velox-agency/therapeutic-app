import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Card } from "@/components/ui";
import { Colors, ComponentStyle, Spacing, Typography } from "@/constants/theme";
import { supabase } from "@/lib/supabase";

interface Therapist {
  id: string;
  full_name: string;
  avatar_url: string | null;
  therapist_profile: {
    specialization: string | null;
    bio: string | null;
    years_experience: number | null;
    clinic_address: string | null;
    is_verified: boolean;
  } | null;
}

const SPECIALIZATIONS = [
  { id: "all", label: "All" },
  { id: "speech_language", label: "Speech-Language" },
  { id: "occupational", label: "Occupational" },
  { id: "behavioral", label: "Behavioral" },
  { id: "special_education", label: "Special Ed" },
];

export default function FindTherapistScreen() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");

  useEffect(() => {
    loadTherapists();
  }, []);

  useEffect(() => {
    filterTherapists();
  }, [searchQuery, selectedSpecialization, therapists]);

  const loadTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          avatar_url,
          therapist_profile:therapist_profiles(
            specialization,
            bio,
            years_experience,
            clinic_address,
            is_verified
          )
        `,
        )
        .eq("role", "therapist")
        .order("full_name");

      if (error) throw error;

      // Transform data to flatten the therapist_profile array to a single object
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        therapist_profile: item.therapist_profile?.[0] || null,
      }));

      setTherapists(transformedData);
    } catch (error) {
      console.error("Error loading therapists:", error);
      Alert.alert("Error", "Failed to load therapists");
    } finally {
      setLoading(false);
    }
  };

  const filterTherapists = () => {
    let filtered = [...therapists];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.full_name.toLowerCase().includes(query) ||
          t.therapist_profile?.specialization?.toLowerCase().includes(query) ||
          t.therapist_profile?.clinic_address?.toLowerCase().includes(query),
      );
    }

    // Filter by specialization
    if (selectedSpecialization !== "all") {
      filtered = filtered.filter((t) =>
        t.therapist_profile?.specialization
          ?.toLowerCase()
          .includes(selectedSpecialization.toLowerCase()),
      );
    }

    // Sort verified therapists first
    filtered.sort((a, b) => {
      const aVerified = a.therapist_profile?.is_verified ? 1 : 0;
      const bVerified = b.therapist_profile?.is_verified ? 1 : 0;
      return bVerified - aVerified;
    });

    setFilteredTherapists(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTherapists();
    setRefreshing(false);
  };

  const handleTherapistPress = (therapist: Therapist) => {
    router.push({
      pathname: "/(parent)/therapists/[id]",
      params: { id: therapist.id },
    } as any);
  };

  const renderTherapistCard = ({
    item,
    index,
  }: {
    item: Therapist;
    index: number;
  }) => (
    <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
      <TouchableOpacity
        onPress={() => handleTherapistPress(item)}
        activeOpacity={0.7}
      >
        <Card variant="elevated" style={styles.therapistCard}>
          <View style={styles.cardHeader}>
            <Avatar name={item.full_name} source={item.avatar_url} size="lg" />
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.therapistName} numberOfLines={1}>
                  {item.full_name}
                </Text>
                {item.therapist_profile?.is_verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={Colors.primary[500]}
                    />
                  </View>
                )}
              </View>
              {item.therapist_profile?.specialization && (
                <Text style={styles.specialization}>
                  {item.therapist_profile.specialization}
                </Text>
              )}
              {item.therapist_profile?.years_experience && (
                <Text style={styles.experience}>
                  {item.therapist_profile.years_experience} years experience
                </Text>
              )}
            </View>
          </View>

          {item.therapist_profile?.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {item.therapist_profile.bio}
            </Text>
          )}

          {item.therapist_profile?.clinic_address && (
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={Colors.text.tertiary}
              />
              <Text style={styles.location} numberOfLines={1}>
                {item.therapist_profile.clinic_address}
              </Text>
            </View>
          )}

          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.viewProfileButton}
              onPress={() => handleTherapistPress(item)}
            >
              <Text style={styles.viewProfileText}>View Profile</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.primary[500]}
              />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Finding therapists...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.headerContent}>
          <Text style={styles.title}>Find a Therapist 🔍</Text>
          <Text style={styles.subtitle}>Connect with verified specialists</Text>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        entering={FadeInDown.delay(150).duration(500)}
        style={styles.searchContainer}
      >
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.text.tertiary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, specialty, or location..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
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
      </Animated.View>

      {/* Specialization Filter */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <FlatList
          horizontal
          data={SPECIALIZATIONS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedSpecialization(item.id)}
              style={[
                styles.filterChip,
                selectedSpecialization === item.id && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedSpecialization === item.id &&
                    styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {/* Therapists List */}
      <FlatList
        data={filteredTherapists}
        keyExtractor={(item) => item.id}
        renderItem={renderTherapistCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary[500]}
          />
        }
        ListEmptyComponent={
          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons
              name="people-outline"
              size={48}
              color={Colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No therapists found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || selectedSpecialization !== "all"
                ? "Try adjusting your search or filters"
                : "Therapists will appear here once they register"}
            </Text>
          </Card>
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
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
  headerContent: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: ComponentStyle.borderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    ...ComponentStyle.shadow.small,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.primary,
    paddingVertical: Spacing.xs,
  },
  filterList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: ComponentStyle.borderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  filterChipText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.secondary,
  },
  filterChipTextActive: {
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  therapistCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  therapistName: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
    padding: 2,
  },
  specialization: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.primary[600],
    marginTop: 2,
  },
  experience: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  bio: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  location: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.small,
    color: Colors.text.tertiary,
    flex: 1,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  viewProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  viewProfileText: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    marginTop: Spacing.lg,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.primaryBold,
    fontSize: Typography.fontSize.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.body,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
});
