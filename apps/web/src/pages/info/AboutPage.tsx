import React from 'react'
import { Skull, Heart, Shield, Radio, Sparkles } from 'lucide-react'
import { APP_CONFIG } from '@khmer-horror/shared'

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-3xl bg-purple-900 text-white flex items-center justify-center mx-auto shadow-xl">
          <Skull className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          អំពី {APP_CONFIG.appNameKm}
        </h1>
        <p className="text-sm text-slate-600 font-medium">
          {APP_CONFIG.taglineKm}
        </p>
      </div>

      {/* Main Glass Content */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-purple-200/80 shadow-xl space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-700" />
          <span>បេសកកម្មរបស់យើង</span>
        </h2>
        <p>
          <strong>{APP_CONFIG.appNameKm}</strong> (Khmer Horror Podcast) ត្រូវបានបង្កើតឡើងក្នុងគោលបំណងលើកកម្ពស់សិល្បៈនិទានរឿង និងអភិរក្សជំនឿបុរាណ ព្រមទាំងរឿងរ៉ាវព្រឺព្រួចដែលកើតមានឡើងក្នុងប្រទេសកម្ពុជា តាមរយៈទម្រង់សំឡេងកម្រិតខ្ពស់ (High-Definition Audio Drama)។
        </p>
        <p>
          យើងជឿជាក់ថា សំឡេងមានអំណាចដ៏អស្ចារ្យក្នុងការដាស់អារម្មណ៍ភ័យរន្ធត់ និងការស្រមើស្រមៃរបស់អ្នកស្ដាប់។ គ្រប់ភាគទាំងអស់ត្រូវបានផលិតឡើងដោយការស្រាវជ្រាវ ការនិពន្ធយ៉ាងម៉ត់ចត់ និងការបញ្ចូលបែបផែនសំឡេង (Sound Effects) ដ៏គួរឱ្យព្រឺព្រួចបំផុត។
        </p>

        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 pt-4">
          <Shield className="w-5 h-5 text-purple-700" />
          <span>គុណតម្លៃស្នូល</span>
        </h2>
        <ul className="space-y-3 list-disc pl-5">
          <li><strong>គុណភាពសំឡេង៖</strong> ថត និងកាត់តដោយឧបករណ៍ស្ដង់ដារ ដើម្បីធានាបាននូវភាពច្បាស់ និងអន្លង់អន្លោច។</li>
          <li><strong>ការគោរពទំនៀមទម្លាប់៖</strong> ដកស្រង់ចេញពីជំនឿតំណមពិតប្រាកដរបស់ដូនតាខ្មែរ ដោយផ្អែកលើការគោរព។</li>
          <li><strong>ការបង្កើតថ្មី៖</strong> រួមបញ្ចូលគ្នានូវរឿងនិទានបុរាណ និងរឿងព្រឺព្រួចសម័យទំនើប។</li>
        </ul>

        <div className="pt-6 border-t border-purple-100 flex items-center justify-between text-xs text-slate-500">
          <span>បង្កើតឡើងក្នុងឆ្នាំ ២០២៦</span>
          <span className="flex items-center gap-1 font-semibold text-purple-700">
            Khmer Horror Podcast Team
          </span>
        </div>
      </div>

    </div>
  )
}
