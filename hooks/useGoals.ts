import { supabase } from '@/lib/supabase';
import { DailyLog, Goal } from '@/types/database.types';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

interface UseGoalsResult {
  goals: Goal[];
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
  createGoal: (data: Omit<Goal, 'id' | 'is_active' | 'created_at' | 'created_by'>) => Promise<{ data: Goal | null; error: any }>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<{ error: any }>;
  deleteGoal: (id: string) => Promise<{ error: any }>;
  logProgress: (data: {
    goalId: string;
    childId: string;
    achievedValue?: number;
    notes?: string;
    starsEarned?: number;
  }) => Promise<{ data: DailyLog | null; error: any }>;
}

export function useGoals(patientTherapistId?: string): UseGoalsResult {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchGoals = useCallback(async () => {
    if (!patientTherapistId) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('patient_therapist_id', patientTherapistId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError);
    } else {
      setGoals(data || []);
    }

    setLoading(false);
  }, [patientTherapistId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async (data: Omit<Goal, 'id' | 'is_active' | 'created_at' | 'created_by'>) => {
    if (!user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data: newGoal, error: insertError } = await supabase
      .from('goals')
      .insert({
        ...data,
        created_by: user.id,
      })
      .select()
      .single();

    if (!insertError && newGoal) {
      setGoals(prev => [newGoal, ...prev]);
    }

    return { data: newGoal, error: insertError };
  };

  const updateGoal = async (id: string, data: Partial<Goal>) => {
    const { error: updateError } = await supabase
      .from('goals')
      .update(data)
      .eq('id', id);

    if (!updateError) {
      setGoals(prev =>
        prev.map(goal => (goal.id === id ? { ...goal, ...data } : goal))
      );
    }

    return { error: updateError };
  };

  const deleteGoal = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (!deleteError) {
      setGoals(prev => prev.filter(goal => goal.id !== id));
    }

    return { error: deleteError };
  };

  const logProgress = async (data: {
    goalId: string;
    childId: string;
    achievedValue?: number;
    notes?: string;
    starsEarned?: number;
  }) => {
    if (!user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data: newLog, error: insertError } = await supabase
      .from('daily_logs')
      .insert({
        goal_id: data.goalId,
        child_id: data.childId,
        logged_by: user.id,
        achieved_value: data.achievedValue,
        notes: data.notes,
        stars_earned: data.starsEarned || 1,
      })
      .select()
      .single();

    return { data: newLog, error: insertError };
  };

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    logProgress,
  };
}

/**
 * Hook for fetching a single goal by ID
 */
interface UseGoalResult {
  goal: Goal | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

export function useGoal(goalId?: string): UseGoalResult {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchGoal = useCallback(async () => {
    if (!goalId) {
      setGoal(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (fetchError) {
      setError(fetchError);
    } else {
      setGoal(data);
    }

    setLoading(false);
  }, [goalId]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  return {
    goal,
    loading,
    error,
    refetch: fetchGoal,
  };
}

/**
 * Hook for daily logs
 */
interface UseDailyLogsResult {
  logs: DailyLog[];
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
  logProgress: (data: {
    goalId: string;
    childId: string;
    achievedValue?: number;
    notes?: string;
    starsEarned?: number;
  }) => Promise<{ data: DailyLog | null; error: any }>;
}

export function useDailyLogs(goalId?: string): UseDailyLogsResult {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchLogs = useCallback(async () => {
    if (!goalId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('goal_id', goalId)
      .order('log_date', { ascending: false });

    if (fetchError) {
      setError(fetchError);
    } else {
      setLogs(data || []);
    }

    setLoading(false);
  }, [goalId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logProgress = async (data: {
    goalId: string;
    childId: string;
    achievedValue?: number;
    notes?: string;
    starsEarned?: number;
  }) => {
    if (!user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data: newLog, error: insertError } = await supabase
      .from('daily_logs')
      .insert({
        goal_id: data.goalId,
        child_id: data.childId,
        logged_by: user.id,
        achieved_value: data.achievedValue,
        notes: data.notes,
        stars_earned: data.starsEarned || 1,
      })
      .select()
      .single();

    if (!insertError && newLog) {
      setLogs(prev => [newLog, ...prev]);
    }

    return { data: newLog, error: insertError };
  };

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
    logProgress,
  };
}

/**
 * Hook for fetching goals for all children of a parent
 * Used on parent dashboard for Goal Tracker Preview
 */
interface UseParentGoalsResult {
  goals: (Goal & { child?: { first_name: string; id: string } })[];
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

export function useParentGoals(childIds: string[]): UseParentGoalsResult {
  const [goals, setGoals] = useState<(Goal & { child?: { first_name: string; id: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchGoals = useCallback(async () => {
    if (!childIds.length) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch goals where the child is in our list
    const { data, error: fetchError } = await supabase
      .from('goals')
      .select(`
        *,
        child:children!inner(id, first_name)
      `)
      .in('child_id', childIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      setError(fetchError);
    } else {
      setGoals(data || []);
    }

    setLoading(false);
  }, [childIds.join(',')]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
  };
}

/**
 * Hook for fetching goals created by a therapist
 * Used on therapist dashboard for Goal Tracker Preview
 */
interface UseTherapistGoalsResult {
  goals: Goal[];
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

export function useTherapistGoals(): UseTherapistGoalsResult {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('created_by', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      setError(fetchError);
    } else {
      setGoals(data || []);
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
  };
}

export default useGoals;
