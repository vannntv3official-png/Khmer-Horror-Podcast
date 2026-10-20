import React, { useState, useEffect } from 'react'
import type { Story } from '@khmer-horror/shared'
import { formatBytes, formatDate } from '@khmer-horror/shared'
import { supabase, isSupabaseConfigured, logAdminAction } from '../lib/supabase'
import { HardDrive, Music, Image, Trash2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react'

interface StorageViewProps {
  stories: Story[]
}

interface StorageFile {
  name: string
  id?: string
  updated_at?: string
  created_at?: string
  last_accessed_at?: string
  metadata?: {
    size?: number
    mimetype?: string
  }
}

export const StorageView: React.FC<StorageViewProps> = ({ stories }) => {
  const [activeBucket, setActiveBucket] = useState<'story-audio' | 'story-covers'>('story-audio')
  const [files, setFiles] = useState<StorageFile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchBucketObjects = async () => {
    setIsLoading(true)
    if (!isSupabaseConfigured) {
      // Mock objects for testing
      if (activeBucket === 'story-audio') {
        setFiles([
          { name: 'sample-story-1.mp3', metadata: { size: 32400000, mimetype: 'audio/mpeg' }, created_at: new Date().toISOString() },
          { name: 'sample-story-2.mp3', metadata: { size: 45800000, mimetype: 'audio/mpeg' }, created_at: new Date().toISOString() },
          { name: 'sample-story-3.mp3', metadata: { size: 28200000, mimetype: 'audio/mpeg' }, created_at: new Date().toISOString() },
          { name: 'sample-vip-1.mp3', metadata: { size: 58900000, mimetype: 'audio/mpeg' }, created_at: new Date().toISOString() },
          { name: 'sample-vip-2.mp3', metadata: { size: 74200000, mimetype: 'audio/mpeg' }, created_at: new Date().toISOString() },
          { name: 'sample-vip-3.mp3', metadata: { size: 51200000, mimetype: 'audio/mpeg' }, created_at: new Date().toISOString() },
          { name: 'orphan-test-file.mp3', metadata: { size: 12000000, mimetype: 'audio/mpeg' }, created_at: new Date().toISOString() }
        ])
      } else {
        setFiles([
          { name: 'crying-kitchen.webp', metadata: { size: 450000, mimetype: 'image/webp' }, created_at: new Date().toISOString() },
          { name: 'swamp-shortcut.webp', metadata: { size: 620000, mimetype: 'image/webp' }, created_at: new Date().toISOString() },
          { name: 'cutting-nails.webp', metadata: { size: 380000, mimetype: 'image/webp' }, created_at: new Date().toISOString() },
          { name: 'room-404.webp', metadata: { size: 540000, mimetype: 'image/webp' }, created_at: new Date().toISOString() },
          { name: 'cardamom-spirit.webp', metadata: { size: 710000, mimetype: 'image/webp' }, created_at: new Date().toISOString() },
          { name: 'phone-call.webp', metadata: { size: 490000, mimetype: 'image/webp' }, created_at: new Date().toISOString() }
        ])
      }
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.storage.from(activeBucket).list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })

      if (error) throw error
      if (data) setFiles(data as any)
    } catch (err) {
      console.error('Failed to list storage objects:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBucketObjects()
  }, [activeBucket])

  // Orphaned file check
  const isObjectReferenced = (fileName: string): boolean => {
    if (activeBucket === 'story-audio') {
      return stories.some((s) => s.audio_path && s.audio_path.includes(fileName))
    } else {
      return stories.some((s) => s.cover_path && s.cover_path.includes(fileName))
    }
  }

  // Delete object safely
  const handleDeleteObject = async (fileName: string) => {
    const isReferenced = isObjectReferenced(fileName)
    if (isReferenced) {
      alert('មិនអាចលុបឯកសារនេះបានទេ! ឯកសារនេះកំពុងត្រូវបានប្រើប្រាស់ដោយរឿងក្នុងប្រព័ន្ធ។')
      return
    }

    if (!confirm(`តើអ្នកពិតជាចង់លុបឯកសារ «${fileName}» នេះពី ${activeBucket} មែនទេ?`)) return

    if (isSupabaseConfigured) {
      await supabase.storage.from(activeBucket).remove([fileName])
      await logAdminAction('storage_object_deleted', 'storage', fileName, { bucket: activeBucket })
    }

    setFiles((prev) => prev.filter((f) => f.name !== fileName))
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-purple-700" />
            <span>គ្រប់គ្រង Storage & ឯកសារមេឌៀ (Storage Management)</span>
          </h2>
          <p className="text-xs text-slate-500">
            ត្រួតពិនិត្យឯកសារក្នុង storage buckets និងស្វែងរកឯកសារកំព្រា (Orphaned Files)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveBucket('story-audio')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeBucket === 'story-audio' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>story-audio (Private)</span>
            </button>
            <button
              onClick={() => setActiveBucket('story-covers')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeBucket === 'story-covers' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>story-covers (Public)</span>
            </button>
          </div>

          <button
            onClick={fetchBucketObjects}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="ទាញយកបញ្ជីឡើងវិញ"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bucket Objects Table */}
      <div className="admin-card rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">ឈ្មោះឯកសារ (File Object)</th>
              <th className="py-3 px-3">ទំហំ</th>
              <th className="py-3 px-3">ប្រភេទ (Mime)</th>
              <th className="py-3 px-3">ស្ថានភាពយោង (Reference)</th>
              <th className="py-3 px-4 text-right">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {files.map((file) => {
              const referenced = isObjectReferenced(file.name)
              return (
                <tr key={file.name} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {file.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {file.metadata?.size ? formatBytes(file.metadata.size) : '—'}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {file.metadata?.mimetype || (activeBucket === 'story-audio' ? 'audio/mpeg' : 'image/webp')}
                  </td>
                  <td className="py-3 px-3">
                    {referenced ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                        <ShieldCheck className="w-3 h-3" /> មានរឿងប្រើប្រាស់
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1 w-max">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> ឯកសារកំព្រា (Orphan)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteObject(file.name)}
                      className={`p-1.5 rounded-lg transition ${
                        referenced
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                      disabled={referenced}
                      title={referenced ? 'មិនអាចលុបបានទេ ព្រោះមានរឿងកំពុងប្រើ' : 'លុបឯកសារកំព្រានេះ'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}
