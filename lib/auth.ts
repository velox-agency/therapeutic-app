import { getCurrentSession, getCurrentUser, signIn, signOut, supabase } from './supabase';

// Re-export everything from supabase
export { getCurrentSession, getCurrentUser, signIn, signOut, supabase };

// Auth helpers with profile creation
import { Profile, UserRole } from '@/types/database.types';

interface SignUpWithProfileData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export const signUpWithProfile = async ({
  email,
  password,
  fullName,
  role,
  phone,
}: SignUpWithProfileData) => {
  // Sign up the user with metadata
  // The database trigger will automatically create the profile
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        phone: phone || null,
      },
    },
  });

  if (authError || !authData.user) {
    return { data: null, error: authError };
  }

  // The profile is created by the database trigger (handle_new_user)
  // We just need to fetch it
  // Note: There might be a slight delay, so we'll return the user data
  // and the profile will be loaded on auth state change

  return {
    data: {
      user: authData.user,
      profile: {
        id: authData.user.id,
        role,
        full_name: fullName,
        phone: phone || null,
      }
    },
    error: null
  };
};

export const getProfile = async (userId: string): Promise<{ data: Profile | null; error: any }> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};
