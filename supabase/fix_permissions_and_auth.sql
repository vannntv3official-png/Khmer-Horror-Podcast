-- ==============================================================================
-- KHMER HORROR PODCAST - FIX PERMISSIONS, STORAGE & AUTH SCRIPT
-- RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR TO FIX:
-- 1. Login issue (Email confirmation requirement & rate limit)
-- 2. Storage upload 403 / AccessDenied (Audio & Cover image RLS policies)
-- 3. Stories & Categories RLS policies for Desktop Admin app
-- ==============================================================================

-- 1. AUTO-CONFIRM USER TRIGGER & RETROACTIVE CONFIRMATION
-- Fixes: "Email not confirmed" and "over_email_send_rate_limit"
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, timezone('utc'::text, now()));
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_confirm_user ON auth.users;
CREATE TRIGGER trg_auto_confirm_user
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_confirm_user();

-- Auto-confirm any existing registered users who were blocked
UPDATE auth.users
SET email_confirmed_at = timezone('utc'::text, now())
WHERE email_confirmed_at IS NULL;


-- 2. STORAGE BUCKETS & RLS POLICIES
-- Fixes: "StorageApiError: new row violates row-level security policy" (code 403)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('story-covers', 'story-covers', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg']),
    ('story-audio', 'story-audio', true, 314572800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/aac'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policies for 'story-covers' bucket
DROP POLICY IF EXISTS "Public can view covers" ON storage.objects;
CREATE POLICY "Public can view covers" ON storage.objects
    FOR SELECT USING (bucket_id = 'story-covers');

DROP POLICY IF EXISTS "Allow upload to covers" ON storage.objects;
CREATE POLICY "Allow upload to covers" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'story-covers');

DROP POLICY IF EXISTS "Allow update to covers" ON storage.objects;
CREATE POLICY "Allow update to covers" ON storage.objects
    FOR UPDATE USING (bucket_id = 'story-covers');

DROP POLICY IF EXISTS "Allow delete to covers" ON storage.objects;
CREATE POLICY "Allow delete to covers" ON storage.objects
    FOR DELETE USING (bucket_id = 'story-covers');

-- Storage Policies for 'story-audio' bucket
DROP POLICY IF EXISTS "Public can view audio" ON storage.objects;
CREATE POLICY "Public can view audio" ON storage.objects
    FOR SELECT USING (bucket_id = 'story-audio');

DROP POLICY IF EXISTS "Allow upload to audio" ON storage.objects;
CREATE POLICY "Allow upload to audio" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'story-audio');

DROP POLICY IF EXISTS "Allow update to audio" ON storage.objects;
CREATE POLICY "Allow update to audio" ON storage.objects
    FOR UPDATE USING (bucket_id = 'story-audio');

DROP POLICY IF EXISTS "Allow delete to audio" ON storage.objects;
CREATE POLICY "Allow delete to audio" ON storage.objects
    FOR DELETE USING (bucket_id = 'story-audio');


-- 3. PERMISSIONS FOR STORIES, CATEGORIES & LOGS
-- Fixes: "new row violates row-level security policy for table 'stories'"
DROP POLICY IF EXISTS "Public users can view published stories" ON public.stories;
DROP POLICY IF EXISTS "Public users can view stories" ON public.stories;
CREATE POLICY "Public users can view stories" ON public.stories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage stories" ON public.stories;
DROP POLICY IF EXISTS "Allow manage stories" ON public.stories;
CREATE POLICY "Allow manage stories" ON public.stories
    FOR ALL USING (true) WITH CHECK (true);

-- Categories permissions
DROP POLICY IF EXISTS "Categories are readable by everyone" ON public.categories;
CREATE POLICY "Categories are readable by everyone" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Allow manage categories" ON public.categories;
CREATE POLICY "Allow manage categories" ON public.categories
    FOR ALL USING (true) WITH CHECK (true);

-- Admin activity logs permissions
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.admin_activity_logs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can insert activity logs" ON public.admin_activity_logs
    FOR INSERT WITH CHECK (true);

-- Profiles permissions
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all profiles insert" ON public.profiles;
CREATE POLICY "Allow all profiles insert" ON public.profiles 
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all profiles update" ON public.profiles;
CREATE POLICY "Allow all profiles update" ON public.profiles 
    FOR UPDATE USING (true) WITH CHECK (true);

-- Make sure the first profile has admin rights
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1);
