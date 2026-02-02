import { supabase } from '@/lib/supabase';
import { Child } from '@/types/database.types';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

interface UseChildrenResult {
  children: Child[];
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
  addChild: (data: Omit<Child, 'id' | 'parent_id' | 'total_stars' | 'created_at'>) => Promise<{ data: Child | null; error: any }>;
  updateChild: (id: string, data: Partial<Child>) => Promise<{ error: any }>;
  deleteChild: (id: string) => Promise<{ error: any }>;
}

export function useChildren(): UseChildrenResult {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchChildren = useCallback(async () => {
    if (!user) {
      setChildren([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError);
    } else {
      setChildren(data || []);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const addChild = async (data: Omit<Child, 'id' | 'parent_id' | 'total_stars' | 'created_at'>) => {
    if (!user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data: newChild, error: insertError } = await supabase
      .from('children')
      .insert({
        ...data,
        parent_id: user.id,
      })
      .select()
      .single();

    if (!insertError && newChild) {
      setChildren(prev => [newChild, ...prev]);
    }

    return { data: newChild, error: insertError };
  };

  const updateChild = async (id: string, data: Partial<Child>) => {
    const { error: updateError } = await supabase
      .from('children')
      .update(data)
      .eq('id', id);

    if (!updateError) {
      setChildren(prev =>
        prev.map(child => (child.id === id ? { ...child, ...data } : child))
      );
    }

    return { error: updateError };
  };

  const deleteChild = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('children')
      .delete()
      .eq('id', id);

    if (!deleteError) {
      setChildren(prev => prev.filter(child => child.id !== id));
    }

    return { error: deleteError };
  };

  return {
    children,
    loading,
    error,
    refetch: fetchChildren,
    addChild,
    updateChild,
    deleteChild,
  };
}

/**
 * Hook to get a single child by ID
 */
export function useChild(childId: string | undefined) {
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchChild = useCallback(async () => {
    if (!childId) {
      setChild(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single();

    if (fetchError) {
      setError(fetchError);
    } else {
      setChild(data);
    }

    setLoading(false);
  }, [childId]);

  useEffect(() => {
    fetchChild();
  }, [fetchChild]);

  return { child, loading, error, refetch: fetchChild };
}

export default useChildren;
