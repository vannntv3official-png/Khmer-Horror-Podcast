import type { Story, Category } from '@khmer-horror/shared'

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'c1111111-1111-4111-8111-111111111111',
    name: 'ព្រលឹងវិញ្ញាណ',
    name_en: 'Spirits & Ghosts',
    slug: 'spirits-and-ghosts',
    description: 'រឿងរ៉ាវទាក់ទងនឹងព្រលឹងខ្មោច វិញ្ញាណវិលវល់ និងការលងបន្លាចតាមគេហដ្ឋាន',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'c2222222-2222-4222-8222-222222222222',
    name: 'ព្រៃអាថ៌កំបាំង',
    name_en: 'Mysterious Forest',
    slug: 'mysterious-forest',
    description: 'ដំណើរព្រឺព្រួចក្នុងព្រៃជ្រៅ អាថ៌កំបាំងសត្វព្រៃ ព្រាយព្រៃ និងអ្នកតាម្ចាស់ទឹកម្ចាស់ដី',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'c3333333-3333-4333-8333-333333333333',
    name: 'អបិយជំនឿបុរាណ',
    name_en: 'Khmer Folklore & Taboos',
    slug: 'khmer-folklore-taboos',
    description: 'តំណមបុរាណខ្មែរ មន្តអាគមខ្មៅ អាបធ្មប់ និងជំនឿតៗគ្នាតាំងពីដូនតា',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'c4444444-4444-4444-8444-444444444444',
    name: 'ឃាតកម្មអាថ៌កំបាំង',
    name_en: 'Horror Crimes & Curses',
    slug: 'horror-crimes-curses',
    description: 'រឿងរ៉ាវព្រឺក្បាលនៃការសងសឹក ឃាតកម្ម និងបណ្តាសាគ្មានថ្ងៃរលត់',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'c5555555-5555-4555-8555-555555555555',
    name: 'ផ្ទះខ្មោចលង',
    name_en: 'Haunted Houses',
    slug: 'haunted-houses',
    description: 'ភូមិគ្រឹះចាស់ៗ និងបន្ទប់ជួលអាថ៌កំបាំងដែលមានសំឡេងចម្លែករៀងរាល់កណ្ដាលអធ្រាត្រ',
    created_at: '2026-01-01T00:00:00Z'
  }
]

