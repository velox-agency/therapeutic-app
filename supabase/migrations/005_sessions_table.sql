-- ============================================
-- Sessions & Patient-Therapist Tables Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Create patient_therapist table if it doesn't exist
-- This manages enrollment relationships between children and therapists
CREATE TABLE IF NOT EXISTS public.patient_therapist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'ended')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, therapist_id)
);

-- Create sessions table for therapy appointments
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_therapist_id UUID NOT NULL REFERENCES public.patient_therapist(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  location TEXT,
  session_type TEXT DEFAULT 'in_person' CHECK (session_type IN ('in_person', 'virtual', 'home_visit')),
  therapist_notes TEXT, -- Private notes only for therapist
  parent_visible_notes TEXT, -- Notes visible to parent
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patient_therapist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Patient-Therapist RLS Policies
-- ============================================

-- Therapists can view their enrollments
CREATE POLICY "Therapists can view their patient enrollments"
  ON public.patient_therapist FOR SELECT
  USING (auth.uid() = therapist_id);

-- Parents can view enrollments for their children
CREATE POLICY "Parents can view their children enrollments"
  ON public.patient_therapist FOR SELECT
  USING (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  );

-- Parents can create enrollment requests for their children
CREATE POLICY "Parents can create enrollment requests"
  ON public.patient_therapist FOR INSERT
  WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  );

-- Therapists can update enrollment status (accept/decline)
CREATE POLICY "Therapists can update enrollment status"
  ON public.patient_therapist FOR UPDATE
  USING (auth.uid() = therapist_id);

-- ============================================
-- Sessions RLS Policies
-- ============================================

-- Therapists can view their sessions
CREATE POLICY "Therapists can view their sessions"
  ON public.sessions FOR SELECT
  USING (
    patient_therapist_id IN (
      SELECT id FROM public.patient_therapist WHERE therapist_id = auth.uid()
    )
  );

-- Parents can view sessions for their children
CREATE POLICY "Parents can view their children sessions"
  ON public.sessions FOR SELECT
  USING (
    patient_therapist_id IN (
      SELECT pt.id FROM public.patient_therapist pt
      JOIN public.children c ON pt.child_id = c.id
      WHERE c.parent_id = auth.uid()
    )
  );

-- Therapists can create sessions
CREATE POLICY "Therapists can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (
    patient_therapist_id IN (
      SELECT id FROM public.patient_therapist WHERE therapist_id = auth.uid()
    )
  );

-- Therapists can update their sessions
CREATE POLICY "Therapists can update sessions"
  ON public.sessions FOR UPDATE
  USING (
    patient_therapist_id IN (
      SELECT id FROM public.patient_therapist WHERE therapist_id = auth.uid()
    )
  );

-- ============================================
-- Additional RLS Policies for Therapist Access
-- ============================================

-- Therapists can view children they're enrolled with (including pending)
-- Using a subquery that doesn't cause recursion
DROP POLICY IF EXISTS "Therapists can view enrolled children" ON public.children;
CREATE POLICY "Therapists can view enrolled children"
  ON public.children FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_therapist pt
      WHERE pt.child_id = children.id 
      AND pt.therapist_id = auth.uid()
    )
  );

-- Therapists can view screenings for enrolled children  
DROP POLICY IF EXISTS "Therapists can view enrolled children screenings" ON public.screenings;
CREATE POLICY "Therapists can view enrolled children screenings"
  ON public.screenings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_therapist pt
      WHERE pt.child_id = screenings.child_id 
      AND pt.therapist_id = auth.uid() 
      AND pt.status = 'active'
    )
  );

-- Therapists can view/create goals for enrolled children
DROP POLICY IF EXISTS "Therapists can view enrolled children goals" ON public.goals;
CREATE POLICY "Therapists can view enrolled children goals"
  ON public.goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_therapist pt
      WHERE pt.child_id = goals.child_id 
      AND pt.therapist_id = auth.uid() 
      AND pt.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Therapists can create goals for enrolled children" ON public.goals;
CREATE POLICY "Therapists can create goals for enrolled children"
  ON public.goals FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.patient_therapist pt
      WHERE pt.child_id = goals.child_id 
      AND pt.therapist_id = auth.uid() 
      AND pt.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Therapists can update their goals" ON public.goals;
CREATE POLICY "Therapists can update their goals"
  ON public.goals FOR UPDATE
  USING (created_by = auth.uid());

-- NOTE: Removed "Therapists can view enrolled children parents" policy
-- as it causes infinite recursion. Parent info should be fetched via 
-- a SECURITY DEFINER function or edge function instead.

-- Grant permissions
GRANT ALL ON public.patient_therapist TO authenticated;
GRANT ALL ON public.sessions TO authenticated;
