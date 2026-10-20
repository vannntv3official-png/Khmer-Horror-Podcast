import React, { useState, useRef } from 'react'
import type { Story, Category } from '@khmer-horror/shared'
import {
  isValidAudioFile,
  isValidImageFile,
  slugify,
  formatBytes,
  formatDurationKhmer
} from '@khmer-horror/shared'
import { uploadAudioFile, uploadCoverImage, supabase, isSupabaseConfigured, logAdminAction } from '../lib/supabase'
import {
  UploadCloud,
  FileAudio,
  Image,
  CheckCircle,
  AlertCircle,
  Clock,
  Crown,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react'

interface UploadMp3ViewProps {
  categories: Category[]
  onStoryUploaded: (newStory: Story) => void
}

export const UploadMp3View: React.FC<UploadMp3ViewProps> = ({
  categories,
  onStoryUploaded
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [description, setDescription] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [isPublished, setIsPublished] = useState(true)

  const [durationSeconds, setDurationSeconds] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const audioInputRef = useRef<HTMLInputElement | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)

  // Handle audio selection & detect duration
  const handleAudioSelect = (file: File) => {
    setError(null)
    if (!isValidAudioFile(file.name, file.type)) {
      setError('ឯកសារមិនត្រឹមត្រូវ។ សូមជ្រើសរើសឯកសារ MP3, M4A ឬ WAV។')
      return
    }

    if (file.size > 250 * 1024 * 1024) {
      setError('ទំហំឯកសារធំពេក (អតិបរមា 250 MB)')
      return
    }

    setAudioFile(file)
    if (!title) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setTitle(baseName)
      setSlug(slugify(baseName))
    }

    // Detect duration using temporary object URL
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.onloadedmetadata = () => {
      setDurationSeconds(Math.floor(audio.duration || 0))
      URL.revokeObjectURL(url)
    }
  }

  // Handle cover selection
  const handleCoverSelect = (file: File) => {
    setError(null)
    if (!isValidImageFile(file.name, file.type)) {
      setError('រូបភាពមិនត្រឹមត្រូវ។ សូមជ្រើសរើស JPG, PNG ឬ WEBP។')
      return
    }
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  // Submit Upload
  const handleStartUpload = async (publishImmediately: boolean) => {
    if (!audioFile) {
      setError('សូមជ្រើសរើសឯកសារ MP3 ជាមុន')
      return
    }
    if (!title.trim()) {
      setError('សូមបញ្ចូលចំណងជើងរឿង')
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadProgress(10)

    try {
      const storySlug = slug || slugify(title)

      // 1. Upload Cover if present
      let coverPath: string | null = null
      if (coverFile) {
        setUploadProgress(25)
        coverPath = await uploadCoverImage(coverFile, storySlug)
      }

      // 2. Upload Audio
      setUploadProgress(40)
      const audioPath = await uploadAudioFile(audioFile, storySlug, (p) => {
        setUploadProgress(40 + Math.floor(p * 0.4))
      })
      setUploadProgress(85)

      // 3. Insert Story Record into Supabase
      const newStoryRecord: Story = {
        id: `story_${Date.now()}`,
        title,
        slug: storySlug,
        description,
        category_id: categoryId || null,
        cover_path: coverPath || (coverPreview ? coverPreview : null),
        audio_path: audioPath,
        duration_seconds: durationSeconds || 1200,
        is_premium: isPremium,
        is_published: publishImmediately,
        created_by: null,
        listen_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (isSupabaseConfigured) {
        const { data, error: dbError } = await supabase.from('stories').insert({
          title,
          slug: storySlug,
          description,
          category_id: categoryId || null,
          cover_path: coverPath,
          audio_path: audioPath,
          duration_seconds: durationSeconds || 1200,
          is_premium: isPremium,
          is_published: publishImmediately
        }).select().single()

        if (dbError) throw dbError
        if (data) {
          Object.assign(newStoryRecord, data)
        }

        await logAdminAction('story_uploaded', 'story', newStoryRecord.id, {
          title,
          audioPath,
          durationSeconds
        })
      }

      setUploadProgress(100)
      setSuccess(true)
      onStoryUploaded(newStoryRecord)

      // Reset form
      setTimeout(() => {
        setAudioFile(null)
        setCoverFile(null)
        setCoverPreview(null)
        setTitle('')
        setSlug('')
        setDescription('')
        setDurationSeconds(0)
        setUploadProgress(0)
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error('Upload failed:', err)
      setError(err.message || 'ការបញ្ចូលឯកសារបរាជ័យ')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-purple-700" />
          <span>មជ្ឈមណ្ឌលបញ្ចូលឯកសារ MP3 (Upload Center)</span>
        </h2>
        <p className="text-xs text-slate-500">
          បញ្ចូលឯកសារសំឡេងរឿងរន្ធត់ខ្មែរ រូបភាពគម្រប និងព័ត៌មានលម្អិតចូលក្នុងប្រព័ន្ធ
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>បញ្ចូលរឿង និងឯកសារ MP3 ជោគជ័យ!</span>
        </div>
      )}

      {/* Main Upload Card Form */}
      <div className="admin-card rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* Row 1: Audio Drag and Drop Zone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            ឯកសារសំឡេង MP3 (Story Audio File) *
          </label>
          <div
            onClick={() => audioInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (e.dataTransfer.files?.[0]) {
                handleAudioSelect(e.dataTransfer.files[0])
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
              audioFile
                ? 'border-purple-500 bg-purple-50/50'
                : 'border-slate-300 hover:border-purple-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a"
              onChange={(e) => e.target.files?.[0] && handleAudioSelect(e.target.files[0])}
              className="hidden"
            />
            {audioFile ? (
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-slate-900">{audioFile.name}</p>
                  <p className="text-xs text-slate-500">
                    ទំហំ: {formatBytes(audioFile.size)} | រយៈពេល: {formatDurationKhmer(durationSeconds)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  ចុចដើម្បីជ្រើសរើស ឬអូសទម្លាក់ឯកសារ MP3 នៅទីនេះ
                </p>
                <p className="text-[11px] text-slate-400">
                  គាំទ្រ .mp3, .m4a, .wav (ទំហំអតិបរមា 250MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Cover Art & Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Cover Art Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              រូបភាពគម្របរឿង (Cover Artwork)
            </label>
            <div
              onClick={() => coverInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-purple-400 overflow-hidden cursor-pointer bg-slate-50 flex flex-col items-center justify-center relative group"
            >
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleCoverSelect(e.target.files[0])}
                className="hidden"
              />
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                    ប្តូររូបភាព
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-1">
                  <Image className="w-6 h-6 text-slate-400 mx-auto" />
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    ជ្រើសរើសរូបភាព
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    1:1 ឬ 16:10 WEBP / JPG
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata inputs (2 cols) */}
          <div className="md:col-span-2 space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ចំណងជើងរឿង (Story Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (!slug || slug === slugify(title)) {
                    setSlug(slugify(e.target.value))
                  }
                }}
                placeholder="ឧ. ផ្លូវកាត់ព្រៃលិចទឹកកំពង់ធំ"
                className="w-full px-3.5 py-2.5 rounded-xl admin-input"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Slug (URL Identifier)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="kampong-thom-swamp-shortcut"
                className="w-full px-3.5 py-2 rounded-xl admin-input font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ប្រភេទរឿង (Category)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl admin-input"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  រយៈពេលគិតជាវិនាទី (Duration)
                </label>
                <input
                  type="number"
                  min="0"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl admin-input"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ការពិពណ៌នារឿង (Description)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="សេចក្តីសង្ខេបនៃដំណើររឿង..."
                className="w-full px-3 py-2 rounded-xl admin-input"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <span className="flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  កំណត់ជារឿង VIP (សមាជិកបង់ប្រាក់ទើបអាចស្ដាប់បាន)
                </span>
              </label>
            </div>
          </div>

        </div>

        {/* Progress Bar when uploading */}
        {isUploading && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-900">
              <span>កំពុង Upload ឯកសារទៅកាន់ Supabase Storage...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-700 to-violet-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions Row */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isUploading || !audioFile}
            onClick={() => handleStartUpload(false)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs disabled:opacity-50"
          >
            រក្សាទុកជាសេចក្តីព្រាង (Save Draft)
          </button>

          <button
            type="button"
            disabled={isUploading || !audioFile}
            onClick={() => handleStartUpload(true)}
            className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>បោះពុម្ពផ្សាយភ្លាមៗ (Publish)</span>
          </button>
        </div>

      </div>

    </div>
  )
}