export const MOCK_STORIES: Story[] = [
  {
    id: 's1111111-1111-4111-8111-111111111111',
    title: 'សំឡេងយំក្រោយផ្ទះបាយកណ្តាលអធ្រាត្រ',
    slug: 'crying-behind-kitchen-midnight',
    description: 'នៅពេលម៉ោង ២ យប់ ក្នុងភូមិស្ងាត់ជ្រងំ សំឡេងកូនក្មេងយំអណ្តែតអណ្តូងពីខាងក្រោយពាងទឹកផ្ទះបាយ... រឿងរ៉ាវពិតដែលកើតឡើងនៅខេត្តកំពង់ចាម កាលពីឆ្នាំ ១៩៩៨។',
    category_id: 'c1111111-1111-4111-8111-111111111111',
    cover_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    audio_path: 'audio/sample-story-1.mp3',
    duration_seconds: 1380, // 23 min
    is_premium: false,
    is_published: true,
    created_by: null,
    listen_count: 4820,
    created_at: '2026-01-10T12:00:00Z',
    updated_at: '2026-01-10T12:00:00Z',
    category: MOCK_CATEGORIES[0]
  },
  {
    id: 's2222222-2222-4222-8222-222222222222',
    title: 'ផ្លូវកាត់ព្រៃលិចទឹកកំពង់ធំ',
    slug: 'kampong-thom-swamp-shortcut',
    description: 'អ្នកបើកបរឡានឈ្នួលម្នាក់បានសម្រេចចិត្តកាត់ផ្លូវព្រៃលិចទឹកដើម្បីឆាប់ដល់ផ្ទះ តែគាត់មិនដឹងទេថានោះជាផ្លូវដែលគ្មានអ្នកណាម្នាក់ហ៊ានធ្វើដំណើរក្រោយថ្ងៃលិចឡើយ។',
    category_id: 'c2222222-2222-4222-8222-222222222222',
    cover_path: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&q=80',
    audio_path: 'audio/sample-story-2.mp3',
    duration_seconds: 1920, // 32 min
    is_premium: false,
    is_published: true,
    created_by: null,
    listen_count: 6290,
    created_at: '2026-01-15T14:30:00Z',
    updated_at: '2026-01-15T14:30:00Z',
    category: MOCK_CATEGORIES[1]
  },
  {
    id: 's3333333-3333-4333-8333-333333333333',
    title: 'តំណមមិនកាត់ក្រចកពេលយប់',
    slug: 'taboo-cutting-nails-at-night',
    description: 'មនុស្សចាស់តែងតែហាមមិនឱ្យកាត់ក្រចកដៃក្រចកជើងពេលយប់។ ក្មេងជំទង់ម្នាក់មិនជឿ និងបានបំពានបម្រាមនេះ រហូតទាល់តែមានអ្នកគោះទ្វារបន្ទប់មកសុំកម្ទេចក្រចកនោះវិញ...',
    category_id: 'c3333333-3333-4333-8333-333333333333',
    cover_path: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    audio_path: 'audio/sample-story-3.mp3',
    duration_seconds: 1140, // 19 min
    is_premium: false,
    is_published: true,
    created_by: null,
    listen_count: 8750,
    created_at: '2026-01-20T08:00:00Z',
    updated_at: '2026-01-20T08:00:00Z',
    category: MOCK_CATEGORIES[2]
  },
  {
    id: 's4444444-4444-4444-8444-444444444444',
    title: 'បន្ទប់ជួលលេខ ៤០៤ ផ្លូវកម្ពុជាក្រោម [VIP]',
    slug: 'rented-room-404-kampuchea-krom-vip',
    description: 'បន្ទប់ជួលតម្លៃថោកមិនគួរឱ្យជឿកណ្តាលរាជធានីភ្នំពេញ។ រាល់យប់ ស្រមោលស្ត្រីម្នាក់សក់វែងឈរនៅចុងជើងគ្រែ សម្លឹងមើលដោយកែវភ្នែកក្រហមឆ្អៅ...',
    category_id: 'c5555555-5555-4555-8555-555555555555',
    cover_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    audio_path: 'audio/sample-vip-1.mp3',
    duration_seconds: 2540, // 42 min
    is_premium: true,
    is_published: true,
    created_by: null,
    listen_count: 12400,
    created_at: '2026-01-25T19:00:00Z',
    updated_at: '2026-01-25T19:00:00Z',
    category: MOCK_CATEGORIES[4]
  },
  {
    id: 's5555555-5555-4555-8555-555555555555',
    title: 'បណ្តាសាព្រាយក្រឡាភ្លើងជួរភ្នំក្រវាញ [VIP]',
    slug: 'curse-of-fire-spirit-cardamom-vip',
    description: 'ដំណើរផ្សងព្រេងរបស់ក្រុមនិស្សិត ៥ នាក់ដែលបានចូលទៅបោះតង់លើខ្នងភ្នំក្រវាញ និងបានប៉ះពាល់វត្ថុស័ក្តិសិទ្ធិបុរាណដែលអ្នកភូមិបានព្រមាន។',
    category_id: 'c2222222-2222-4222-8222-222222222222',
    cover_path: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&q=80',
    audio_path: 'audio/sample-vip-2.mp3',
    duration_seconds: 3180, // 53 min
    is_premium: true,
    is_published: true,
    created_by: null,
    listen_count: 9810,
    created_at: '2026-02-01T21:00:00Z',
    updated_at: '2026-02-01T21:00:00Z',
    category: MOCK_CATEGORIES[1]
  },
  {
    id: 's6666666-6666-4666-8666-666666666666',
    title: 'កញ្ចក់បុរាណក្នុងវីឡាបារាំងបាត់ដំបង',
    slug: 'antique-mirror-battambang-villa',
    description: 'កញ្ចក់បុរាណដែលឆ្លុះមិនឃើញមុខអ្នកឈរពីមុខ តែឆ្លុះឃើញរូបរាងបុរសម្នាក់ពាក់អាវខ្មៅឈរពីក្រោយខ្នងជានិច្ច។',
    category_id: 'c5555555-5555-4555-8555-555555555555',
    cover_path: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    audio_path: 'audio/sample-story-6.mp3',
    duration_seconds: 1680, // 28 min
    is_premium: false,
    is_published: true,
    created_by: null,
    listen_count: 3420,
    created_at: '2026-02-05T15:00:00Z',
    updated_at: '2026-02-05T15:00:00Z',
    category: MOCK_CATEGORIES[4]
  },
  {
    id: 's7777777-7777-4777-8777-777777777777',
    title: 'អាថ៌កំបាំងទូរស័ព្ទតេពីអ្នកស្លាប់ [VIP]',
    slug: 'mysterious-call-from-deceased-vip',
    description: 'បីថ្ងៃក្រោយពិធីបុណ្យសពមិត្តភក្តិជិតស្និទ្ធ ទូរស័ព្ទដៃរបស់គាត់ស្រាប់តែរោទ៍... ពេលលើកឡើង ឮតែសំឡេងដកដង្ហើមញ័រៗ និងពាក្យមួយម៉ាត់ថា "ជួយខ្ញុំផង"...',
    category_id: 'c4444444-4444-4444-8444-444444444444',
    cover_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    audio_path: 'audio/sample-vip-3.mp3',
    duration_seconds: 2220, // 37 min
    is_premium: true,
    is_published: true,
    created_by: null,
    listen_count: 15200,
    created_at: '2026-02-10T22:30:00Z',
    updated_at: '2026-02-10T22:30:00Z',
    category: MOCK_CATEGORIES[3]
  }
]
