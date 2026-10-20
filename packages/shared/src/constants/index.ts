import { SubscriptionPlan } from '../types'

export const STORAGE_BUCKETS = {
  AUDIO: 'story-audio',
  COVERS: 'story-covers',
} as const

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    nameKm: 'ប្រចាំខែ (Monthly)',
    nameEn: 'Monthly Pass',
    priceUsd: 2.99,
    billingInterval: 'month',
    descriptionKm: 'រីករាយជាមួយរឿងរន្ធត់ខ្មែរគ្រប់រឿង គ្មានដែនកំណត់រយៈពេល ៣០ ថ្ងៃ',
    descriptionEn: 'Unlimited listening to all premium Khmer horror stories for 30 days',
    featuresKm: [
      'ស្ដាប់រឿង Premium ទាំងអស់គ្មានដែនកំណត់',
      'សំឡេងច្បាស់កម្រិតខ្ពស់ HD Audio',
      'គ្មានការរំខានដោយពាណិជ្ជកម្ម',
      'គាំទ្រការស្ដាប់បន្ត (Continue Listening)',
      'ដកស្រង់រឿងថ្មីៗរៀងរាល់សប្តាហ៍'
    ],
    featuresEn: [
      'Unlimited access to all premium stories',
      'High-definition crystal clear audio',
      'Ad-free uninterrupted horror experience',
      'Sync continue listening across devices',
      'Exclusive new stories every week'
    ]
  },
  {
    id: 'yearly',
    nameKm: 'ប្រចាំឆ្នាំ (Yearly VIP)',
    nameEn: 'Yearly VIP Pass',
    priceUsd: 24.99,
    billingInterval: 'year',
    descriptionKm: 'សន្សំបាន ៣០% និងរីករាយពេញមួយឆ្នាំ ជាមួយនឹងរឿងរន្ធត់ផ្តាច់មុខ',
    descriptionEn: 'Save 30% and enjoy 1 full year of spine-chilling audio horror',
    isPopular: true,
    badgeKm: 'ពេញនិយមបំផុត (Best Value)',
    featuresKm: [
      'អត្ថប្រយោជន៍ទាំងអស់នៃគម្រោងប្រចាំខែ',
      'សន្សំសំចៃទឹកប្រាក់ជាង ៣០%',
      'ស្ដាប់រឿងថ្មីៗមុនគេ (Early Access)',
      'ចូលរួមបោះឆ្នោតជ្រើសរើសប្រធានបទរឿងបន្ទាប់',
      'ផ្លាកសញ្ញា VIP Supporter ក្នុង Profile'
    ],
    featuresEn: [
      'All features of the Monthly plan',
      'Save over 30% annually',
      'Early access to weekly releases',
      'Vote on upcoming storytelling themes',
      'Exclusive VIP Supporter profile badge'
    ]
  },
  {
    id: 'lifetime_vip',
    nameKm: 'ពេញមួយជីវិត (Lifetime Supporter)',
    nameEn: 'Lifetime Supporter',
    priceUsd: 69.99,
    billingInterval: 'lifetime',
    descriptionKm: 'បង់តែម្តង ស្ដាប់បានរហូតពេញមួយជីវិត សម្រាប់អ្នកស្រឡាញ់រឿងព្រឺព្រួចពិតប្រាកដ',
    descriptionEn: 'One-time payment for lifetime unlimited horror storytelling access',
    badgeKm: 'អស្ចារ្យ (Lifetime)',
    featuresKm: [
      'សិទ្ធិចូលស្ដាប់រហូតពេញមួយជីវិត',
      'ការគាំទ្រផលិតកររឿងរន្ធត់ខ្មែរផ្ទាល់',
      'ឈ្មោះកិត្តិយសក្នុងទំព័រអ្នកឧបត្ថម្ភ',
      'ទាញយករឿងសម្រាប់ស្ដាប់ក្រៅប្រព័ន្ធ (Offline Mode)',
      'ការថែទាំអតិថិជនពិសេស VIP Support'
    ],
    featuresEn: [
      'Lifetime unlimited access forever',
      'Direct support for Khmer folklore creators',
      'Honorary mention in supporter credits',
      'Offline audio download support',
      'Dedicated 24/7 VIP priority support'
    ]
  }
]

export const APP_CONFIG = {
  appNameKm: 'ផតខាស់រឿងរន្ធត់ខ្មែរ',
  appNameEn: 'Khmer Horror Podcast',
  taglineKm: 'ពិភពរឿងព្រឺព្រួច និងអបិយជំនឿខ្មែរពិតៗ តាមរយៈសំឡេង',
  taglineEn: 'Immersive Khmer audio horror storytelling and folklore mysteries',
  contactEmail: 'contact@khmerhorrorpodcast.com',
  supportTelegram: 'https://t.me/khmerhorrorpodcast',
  socialFacebook: 'https://facebook.com/khmerhorrorpodcast',
  itemsPerPage: 12,
  audioSignedUrlTtlSeconds: 3600 // 1 hour
} as const
