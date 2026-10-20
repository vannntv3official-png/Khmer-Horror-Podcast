import React, { useState } from 'react'
import { Mail, Send, MessageSquare, CheckCircle, Globe } from 'lucide-react'
import { APP_CONFIG } from '@khmer-horror/shared'

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          ទំនាក់ទំនងពួកយើង
        </h1>
        <p className="text-sm text-slate-600">
          មានសំណួរ ឬចង់ចែករំលែករឿងព្រឺព្រួចផ្ទាល់ខ្លួនរបស់អ្នក? សូមទាក់ទងមកកាន់យើងខ្ញុំ។
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-purple-200/80 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">អ៊ីមែលគាំទ្រ (Email)</h3>
            <p className="text-xs text-slate-500">{APP_CONFIG.contactEmail}</p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-purple-200/80 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Telegram Channel & Support</h3>
            <a
              href={APP_CONFIG.supportTelegram}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-purple-700 font-bold underline block"
            >
              t.me/khmerhorrorpodcast
            </a>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-purple-200/80 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Facebook Page</h3>
            <a
              href={APP_CONFIG.socialFacebook}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-purple-700 font-bold underline block"
            >
              facebook.com/khmerhorrorpodcast
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-purple-200/80 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-700" />
            <span>ផ្ញើសារមកកាន់យើង</span>
          </h3>

          {sent ? (
            <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="font-bold text-sm">សាររបស់អ្នកត្រូវបានផ្ញើដោយជោគជ័យ!</p>
              <p className="text-xs text-slate-600">យើងនឹងឆ្លើយតបត្រឡប់ទៅកាន់អ៊ីមែលរបស់អ្នកឱ្យបានឆាប់បំផុត។</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ឈ្មោះរបស់អ្នក</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  placeholder="ឈ្មោះ ឬឈ្មោះក្រៅ"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">អ៊ីមែល (Email)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">សារ ឬរឿងរ៉ាវ</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  placeholder="សរសេរសារ ឬចែករំលែកបទពិសោធន៍រឿងព្រឺព្រួចរបស់អ្នកនៅទីនេះ..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition active:scale-95"
              >
                ផ្ញើសារ (Send Message)
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
