import React, { useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { Settings, Database, HardDrive, Shield, LogOut, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface SettingsViewProps {
  onSignOut: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSignOut }) => {
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setConnectionResult(null)

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setConnectionResult({
          success: false,
          message: 'កម្មវិធីកំពុងដំណើរការក្នុងទម្រង់ Standalone Demo ដោយសារ VITE_SUPABASE_URL មិនទាន់ត្រូវបានកំណត់។'
        })
        setTestingConnection(false)
      }, 800)
      return
    }

    try {
      const { data, error } = await supabase.from('categories').select('count', { count: 'exact', head: true })
      if (error) throw error
      setConnectionResult({
        success: true,
        message: 'ការតភ្ជាប់ទៅកាន់ Supabase Database & Auth ជោគជ័យ ១០០%!'
      })
    } catch (err: any) {
      setConnectionResult({
        success: false,
        message: err.message || 'មិនអាចតភ្ជាប់ទៅកាន់ Supabase បានទេ'
      })
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-700" />
          <span>ការកំណត់ប្រព័ន្ធ (System Settings)</span>
        </h2>
        <p className="text-xs text-slate-500">
          ព័ត៌មានលម្អិតនៃកម្មវិធី និងការត្រួតពិនិត្យការតភ្ជាប់ Backend
        </p>
      </div>

      {/* App Info Card */}
      <div className="admin-card p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          ព័ត៌មានកម្មវិធី (Application Details)
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block">ឈ្មោះកម្មវិធី (Application):</span>
            <span className="font-bold text-slate-800">Khmer Horror Admin</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block">កំណែទម្រង់ (Version):</span>
            <span className="font-bold text-purple-700">v1.0.0 Production</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block">Frameworks:</span>
            <span className="font-bold text-slate-800">Electron 33, React 18, Tailwind CSS</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block">Backend Database:</span>
            <span className="font-bold text-slate-800">Supabase PostgreSQL & Storage</span>
          </div>
        </div>
      </div>

      {/* Backend Connection Check Card */}
      <div className="admin-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-700" />
              <span>ស្ថានភាពតភ្ជាប់ Supabase (Connection Status)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ពិនិត្យមើលថាតើ Desktop Application អាចទាក់ទងជាមួយ Supabase បានត្រឹមត្រូវឬទេ
            </p>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
            <span>{testingConnection ? 'កំពុងពិនិត្យ...' : 'ធ្វើតេស្តការតភ្ជាប់'}</span>
          </button>
        </div>

        {connectionResult && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
              connectionResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {connectionResult.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <span>{connectionResult.message}</span>
          </div>
        )}
      </div>

      {/* Storage and Security Rules */}
      <div className="admin-card p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-purple-700" />
          <span>ការកំណត់ Storage & សុវត្ថិភាព (Security Limits)</span>
        </h3>
        <ul className="space-y-2 text-xs text-slate-600 list-disc pl-5">
          <li><strong>story-audio Bucket:</strong> Private — ទំហំឯកសារអតិបរមា 300 MB (.mp3, .m4a, .wav)។ ចេញ Signed URL ដែលមានសុពលភាព 3600s សម្រាប់តែអ្នកដែលមានសិទ្ធិ។</li>
          <li><strong>story-covers Bucket:</strong> Public — ទំហំអតិបរមា 10 MB (.webp, .jpg, .png)។ អាចទាញយកបង្ហាញជាសាធារណៈ។</li>
          <li><strong>Row Level Security (RLS):</strong> បើកដំណើរការគ្រប់តារាងទាំងអស់។ User ធម្មតាមិនអាចមើលរឿងដែលមិនទាន់ Publish ឬលុបទិន្នន័យបានឡើយ។</li>
        </ul>
      </div>

      {/* Logout Row */}
      <div className="admin-card p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-slate-900">ចាកចេញពីផ្ទាំង Admin</h4>
          <p className="text-xs text-slate-500">ចាកចេញពីគណនីគ្រប់គ្រងលើកុំព្យូទ័រនេះ</p>
        </div>
        <button
          onClick={onSignOut}
          className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs border border-red-200 flex items-center gap-1.5 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>ចាកចេញ (Sign Out)</span>
        </button>
      </div>

    </div>
  )
}
