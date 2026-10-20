-- ==============================================================================
-- KHMER HORROR PODCAST (ផតខាស់រឿងរន្ធត់ខ្មែរ)
-- COMPLETE DATABASE SETUP SCRIPT FOR SUPABASE LIVE (SQL EDITOR)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listening_event_type') THEN
        CREATE TYPE listening_event_type AS ENUM ('play', 'pause', 'complete', 'progress');
    END IF;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_en TEXT,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 5. STORIES TABLE
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    cover_path TEXT,
    audio_path TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    listen_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_stories_slug ON public.stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_category_id ON public.stories(category_id);
CREATE INDEX IF NOT EXISTS idx_stories_published ON public.stories(is_published);
CREATE INDEX IF NOT EXISTS idx_stories_premium ON public.stories(is_premium);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_listen_count ON public.stories(listen_count DESC);

-- 6. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, story_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_story_id ON public.favorites(story_id);

-- 7. LISTENING PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.listening_progress (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    position_seconds INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, story_id)
);

CREATE INDEX IF NOT EXISTS idx_listening_progress_user ON public.listening_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_progress_updated ON public.listening_progress(updated_at DESC);

-- 8. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    starts_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ,
    provider_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 9. PAYMENT EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL,
    provider_event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_payment_event UNIQUE (provider, provider_event_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_events_user_id ON public.payment_events(user_id);

-- 10. LISTENING EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.listening_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    event_type listening_event_type NOT NULL,
    position_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_listening_events_story_id ON public.listening_events(story_id);
CREATE INDEX IF NOT EXISTS idx_listening_events_created_at ON public.listening_events(created_at DESC);

-- 11. ADMIN ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);

