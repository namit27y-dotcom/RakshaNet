-- Migration: 20260904000000_auth_roles_architecture.sql
-- Project: Rakshak (ghvsrynwjvchnuqkkzzo)
-- Description: Unified Auth & Role Architecture, Role Check Constraints, Trigger Automation, and RLS Hardening

-- 1. Ensure public.profiles table schema matches requirements
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Normalize existing role values in profiles
UPDATE public.profiles
SET role = CASE
  WHEN LOWER(role) LIKE '%citizen%' THEN 'citizen'
  WHEN LOWER(role) LIKE '%volunteer%' THEN 'volunteer'
  WHEN LOWER(role) LIKE '%ngo%' THEN 'ngo'
  WHEN LOWER(role) LIKE '%responder%' THEN 'responder'
  WHEN LOWER(role) LIKE '%admin%' THEN 'admin'
  ELSE 'citizen'
END;

-- Ensure role check constraint matches allowed roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('citizen', 'volunteer', 'ngo', 'responder', 'admin'));

-- Update any legacy rakshanet.org emails in profiles
UPDATE public.profiles 
SET email = REPLACE(email, '@rakshanet.org', '@rakshak.org')
WHERE email LIKE '%@rakshanet.org';

-- 2. Enhanced get_user_role() function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT role INTO v_role 
  FROM public.profiles 
  WHERE id = auth.uid();

  RETURN COALESCE(v_role, 'citizen');
END;
$$;

-- 3. Secure Trigger on auth.users for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_phone TEXT;
  v_org TEXT;
BEGIN
  -- Extract and sanitize role from metadata
  v_role := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'citizen'));
  
  -- Prevent normal signups from self-assigning 'admin'
  IF v_role NOT IN ('citizen', 'volunteer', 'ngo', 'responder') THEN
    v_role := 'citizen';
  END IF;

  v_full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    'Citizen'
  );

  v_phone := new.raw_user_meta_data->>'phone';
  v_org := new.raw_user_meta_data->>'organization_name';

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    phone,
    organization_name,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    v_full_name,
    new.email,
    v_role,
    v_phone,
    v_org,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    organization_name = COALESCE(EXCLUDED.organization_name, public.profiles.organization_name),
    updated_at = now();

  RETURN new;
END;
$$;

-- Ensure trigger is bound to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Prevent Client-Side Role Escalation Trigger on profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if role is being changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Allow change only if executing context is service_role or current user is an admin
    IF (auth.jwt() ->> 'role' != 'service_role') AND (COALESCE(public.get_user_role(), '') != 'admin') THEN
      RAISE EXCEPTION 'Unauthorized: Users cannot modify their assigned platform role.';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 5. Row Level Security on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_select_on_profiles" ON public.profiles;
DROP POLICY IF EXISTS "allow_users_to_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_user_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_user_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_admin_manage_profiles" ON public.profiles;

-- Users can read only their own profile, or admins can read all
CREATE POLICY "allow_user_read_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.get_user_role() = 'admin');

-- Users can update only their own profile (trigger guards role escalation)
CREATE POLICY "allow_user_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.get_user_role() = 'admin')
WITH CHECK (id = auth.uid() OR public.get_user_role() = 'admin');

-- 6. Clean up any overly permissive USING (true) policies on sensitive operational tables
-- rescue_dispatches
ALTER TABLE public.rescue_dispatches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Insert Access" ON public.rescue_dispatches;
DROP POLICY IF EXISTS "Allow Read Access" ON public.rescue_dispatches;
DROP POLICY IF EXISTS "Allow Update Access" ON public.rescue_dispatches;
DROP POLICY IF EXISTS "allow_select_rescue_dispatches" ON public.rescue_dispatches;
DROP POLICY IF EXISTS "allow_manage_rescue_dispatches" ON public.rescue_dispatches;

CREATE POLICY "allow_select_rescue_dispatches"
ON public.rescue_dispatches
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_manage_rescue_dispatches"
ON public.rescue_dispatches
FOR ALL
TO authenticated
USING (public.get_user_role() IN ('responder', 'admin'))
WITH CHECK (public.get_user_role() IN ('responder', 'admin'));

-- emergency_reports
ALTER TABLE public.emergency_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Insert Access" ON public.emergency_reports;
DROP POLICY IF EXISTS "Allow Read Access" ON public.emergency_reports;
DROP POLICY IF EXISTS "Allow Update Access" ON public.emergency_reports;
DROP POLICY IF EXISTS "allow_public_read_emergency_reports" ON public.emergency_reports;
DROP POLICY IF EXISTS "allow_authenticated_insert_emergency_reports" ON public.emergency_reports;
DROP POLICY IF EXISTS "allow_responder_update_emergency_reports" ON public.emergency_reports;

CREATE POLICY "allow_public_read_emergency_reports"
ON public.emergency_reports
FOR SELECT
USING (true);

CREATE POLICY "allow_authenticated_insert_emergency_reports"
ON public.emergency_reports
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "allow_responder_update_emergency_reports"
ON public.emergency_reports
FOR UPDATE
TO authenticated
USING (public.get_user_role() IN ('responder', 'admin') OR user_id = auth.uid()::text)
WITH CHECK (public.get_user_role() IN ('responder', 'admin') OR user_id = auth.uid()::text);

-- activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Insert Access" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow Read Access" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow Update Access" ON public.activity_logs;
DROP POLICY IF EXISTS "allow_authenticated_read_activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "allow_authenticated_insert_activity_logs" ON public.activity_logs;

CREATE POLICY "allow_authenticated_read_activity_logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_authenticated_insert_activity_logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Insert Access" ON public.notifications;
DROP POLICY IF EXISTS "Allow Read Access" ON public.notifications;
DROP POLICY IF EXISTS "Allow Update Access" ON public.notifications;
DROP POLICY IF EXISTS "allow_user_read_notifications" ON public.notifications;
DROP POLICY IF EXISTS "allow_user_update_notifications" ON public.notifications;

CREATE POLICY "allow_user_read_notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text OR user_id IS NULL OR public.get_user_role() = 'admin');

CREATE POLICY "allow_user_update_notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text OR public.get_user_role() = 'admin');
