import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Skull, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('ពាក្យសម្ងាត់ផ្ទៀងផ្ទាត់មិនត្រូវគ្នាទេ')
      return
    }

    if (password.length < 6) {
      setError('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ')
      return
    }

    setLoading(true)
    const res = await signUp(email, password, displayName)
    setLoading(false)

    if (res.error) {
      const msg = res.error.message?.toLowerCase() || ''
      if (msg.includes('rate limit')) {
        setError('បានលើសកំណត់នៃការផ្ញើអ៊ីមែលរបស់ Supabase (Rate limit exceeded)។ សូមដំណើរការ script Auto-Confirm ក្នុង Supabase SQL Editor ដើម្បីចុះឈ្មោះបានភ្លាមៗ។')
      } else {
        setError(res.error.message || 'ការចុះឈ្មោះមានបញ្ហា សូមព្យាយាមម្តងទៀត')
      }
    } else {
      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 2000)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo and Heading */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-900 flex items-center justify-center text-white shadow-xl shadow-purple-900/20">
              <Skull className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">
            ចុះឈ្មោះគណនីថ្មី
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            ចូលរួមស្ដាប់រឿងព្រឺព្រួច និងទទួលបានការជូនដំណឹងរឿងថ្មីៗ
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel p-8 rounded-3xl border border-purple-200/80 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>ចុះឈ្មោះជោគជ័យ! កំពុងបញ្ជូនទៅទំព័រដើម...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ឈ្មោះអ្នកប្រើប្រាស់ (Display Name)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-purple-600 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ សុខា"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm glass-input placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                អ៊ីមែល (Email)
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ពាក្យសម្ងាត់ (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-600 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="យ៉ាងតិច ៦ តួអក្សរ"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm glass-input placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                បញ្ជាក់ពាក្យសម្ងាត់ (Confirm Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-600 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="បញ្ចូលពាក្យសម្ងាត់ម្តងទៀត"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm glass-input placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>ចុះឈ្មោះបង្កើតគណនី</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-purple-100 text-center text-xs text-slate-600">
            មានគណនីរួចហើយ?{' '}
            <Link to="/login" className="font-bold text-purple-700 hover:underline">
              ចូលគណនីទីនេះ
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
