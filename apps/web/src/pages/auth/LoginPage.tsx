import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Skull, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await signIn(email, password)
    setLoading(false)

    if (res.error) {
      setError(res.error.message || 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ')
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo and Heading */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-900 flex items-center justify-center text-white shadow-xl shadow-purple-900/20">
              <Skull className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">
            ចូលគណនីរបស់អ្នក
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            ស្វាគមន៍មកកាន់ពិភពរឿងព្រឺព្រួចខ្មែរ
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ពាក្យសម្ងាត់ (Password)
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-purple-700 hover:underline font-semibold"
                >
                  ភ្លេចពាក្យសម្ងាត់?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-600 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                  <span>ចូលគណនី</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-purple-100 text-center text-xs text-slate-600">
            មិនទាន់មានគណនីនៅឡើយ?{' '}
            <Link to="/register" className="font-bold text-purple-700 hover:underline">
              ចុះឈ្មោះគណនីថ្មី
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
