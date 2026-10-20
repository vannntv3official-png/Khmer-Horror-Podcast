import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { Skull, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('ពាក្យសម្ងាត់ផ្ទៀងផ្ទាត់មិនត្រូវគ្នាទេ')
      return
    }

    if (newPassword.length < 6) {
      setError('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ')
      return
    }

    setLoading(true)
    if (!isSupabaseConfigured) {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      setError(err.message || 'មិនអាចផ្លាស់ប្តូរពាក្យសម្ងាត់បានទេ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-900 flex items-center justify-center text-white shadow-xl mx-auto">
            <Skull className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            កំណត់ពាក្យសម្ងាត់ថ្មី
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            បញ្ចូលពាក្យសម្ងាត់ថ្មីសម្រាប់គណនីរបស់អ្នក
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-purple-200/80 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                បានផ្លាស់ប្តូរពាក្យសម្ងាត់ជោគជ័យ
              </h3>
              <p className="text-xs text-slate-500">
                កំពុងបញ្ជូនទៅកាន់ទំព័រចូលគណនី...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ពាក្យសម្ងាត់ថ្មី (New Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-600 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="យ៉ាងតិច ៦ តួអក្សរ"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm glass-input placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  បញ្ជាក់ពាក្យសម្ងាត់ថ្មី (Confirm Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-600 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត"
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
                    <span>រក្សាទុកពាក្យសម្ងាត់ថ្មី</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
