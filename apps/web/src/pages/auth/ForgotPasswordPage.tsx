import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { Skull, Mail, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!isSupabaseConfigured) {
      setSubmitted(true)
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'មិនអាចផ្ញើតំណភ្ជាប់បានទេ សូមពិនិត្យអ៊ីមែលម្តងទៀត')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-900 flex items-center justify-center text-white shadow-xl">
              <Skull className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">
            ភ្លេចពាក្យសម្ងាត់
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            បញ្ចូលអ៊ីមែលរបស់អ្នកដើម្បីទទួលបានតំណភ្ជាប់ផ្លាស់ប្តូរពាក្យសម្ងាត់ថ្មី
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-purple-200/80 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                បានផ្ញើតំណភ្ជាប់ជោគជ័យ
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                យើងបានផ្ញើតំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញទៅកាន់ <strong className="text-purple-700">{email}</strong>។ សូមពិនិត្យប្រអប់សំបុត្រ (Inbox) ឬ Spam។
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:underline pt-2"
              >
                <ArrowLeft className="w-4 h-4" /> ត្រឡប់ទៅទំព័រចូលគណនី
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  អ៊ីមែលដែលបានចុះឈ្មោះ (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-600 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm glass-input placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ផ្ញើតំណភ្ជាប់</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="text-xs text-slate-600 hover:text-purple-700 font-semibold">
                  ត្រឡប់ទៅទំព័រចូលគណនីវិញ
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
