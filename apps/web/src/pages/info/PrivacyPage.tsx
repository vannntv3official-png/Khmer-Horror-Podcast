import React from 'react'
import { Shield } from 'lucide-react'
import { APP_CONFIG } from '@khmer-horror/shared'

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          គោលការណ៍ឯកជនភាព (Privacy Policy)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          កាលបរិច្ឆេទធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ ខែមករា ឆ្នាំ ២០២៦
        </p>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-purple-200/80 shadow-xl space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">១. ការប្រមូលព័ត៌មាន</h2>
          <p>
            {APP_CONFIG.appNameKm} ប្រមូលតែព័ត៌មានចាំបាច់ដើម្បីផ្ដល់សេវាកម្មស្ដាប់រឿងប៉ុណ្ណោះ រួមមាន អាសយដ្ឋានអ៊ីមែល ឈ្មោះគណនី និងប្រវត្តិស្ដាប់ (Listening Progress) ដើម្បីឱ្យអ្នកអាចស្ដាប់បន្តបានយ៉ាងរលូន។
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">២. ការប្រើប្រាស់ទិន្នន័យ</h2>
          <p>
            យើងប្រើប្រាស់ទិន្នន័យរបស់អ្នកដើម្បី៖
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>ផ្ទៀងផ្ទាត់សិទ្ធិចូលស្ដាប់រឿង VIP</li>
            <li>រក្សាទុកប្រវត្តិស្ដាប់ និងរឿងចូលចិត្ត</li>
            <li>កែលម្អគុណភាពនៃកម្មវិធី និងគេហទំព័រ</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">៣. សុវត្ថិភាពទិន្នន័យ</h2>
          <p>
            យើងប្រើប្រាស់បច្ចេកវិទ្យា Row Level Security (RLS) និងការអ៊ិនគ្រីប (Encryption) តាមរយៈ Supabase PostgreSQL ដើម្បីការពារទិន្នន័យគណនីរបស់អ្នក។ យើងមិនលក់ ឬចែករំលែកទិន្នន័យផ្ទាល់ខ្លួនទៅឱ្យភាគីទីបីដោយគ្មានការអនុញ្ញាតឡើយ។
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">៤. សិទ្ធិរបស់អ្នកប្រើប្រាស់</h2>
          <p>
            អ្នកមានសិទ្ធិកែប្រែ ឬលុបគណនីរបស់អ្នកគ្រប់ពេលវេលា តាមរយៈទំព័រការកំណត់ ឬដោយទាក់ទងមកកាន់ក្រុមការងារ។
          </p>
        </section>
      </div>
    </div>
  )
}
