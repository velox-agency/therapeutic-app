// Generated types from Supabase schema

export type UserRole = 'parent' | 'therapist';
export type RiskLevel = 'low' | 'medium' | 'high';
export type PatientStatus = 'active' | 'paused' | 'completed';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';
export type ResourceType = 'article' | 'video' | 'exercise';
export type ResourceCategory = 'meltdown' | 'sensory' | 'communication';
export type BadgeRequirementType = 'stars_total' | 'goals_completed' | 'streak_days';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TherapistProfile {
  id: string;
  specialization: string | null;
  license_number: string | null;
  clinic_address: string | null;
  bio: string | null;
  years_experience: number | null;
  is_verified: boolean;
}

export interface Child {
  id: string;
  parent_id: string;
  first_name: string;
  birth_date: string;
  gender: string | null;
  avatar_seed: string | null;
  total_stars: number;
  created_at: string;
}

export interface Screening {
  id: string;
  child_id: string;
  parent_id: string;
  answers: Record<string, boolean>; // 20 M-CHAT-R answers
  total_score: number;
  risk_level: RiskLevel;
  completed_at: string;
  follow_up_requested: boolean;
}

export interface PatientTherapist {
  id: string;
  child_id: string;
  therapist_id: string;
  status: PatientStatus;
  started_at: string;
  notes: string | null;
}

export type GoalCategory = 'communication' | 'social' | 'motor' | 'cognitive' | 'self_care' | 'behavior';
export type GoalPriority = 'low' | 'medium' | 'high';
export type FrequencyPeriod = 'daily' | 'weekly' | 'monthly';
export type GoalStatus = 'active' | 'paused' | 'completed';

export interface Goal {
  id: string;
  patient_therapist_id?: string | null;
  child_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  priority: GoalPriority;
  target_frequency: number;
  frequency_period: FrequencyPeriod;
  status: GoalStatus;
  target_value?: number | null;
  unit?: string | null;
  start_date?: string;
  end_date?: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface DailyLog {
  id: string;
  goal_id: string;
  child_id: string;
  logged_by: string;
  logged_at: string;
  achieved_value: number | null;
  notes: string | null;
  stars_earned: number;
  log_date: string;
  created_at: string;
}

export interface Session {
  id: string;
  patient_therapist_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: SessionStatus;
  location: string | null;
  session_notes: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  requirement_type: BadgeRequirementType;
  requirement_value: number;
}

export interface ChildBadge {
  id: string;
  child_id: string;
  badge_id: string;
  earned_at: string;
}

export interface Resource {
  id: string;
  title: string;
  content: string | null;
  type: ResourceType;
  category: ResourceCategory;
  media_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

// Supabase Database type structure
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; role: UserRole; full_name: string };
        Update: Partial<Profile>;
      };
      therapist_profiles: {
        Row: TherapistProfile;
        Insert: Partial<TherapistProfile> & { id: string };
        Update: Partial<TherapistProfile>;
      };
      children: {
        Row: Child;
        Insert: Partial<Child> & { parent_id: string; first_name: string; birth_date: string };
        Update: Partial<Child>;
      };
      screenings: {
        Row: Screening;
        Insert: Partial<Screening> & { child_id: string; parent_id: string; answers: Record<string, boolean>; total_score: number; risk_level: RiskLevel };
        Update: Partial<Screening>;
      };
      patient_therapist: {
        Row: PatientTherapist;
        Insert: Partial<PatientTherapist> & { child_id: string; therapist_id: string };
        Update: Partial<PatientTherapist>;
      };
      goals: {
        Row: Goal;
        Insert: Partial<Goal> & { patient_therapist_id: string; title: string; created_by: string };
        Update: Partial<Goal>;
      };
      daily_logs: {
        Row: DailyLog;
        Insert: Partial<DailyLog> & { goal_id: string; child_id: string; logged_by: string };
        Update: Partial<DailyLog>;
      };
      sessions: {
        Row: Session;
        Insert: Partial<Session> & { patient_therapist_id: string; scheduled_at: string };
        Update: Partial<Session>;
      };
      badges: {
        Row: Badge;
        Insert: Partial<Badge> & { name: string; requirement_type: BadgeRequirementType; requirement_value: number };
        Update: Partial<Badge>;
      };
      child_badges: {
        Row: ChildBadge;
        Insert: Partial<ChildBadge> & { child_id: string; badge_id: string };
        Update: Partial<ChildBadge>;
      };
      resources: {
        Row: Resource;
        Insert: Partial<Resource> & { title: string; type: ResourceType; category: ResourceCategory };
        Update: Partial<Resource>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      risk_level: RiskLevel;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
