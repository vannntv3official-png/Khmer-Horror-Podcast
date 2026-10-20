import React from 'react'
import { Link } from 'react-router-dom'
import { Skull, Heart, Shield, Radio, Sparkles, Send, Globe } from 'lucide-react'
import { APP_CONFIG } from '@khmer-horror/shared'

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-purple-200/60 bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-900 to-purple-700 flex items-center justify-center text-white shadow-md">
                <Skull className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                {APP_CONFIG.appNameKm}
              </span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed pr-6">
              {APP_CONFIG.taglineKm} — កម្មវិធី និងគេហទំព័រផលិតឡើងដោយផ្ចិតផ្ចង់បំផុត ដើម្បីនាំមកនូវបទពិសោធន៍ស្ដាប់រឿងព្រឺព្រួចខ្មែរពិតៗ តាមរយៈសំឡេងកម្រិតច្បាស់ខ្ពស់។
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={APP_CONFIG.supportTelegram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center text-purple-700 transition"
                title="Telegram Channel"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href={APP_CONFIG.socialFacebook}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center text-purple-700 transition"
                title="Facebook Page"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              មាតិការឿង
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/stories" className="hover:text-purple-700 transition">
                  រឿងទាំងអស់
                </Link>
              </li>
              <li>
                <Link to="/stories?tier=free" className="hover:text-purple-700 transition">
                  រឿងស្ដាប់ឥតគិតថ្លៃ (Free)
                </Link>
              </li>
              <li>
                <Link to="/stories?tier=premium" className="hover:text-purple-700 transition flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  រឿង VIP ផ្តាច់មុខ
                </Link>
              </li>
              <li>
                <Link to="/stories?sortBy=popular" className="hover:text-purple-700 transition">
                  រឿងពេញនិយមបំផុត
                </Link>
              </li>
            </ul>
          </div>

          {/* Membership */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              សមាជិកភាព VIP
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/premium" className="hover:text-purple-700 transition">
                  គម្រោងប្រចាំខែ ($2.99)
                </Link>
              </li>
              <li>
                <Link to="/premium" className="hover:text-purple-700 transition">
                  គម្រោងប្រចាំឆ្នាំ VIP ($24.99)
                </Link>
              </li>
              <li>
                <Link to="/premium" className="hover:text-purple-700 transition">
                  គម្រោង Lifetime ($69.99)
                </Link>
              </li>
              <li>
                <Link to="/premium" className="hover:text-purple-700 transition">
                  វិធីសាស្ត្រទូទាត់ ABA / KHQR
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal and Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              ព័ត៌មាន & ច្បាប់
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/about" className="hover:text-purple-700 transition">
                  អំពីពួកយើង (About)
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-purple-700 transition">
                  គោលការណ៍ឯកជនភាព (Privacy)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-purple-700 transition">
                  លក្ខខណ្ឌប្រើប្រាស់ (Terms)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-purple-700 transition">
                  ទំនាក់ទំនង (Contact)
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-purple-100/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {APP_CONFIG.appNameKm} ({APP_CONFIG.appNameEn}). រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>បង្កើតឡើងដោយក្ដីស្រឡាញ់ចំពោះរឿងព្រឺព្រួចខ្មែរ</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  )
}
