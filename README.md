# ផតខាស់រឿងរន្ធត់ខ្មែរ — KHMER HORROR PODCAST
### Full-Stack Audio Streaming Platform & Standalone Windows Electron Admin

[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Electron](https://img.shields.io/badge/Electron-33-47848f.svg)](https://www.electronjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth%20%2B%20Storage-3ecf8e.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

---

## 1. ស្ថាបត្យកម្មប្រព័ន្ធ (System Architecture)

**Khmer Horror Podcast** គឺជាប្រព័ន្ធផ្សព្វផ្សាយសំឡេងរឿងព្រឺព្រួចខ្មែរ និងអបិយជំនឿបុរាណពេញលេញ (Production Full-Stack Platform) ដែលមាន **២ កម្មវិធីធំៗ** ដំណើរការលើ Backend រួមមួយ៖

```
                    ┌───────────────────────────────────────────────┐
                    │               SUPABASE BACKEND                │
                    │  • PostgreSQL Database with RLS Policies     │
                    │  • Supabase Auth (JWT, Profiles, Roles)       │
                    │  • Private Storage: `story-audio` (MP3s)      │
                    │  • Public Storage:  `story-covers` (Images)   │
                    │  • Edge Functions:  `get-audio-url`, Webhooks │
                    └───────┬───────────────────────────────┬───────┘
                            │                               │
            REST / Realtime / Signed URLs       REST / Upload / Management
                            │                               │
    ┌───────────────────────▼────────┐      ┌───────────────▼────────────────┐
    │     PUBLIC WEB APPLICATION     │      │     ADMIN DESKTOP ELECTRON     │
    │  • Glass + Light Design System │      │  • Windows Installer (.exe)    │
    │  • Noto Sans Khmer Typography  │      │  • Secure Sandbox + IPC Preload│
    │  • Global Audio Player & Seek  │      │  • 10 Dedicated Admin Sections │
    │  • Continue Listening Sync     │      │  • Resumable MP3 Audio Upload  │
    │  • VIP Membership & KHQR Pay   │      │  • User & Subscription Control │
    └────────────────────────────────┘      └────────────────────────────────┘
```

---

## 2. រចនាសម្ព័ន្ធគម្រោង (Monorepo Workspace)

```
Khmer_Horror_Podcast/
├── apps/
│   ├── web/                          # Public Website (React + Vite + Tailwind + Router)
│   │   ├── src/
│   │   │   ├── components/           # Navbar, Footer, AudioPlayerBar, StoryCard
│   │   │   ├── contexts/             # AuthContext, AudioPlayerContext
│   │   │   ├── pages/                # Home, Stories, Detail, Auth, Profile, Premium, Info
│   │   │   ├── lib/                  # Supabase Client, Signed URL helper, utils
│   │   │   └── data/                 # Rich Khmer horror fallback datasets
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   │
│   └── admin/                        # Desktop Admin App (Electron + electron-vite + React)
│       ├── src/
│       │   ├── main/                 # Electron main process (sandbox, safe navigation)
│       │   ├── preload/              # Secure contextIsolation bridge (electronAPI)
│       │   └── renderer/             # React Admin UI (10 Management Views)
│       ├── electron.vite.config.ts
│       └── electron-builder.yml      # Windows installer & portable builder config
│
├── packages/
│   └── shared/                       # Shared Domain Types, Constants & Formatters
│       ├── src/types/database.ts     # Supabase Database TypeScript definitions
│       ├── src/constants/index.ts    # VIP Plans ($2.99, $24.99, $69.99), Storage buckets
│       └── src/utils/                # Khmer duration & digit formatters, security checks
│
├── supabase/
│   ├── migrations/                   # 20261020000000_init_khmer_horror.sql
│   ├── seed.sql                      # Authentic Khmer categories & horror stories
│   ├── config.toml                   # Local Supabase CLI configuration
│   └── functions/
│       ├── get-audio-url/            # Edge Function for issuing signed audio URLs
│       ├── payment-webhook/          # Idempotent subscription webhook processor
│       └── admin-manage-user/        # Privileged admin user management function
│
├── package.json                      # NPM Workspaces configuration
└── README.md
```

---

## 3. មូលដ្ឋានទិន្នន័យ & សុវត្ថិភាព (Database & Security)

### តារាងទិន្នន័យ (Database Tables):
1. `profiles`: សមាជិកទាំងអស់ (`id`, `display_name`, `avatar_url`, `role: user | admin`).
2. `categories`: ប្រភេទទស្សនីយភាព (`name`, `name_en`, `slug`, `description`).
3. `stories`: មាតិការឿង (`title`, `slug`, `duration_seconds`, `is_premium`, `is_published`, `audio_path`, `cover_path`, `listen_count`).
4. `favorites`: រឿងចូលចិត្ត (`user_id`, `story_id`).
5. `listening_progress`: វឌ្ឍនភាពស្ដាប់បន្ត (`user_id`, `story_id`, `position_seconds`, `completed`).
6. `subscriptions`: សមាជិកភាព VIP (`user_id`, `plan_id: monthly | yearly | lifetime_vip`, `status: active | expired | cancelled`, `expires_at`).
7. `payment_events`: កំណត់ត្រាទូទាត់ប្រាក់ Idempotent (`provider`, `provider_event_id`, `amount`, `metadata`).
8. `listening_events`: កំណត់ត្រាវិភាគការស្ដាប់ (`story_id`, `event_type`, `position_seconds`).
9. `admin_activity_logs`: កំណត់ត្រាសវនកម្មគ្រប់គ្រង (`actor_id`, `action`, `target_type`, `target_id`, `metadata`).

### សន្តិសុខ Row Level Security (RLS) & Storage:
- ឯកសារសំឡេង MP3 ទាំងអស់ស្ថិតក្នុង Private Bucket `story-audio` — មិនមាន URL ជាសាធារណៈឡើយ។
- សំឡេងត្រូវបានបើកផ្ដល់តាមរយៈ **Signed URLs** រយៈពេល ៣៦០០ វិនាទី (១ ម៉ោង) ក្រោយពេល Backend ផ្ទៀងផ្ទាត់សិទ្ធិ VIP និងស្ថានភាពបោះពុម្ពរួចរាល់។
- សិទ្ធិ Admin ត្រូវបានផ្ទៀងផ្ទាត់ដោយ `is_admin()` Security Definer Function ដោយមិនទុកចិត្តលើ Client-side claim ឡើយ។

---

## 4. ការដំឡើង & ដំណើរការលើម៉ាស៊ីនផ្ទាល់ (Local Development)

### តម្រូវការជាមុន (Prerequisites):
- Node.js >= 18.0.0 (បានសាកល្បងជាមួយ Node v24)
- npm >= 9.0.0

### ជំហានទី ១៖ ដំឡើង Dependencies
```powershell
# ពី root directory
npm install
```

### ជំហានទី ២៖ កំណត់បរិស្ថាន Environment (.env)
ចម្លង `.env.example` ទៅ `.env` ក្នុង root, `apps/web/.env`, និង `apps/admin/.env`៖
```powershell
cp .env.example apps/web/.env
cp .env.example apps/admin/.env
```
*ចំណាំ៖ កម្មវិធីទាំងពីរមានភ្ជាប់មកជាមួយ Offline / Standalone Mock Data ស្រាប់ ដូច្នេះលោកអ្នកអាចបើកមើល និងសាកល្បងប្រើប្រាស់បានភ្លាមៗ ទោះបីមិនទាន់បានភ្ជាប់ទៅ Supabase Live ក៏ដោយ។*

### ជំហានទី ៣៖ ដំណើរការគេហទំព័រ (Public Website)
```powershell
npm run dev:web
# បើកដំណើរការនៅ http://localhost:5173
```

### ជំហានទី ៤៖ ដំណើរការ Admin Desktop App (Electron)
```powershell
npm run dev:admin
# បង្អួច Khmer Horror Admin នឹងបើកឡើងដោយស្វ័យប្រវត្តិ
```

---

## 5. ការធ្វើតេស្ត & ការផ្ទៀងផ្ទាត់កូដ (Testing & Verification)

```powershell
# ដំណើរការ Unit & Integration Tests (Vitest)
npm run test

# ដំណើរការ Typecheck សម្រាប់គ្រប់ Workspaces
npm run typecheck
```

---

## 6. ការបង្កើតឯកសារដំឡើង Windows (Windows Electron Packaging)

ដើម្បីបង្កើត Installer សម្រាប់ Windows Desktop Application (`Khmer-Horror-Admin-Setup.exe`)៖

```powershell
# បង្កើត Windows Installer (.exe) និង Portable Executable
npm run build:admin:win
```

លទ្ធផល build នឹងត្រូវបានបង្កើតឡើងក្នុងថត `apps/admin/release/`៖
- `Khmer Horror Admin-Setup-1.0.0.exe` (NSIS Installer)
- `Khmer Horror Admin-1.0.0.exe` (Portable Standalone)

> **ចំណាំអំពី Code Signing នៅលើ Windows:**  
> ប្រសិនបើលោកអ្នកពុំទាន់បានកំណត់ Certificate (EV/OV Code Signing) ទេនោះ ប្រព័ន្ធការពារ Windows SmartScreen អាចនឹងបង្ហាញសារព្រមានកំឡុងពេលដំឡើងដំបូង។ លោកអ្នកគ្រាន់តែចុច **"More Info"** រួចជ្រើសរើស **"Run anyway"** ដើម្បីដំឡើងជាការស្រេច។

---

## 7. ការដាក់ពង្រាយគេហទំព័រ (Public Website Deployment - Vercel)

1. រុញកូដ (Push) ទៅកាន់ GitHub Repository របស់អ្នក។
2. ភ្ជាប់គម្រោងជាមួយ **Vercel**:
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. បន្ថែម Environment Variables ក្នុង Vercel Settings៖
   - `VITE_SUPABASE_URL` = `https://<your-project>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<your-anon-key>`
   - `VITE_EDGE_FUNCTION_URL` = `https://<your-project>.supabase.co/functions/v1/get-audio-url`

---

## 8. ការដាក់ពង្រាយ Supabase (Database, Migrations & Storage)

```powershell
# ១. ចូលគណនី Supabase CLI
npx supabase login

# ២. ភ្ជាប់ទៅកាន់ Remote Project
npx supabase link --project-ref <your-project-ref>

# ៣. រុញ Migration និងតារាងទាំងអស់
npx supabase db push

# ៤. បញ្ចូល Seed Data (Categories & Sample Stories)
npx supabase db reset  # ឬ execute supabase/seed.sql ក្នុង SQL Editor

# ៥. Deploy Edge Functions
npx supabase functions deploy get-audio-url --no-verify-jwt
npx supabase functions deploy payment-webhook --no-verify-jwt
npx supabase functions deploy admin-manage-user
```

---

## 9. បញ្ជីត្រួតពិនិត្យប្រតិបត្តិការ & សន្តិសុខ (Security & Operational Checklist)

- [x] **RLS Enforcement:** តារាងទាំងអស់ត្រូវបានការពារដោយ Row Level Security policies។
- [x] **Private Storage:** Story Audio ស្ថិតក្នុង private bucket; មិនមាន public URL អចិន្ត្រៃយ៍។
- [x] **Signed Audio URLs:** Audio streaming ប្រើ short-lived signed URLs (TTL 1 hour) បន្ទាប់ពី backend ផ្ទៀងផ្ទាត់ subscription រួចរាល់។
- [x] **Role Protection:** User role មិនអាចកែប្រែដោយផ្ទាល់ពី client payload បានឡើយ (ការពារដោយ `is_admin()` Security Definer)។
- [x] **Electron Sandboxing:** `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, ព្រមទាំង Content Security Policy (CSP) រួចរាល់។
- [x] **Khmer Unicode Typography:** គាំទ្រ Noto Sans Khmer ពេញលេញ ជាមួយការបង្ហាញលេខខ្មែរ និងរយៈពេលជាភាសាខ្មែរ។
- [x] **Offline / Standalone Resilience:** ប្រព័ន្ធដំណើរការយ៉ាងរលូន ទោះបីស្ថិតក្នុងស្ថានភាពអវត្តមាន Internet ឬកំពុងរង់ចាំការកំណត់ Supabase ក៏ដោយ។