-- ==============================================================================
-- FUNCTIONS & TRIGGERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_active_subscription(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF check_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    IF public.is_admin(check_user_id) THEN
        RETURN TRUE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = check_user_id
          AND status = 'active'
          AND (expires_at IS NULL OR expires_at > timezone('utc'::text, now()))
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_story_listen_count(target_story_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.stories
    SET listen_count = listen_count + 1,
        updated_at = timezone('utc'::text, now())
    WHERE id = target_story_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_stories_updated_at ON public.stories;
CREATE TRIGGER trg_stories_updated_at
    BEFORE UPDATE ON public.stories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
    USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL TO authenticated
    USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Categories
DROP POLICY IF EXISTS "Categories are readable by everyone" ON public.categories;
CREATE POLICY "Categories are readable by everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated
    USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Stories
DROP POLICY IF EXISTS "Public users can view published stories" ON public.stories;
CREATE POLICY "Public users can view published stories" ON public.stories FOR SELECT
    USING (is_published = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage stories" ON public.stories;
CREATE POLICY "Admins can manage stories" ON public.stories FOR ALL TO authenticated
    USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
CREATE POLICY "Users can insert their own favorites" ON public.favorites FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Listening Progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.listening_progress;
CREATE POLICY "Users can view their own progress" ON public.listening_progress FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own progress" ON public.listening_progress;
CREATE POLICY "Users can manage their own progress" ON public.listening_progress FOR ALL TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions FOR ALL TO authenticated
    USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Payment Events
DROP POLICY IF EXISTS "Admins can view payment events" ON public.payment_events;
CREATE POLICY "Admins can view payment events" ON public.payment_events FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

-- Listening Events
DROP POLICY IF EXISTS "Anyone can insert listening events" ON public.listening_events;
CREATE POLICY "Anyone can insert listening events" ON public.listening_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view listening events" ON public.listening_events;
CREATE POLICY "Admins can view listening events" ON public.listening_events FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

-- Activity Logs
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.admin_activity_logs FOR SELECT TO authenticated
    USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can insert activity logs" ON public.admin_activity_logs FOR INSERT TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

-- ==============================================================================
-- STORAGE BUCKETS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('story-covers', 'story-covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('story-audio', 'story-audio', false, 314572800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/aac'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================================================
-- SEED DATA (AUTHENTIC KHMER CATEGORIES & STORIES)
-- ==============================================================================
INSERT INTO public.categories (id, name, name_en, slug, description)
VALUES
    ('c1111111-1111-4111-8111-111111111111', 'ព្រលឹងវិញ្ញាណ', 'Spirits & Ghosts', 'spirits-and-ghosts', 'រឿងរ៉ាវទាក់ទងនឹងព្រលឹងខ្មោច វិញ្ញាណវិលវល់ និងការលងបន្លាចតាមគេហដ្ឋាន'),
    ('c2222222-2222-4222-8222-222222222222', 'ព្រៃអាថ៌កំបាំង', 'Mysterious Forest', 'mysterious-forest', 'ដំណើរព្រឺព្រួចក្នុងព្រៃជ្រៅ អាថ៌កំបាំងសត្វព្រៃ ព្រាយព្រៃ និងអ្នកតាម្ចាស់ទឹកម្ចាស់ដី'),
    ('c3333333-3333-4333-8333-333333333333', 'អបិយជំនឿបុរាណ', 'Khmer Folklore & Taboos', 'khmer-folklore-taboos', 'តំណមបុរាណខ្មែរ មន្តអាគមខ្មៅ អាបធ្មប់ និងជំនឿតៗគ្នាតាំងពីដូនតា'),
    ('c4444444-4444-4444-8444-444444444444', 'ឃាតកម្មអាថ៌កំបាំង', 'Horror Crimes & Curses', 'horror-crimes-curses', 'រឿងរ៉ាវព្រឺក្បាលនៃការសងសឹក ឃាតកម្ម និងបណ្តាសាគ្មានថ្ងៃរលត់'),
    ('c5555555-5555-4555-8555-555555555555', 'ផ្ទះខ្មោចលង', 'Haunted Houses', 'haunted-houses', 'ភូមិគ្រឹះចាស់ៗ និងបន្ទប់ជួលអាថ៌កំបាំងដែលមានសំឡេងចម្លែករៀងរាល់កណ្ដាលអធ្រាត្រ')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.stories (
    id, title, slug, description, category_id, cover_path, audio_path, duration_seconds, is_premium, is_published, listen_count
)
VALUES
    (
        's1111111-1111-4111-8111-111111111111',
        'សំឡេងយំក្រោយផ្ទះបាយកណ្តាលអធ្រាត្រ',
        'crying-behind-kitchen-midnight',
        'នៅពេលម៉ោង ២ យប់ ក្នុងភូមិស្ងាត់ជ្រងំ សំឡេងកូនក្មេងយំអណ្តែតអណ្តូងពីខាងក្រោយពាងទឹកផ្ទះបាយ... រឿងរ៉ាវពិតដែលកើតឡើងនៅខេត្តកំពង់ចាម កាលពីឆ្នាំ ១៩៩៨។',
        'c1111111-1111-4111-8111-111111111111',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        'audio/sample-story-1.mp3',
        1380,
        false,
        true,
        4820
    ),
    (
        's2222222-2222-4222-8222-222222222222',
        'ផ្លូវកាត់ព្រៃលិចទឹកកំពង់ធំ',
        'kampong-thom-swamp-shortcut',
        'អ្នកបើកបរឡានឈ្នួលម្នាក់បានសម្រេចចិត្តកាត់ផ្លូវព្រៃលិចទឹកដើម្បីឆាប់ដល់ផ្ទះ តែគាត់មិនដឹងទេថានោះជាផ្លូវដែលគ្មានអ្នកណាម្នាក់ហ៊ានធ្វើដំណើរក្រោយថ្ងៃលិចឡើយ។',
        'c2222222-2222-4222-8222-222222222222',
        'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&q=80',
        'audio/sample-story-2.mp3',
        1920,
        false,
        true,
        6290
    ),
    (
        's3333333-3333-4333-8333-333333333333',
        'តំណមមិនកាត់ក្រចកពេលយប់',
        'taboo-cutting-nails-at-night',
        'មនុស្សចាស់តែងតែហាមមិនឱ្យកាត់ក្រចកដៃក្រចកជើងពេលយប់។ ក្មេងជំទង់ម្នាក់មិនជឿ និងបានបំពានបម្រាមនេះ រហូតទាល់តែមានអ្នកគោះទ្វារបន្ទប់មកសុំកម្ទេចក្រចកនោះវិញ...',
        'c3333333-3333-4333-8333-333333333333',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        'audio/sample-story-3.mp3',
        1140,
        false,
        true,
        8750
    ),
    (
        's4444444-4444-4444-8444-444444444444',
        'បន្ទប់ជួលលេខ ៤០៤ ផ្លូវកម្ពុជាក្រោម [VIP]',
        'rented-room-404-kampuchea-krom-vip',
        'បន្ទប់ជួលតម្លៃថោកមិនគួរឱ្យជឿកណ្តាលរាជធានីភ្នំពេញ។ រាល់យប់ ស្រមោលស្ត្រីម្នាក់សក់វែងឈរនៅចុងជើងគ្រែ សម្លឹងមើលដោយកែវភ្នែកក្រហមឆ្អៅ...',
        'c5555555-5555-4555-8555-555555555555',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        'audio/sample-vip-1.mp3',
        2540,
        true,
        true,
        12400
    ),
    (
        's5555555-5555-4555-8555-555555555555',
        'បណ្តាសាព្រាយក្រឡាភ្លើងជួរភ្នំក្រវាញ [VIP]',
        'curse-of-fire-spirit-cardamom-vip',
        'ដំណើរផ្សងព្រេងរបស់ក្រុមនិស្សិត ៥ នាក់ដែលបានចូលទៅបោះតង់លើខ្នងភ្នំក្រវាញ និងបានប៉ះពាល់វត្ថុស័ក្តិសិទ្ធិបុរាណដែលអ្នកភូមិបានព្រមាន។',
        'c2222222-2222-4222-8222-222222222222',
        'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&q=80',
        'audio/sample-vip-2.mp3',
        3180,
        true,
        true,
        9810
    ),
    (
        's6666666-6666-4666-8666-666666666666',
        'កញ្ចក់បុរាណក្នុងវីឡាបារាំងបាត់ដំបង',
        'antique-mirror-battambang-villa',
        'កញ្ចក់បុរាណដែលឆ្លុះមិនឃើញមុខអ្នកឈរពីមុខ តែឆ្លុះឃើញរូបរាងបុរសម្នាក់ពាក់អាវខ្មៅឈរពីក្រោយខ្នងជានិច្ច។',
        'c5555555-5555-4555-8555-555555555555',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        'audio/sample-story-6.mp3',
        1680,
        false,
        true,
        3420
    ),
    (
        's7777777-7777-4777-8777-777777777777',
        'អាថ៌កំបាំងទូរស័ព្ទតេពីអ្នកស្លាប់ [VIP]',
        'mysterious-call-from-deceased-vip',
        'បីថ្ងៃក្រោយពិធីបុណ្យសពមិត្តភក្តិជិតស្និទ្ធ ទូរស័ព្ទដៃរបស់គាត់ស្រាប់តែរោទ៍... ពេលលើកឡើង ឮតែសំឡេងដកដង្ហើមញ័រៗ និងពាក្យមួយម៉ាត់ថា "ជួយខ្ញុំផង"...',
        'c4444444-4444-4444-8444-444444444444',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        'audio/sample-vip-3.mp3',
        2220,
        true,
        true,
        15200
    )
ON CONFLICT (slug) DO NOTHING;
