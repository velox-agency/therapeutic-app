-- ============================================
-- Therapeutic App - Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Drop existing tables (clean slate)
-- WARNING: This will delete all data!
-- Comment out if you want to preserve data
-- ============================================
DROP TABLE IF EXISTS public.daily_logs CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.screenings CASCADE;
DROP TABLE IF EXISTS public.children CASCADE;
DROP TABLE IF EXISTS public.therapist_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================
-- STEP 2: Create tables
-- ============================================

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'therapist')),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Therapist profiles table
CREATE TABLE public.therapist_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialization TEXT,
  license_number TEXT,
  clinic_address TEXT,
  bio TEXT,
  years_experience INTEGER,
  is_verified BOOLEAN DEFAULT FALSE
);

-- Children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT,
  avatar_seed TEXT,
  total_stars INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Screenings table
CREATE TABLE public.screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  total_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  follow_up_requested BOOLEAN DEFAULT FALSE
);

-- Goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_therapist_id UUID,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('communication', 'social', 'motor', 'cognitive', 'self_care', 'behavior')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  target_frequency INTEGER DEFAULT 1,
  frequency_period TEXT CHECK (frequency_period IN ('daily', 'weekly', 'monthly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  target_value INTEGER,
  unit TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily logs table
CREATE TABLE public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.profiles(id),
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  achieved_value INTEGER,
  notes TEXT,
  stars_earned INTEGER DEFAULT 1,
  log_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: Enable RLS on all tables
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create RLS policies
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Therapist profiles policies
CREATE POLICY "Therapists can view own therapist profile"
  ON public.therapist_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Therapists can update own therapist profile"
  ON public.therapist_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Children policies
CREATE POLICY "Parents can view own children"
  ON public.children FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert own children"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update own children"
  ON public.children FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete own children"
  ON public.children FOR DELETE
  USING (auth.uid() = parent_id);

-- Screenings policies
CREATE POLICY "Parents can view own screenings"
  ON public.screenings FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert own screenings"
  ON public.screenings FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

-- Goals policies
CREATE POLICY "Users can view goals for their children"
  ON public.goals FOR SELECT
  USING (
    auth.uid() = created_by OR
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Users can insert goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = created_by);

-- Daily logs policies
CREATE POLICY "Users can view own logs"
  ON public.daily_logs FOR SELECT
  USING (auth.uid() = logged_by);

CREATE POLICY "Users can insert logs"
  ON public.daily_logs FOR INSERT
  WITH CHECK (auth.uid() = logged_by);

-- ============================================
-- STEP 5: Create trigger for auto profile creation
-- ============================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- If the user is a therapist, create therapist profile too
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'parent') = 'therapist' THEN
    INSERT INTO public.therapist_profiles (id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 6: Grant permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
