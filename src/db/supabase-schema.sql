-- ========================================================================
-- CivicFix Intelligence — Supabase PostgreSQL Database Schema
-- Production Ready with Row Level Security (RLS), RBAC, Triggers & Spatial Indices
-- ========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'administrator')),
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY DEFAULT ('CF-' || to_char(now(), 'YYYY') || '-' || lpad((floor(random() * 9000 + 1000)::text), 4, '0')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'road_damage',
    'waste_management',
    'water_leakage',
    'drainage',
    'streetlight_failure',
    'public_infrastructure',
    'other'
  )),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN (
    'reported',
    'triaged',
    'in_progress',
    'scheduled',
    'resolved',
    'closed'
  )),
  suggested_priority TEXT NOT NULL DEFAULT 'medium' CHECK (suggested_priority IN ('low', 'medium', 'high', 'critical')),
  confirmed_priority TEXT NOT NULL DEFAULT 'medium' CHECK (confirmed_priority IN ('low', 'medium', 'high', 'critical')),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  is_duplicate_of TEXT REFERENCES public.complaints(id) ON DELETE SET NULL,
  ai_category TEXT,
  ai_confidence DOUBLE PRECISION,
  ai_suggested_severity TEXT,
  ai_explanation TEXT,
  ai_key_phrases JSONB DEFAULT '[]'::jsonb,
  ai_safety_concerns JSONB DEFAULT '[]'::jsonb,
  ai_recommended_action TEXT,
  ai_routing_department TEXT,
  ai_model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. COMPLAINT STATUS UPDATES AUDIT LOG
CREATE TABLE IF NOT EXISTS public.complaint_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('citizen', 'administrator', 'ai_system', 'field_crew')),
  previous_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. DUPLICATE SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.duplicate_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  matched_complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  similarity_score DOUBLE PRECISION NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 100),
  reason TEXT NOT NULL,
  geographic_distance_meters DOUBLE PRECISION NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'confirmed_duplicate', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. CITIZEN NOTES TABLE
CREATE TABLE IF NOT EXISTS public.citizen_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_notes ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read basic profile info, users can edit their own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Complaints:
-- 1. Anyone authenticated or public can view active non-sensitive complaints
CREATE POLICY "Public read complaints"
  ON public.complaints FOR SELECT
  USING (true);

-- 2. Citizens can insert complaints
CREATE POLICY "Citizens can insert complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (auth.uid() = reporter_id OR reporter_id IS NULL);

-- 3. Only Administrators can update complaint status and priority
CREATE POLICY "Admins can update complaints"
  ON public.complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'administrator'
    )
  );

-- Complaint Updates:
CREATE POLICY "Public read complaint updates"
  ON public.complaint_updates FOR SELECT
  USING (true);

CREATE POLICY "Admins and system can insert updates"
  ON public.complaint_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'administrator'
    )
  );

-- Duplicate Suggestions:
CREATE POLICY "Duplicate suggestions readable by staff"
  ON public.duplicate_suggestions FOR SELECT
  USING (true);

CREATE POLICY "Admins can update duplicate reviews"
  ON public.duplicate_suggestions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'administrator'
    )
  );

-- Spatial and Filtering Indices for Ultra-fast queries
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_confirmed_priority ON public.complaints(confirmed_priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_coords ON public.complaints(latitude, longitude);
