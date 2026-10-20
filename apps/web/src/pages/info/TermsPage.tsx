import React from 'react'
import { FileText } from 'lucide-react'
import { APP_CONFIG } from '@khmer-horror/shared'

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          លក្ខខណ្ឌប្រើប្រាស់ (Terms of Service)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          សូមអានលក្ខខណ្ឌទាំងនេះដោយយកចិត្តទុកដាក់មុនពេលប្រើប្រាស់សេវាកម្មរបស់យើង
        </p>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-purple-200/80 shadow-xl space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">១. កម្មសិទ្ធិបញ្ញា</h2>
          <p>
            រាល់សំឡេងនិទាន អត្ថបទរឿង រូបភាពគម្រប និងបែបផែនសំឡេងទាំងអស់នៅលើ {APP_CONFIG.appNameKm} គឺជាកម្មសិទ្ធិបញ្ញាផ្តាច់មុខរបស់ Khmer Horror Podcast។ ការទាញយក កត់ត្រា ឬចែកចាយបន្តដោយគ្មានការអនុញ្ញាតជាលាយលក្ខណ៍អក្សរ ត្រូវបានហាមឃាត់ដាច់ខាត។
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">២. ការជាវសមាជិកភាព VIP</h2>
          <p>
            ការជាវគម្រោង VIP ផ្ដល់សិទ្ធិឱ្យអ្នកស្ដាប់រឿងទាំងអស់ក្នុងអំឡុងពេលដែលគម្រោងមានសុពលភាព។ គណនី VIP គឺសម្រាប់ប្រើប្រាស់ផ្ទាល់ខ្លួន ហើយមិនត្រូវចែករំលែកជាមួយអ្នកដទៃជាសាធារណៈឡើយ។
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">៣. ការបដិសេធការទទួលខុសត្រូវលើមាតិកា</h2>
          <p>
            រឿងរ៉ាវទាំងអស់មានគោលបំណងកម្សាន្ត និងអភិរក្សជំនឿបុរាណប៉ុណ្ណោះ។ មិនមានបំណងបង្កការភ័យខ្លាចដល់សុខភាពផ្លូវចិត្ត ឬបំពានលើជំនឿសាសនានោះទេ។ កុមារតូចៗគួរតែមានការណែនាំពីអាណាព្យាបាលពេលស្ដាប់។
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">៤. ការផ្លាស់ប្តូរលក្ខខណ្ឌ</h2>
          <p>
            យើងខ្ញុំសូមរក្សាសិទ្ធិក្នុងការកែប្រែលក្ខខណ្ឌទាំងនេះតាមការចាំបាច់ ដោយនឹងជូនដំណឹងនៅលើគេហទំព័រ។
          </p>
        </section>
      </div>
    </div>
  )
}
