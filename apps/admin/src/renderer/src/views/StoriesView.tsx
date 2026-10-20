import React, { useState } from 'react'
import type { Story, Category } from '@khmer-horror/shared'
import { formatDurationKhmer, toKhmerDigits, formatDate, slugify } from '@khmer-horror/shared'
import { supabase, isSupabaseConfigured, logAdminAction } from '../lib/supabase'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Crown,
  Eye,
  Filter,
  AlertTriangle,
  X,
  Save
} from 'lucide-react'

interface StoriesViewProps {
  stories: Story[]
  categories: Category[]
  onStoriesChange: (updatedStories: Story[]) => void
}

export const StoriesView: React.FC<StoriesViewProps> = ({
  stories,
  categories,
  onStoriesChange
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTier, setSelectedTier] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Modals state
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingStory, setDeletingStory] = useState<Story | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Filtered stories
  const filteredStories = stories.filter((story) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      if (!story.title.toLowerCase().includes(q) && !story.description?.toLowerCase().includes(q)) {
        return false
      }
    }
    if (selectedCategory !== 'all' && story.category_id !== selectedCategory) return false
    if (selectedTier === 'free' && story.is_premium) return false
    if (selectedTier === 'premium' && !story.is_premium) return false
    if (selectedStatus === 'published' && !story.is_published) return false
    if (selectedStatus === 'draft' && story.is_published) return false
    return true
  })

  // Toggle publish status
  const handleTogglePublish = async (story: Story) => {
    const newStatus = !story.is_published
    const updated = stories.map((s) => (s.id === story.id ? { ...s, is_published: newStatus } : s))
    onStoriesChange(updated)

    if (isSupabaseConfigured) {
      await supabase.from('stories').update({ is_published: newStatus }).eq('id', story.id)
      await logAdminAction(newStatus ? 'story_published' : 'story_unpublished', 'story', story.id, {
        title: story.title
      })
    }
  }

  // Toggle premium status
  const handleTogglePremium = async (story: Story) => {
    const newPremium = !story.is_premium
    const updated = stories.map((s) => (s.id === story.id ? { ...s, is_premium: newPremium } : s))
    onStoriesChange(updated)

    if (isSupabaseConfigured) {
      await supabase.from('stories').update({ is_premium: newPremium }).eq('id', story.id)
      await logAdminAction('story_tier_updated', 'story', story.id, { is_premium: newPremium })
    }
  }

  // Open Edit modal
  const handleOpenEdit = (story: Story) => {
    setEditingStory({ ...story })
    setIsEditModalOpen(true)
  }

  // Open New Story modal
  const handleOpenNew = () => {
    const newStory: Story = {
      id: `story_${Date.now()}`,
      title: '',
      slug: '',
      description: '',
      category_id: categories[0]?.id || null,
      cover_path: null,
      audio_path: '',
      duration_seconds: 0,
      is_premium: false,
      is_published: false,
      created_by: null,
      listen_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setEditingStory(newStory)
    setIsEditModalOpen(true)
  }

  // Save Edit/Create
  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStory) return
    setIsSaving(true)

    try {
      const exists = stories.some((s) => s.id === editingStory.id)
      let updatedList: Story[] = []

      if (exists) {
        updatedList = stories.map((s) => (s.id === editingStory.id ? editingStory : s))
        if (isSupabaseConfigured) {
          await supabase.from('stories').update({
            title: editingStory.title,
            slug: editingStory.slug || slugify(editingStory.title),
            description: editingStory.description,
            category_id: editingStory.category_id,
            duration_seconds: editingStory.duration_seconds,
            is_premium: editingStory.is_premium,
            is_published: editingStory.is_published,
            audio_path: editingStory.audio_path
          }).eq('id', editingStory.id)

          await logAdminAction('story_updated', 'story', editingStory.id, { title: editingStory.title })
        }
      } else {
        updatedList = [editingStory, ...stories]
        if (isSupabaseConfigured) {
          await supabase.from('stories').insert({
            title: editingStory.title,
            slug: editingStory.slug || slugify(editingStory.title),
            description: editingStory.description,
            category_id: editingStory.category_id,
            duration_seconds: editingStory.duration_seconds,
            is_premium: editingStory.is_premium,
            is_published: editingStory.is_published,
            audio_path: editingStory.audio_path || 'audio/manual-entry.mp3'
          })

          await logAdminAction('story_created', 'story', editingStory.id, { title: editingStory.title })
        }
      }

      onStoriesChange(updatedList)
      setIsEditModalOpen(false)
      setEditingStory(null)
    } catch (err) {
      console.error('Failed to save story:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deletingStory) return
    const updated = stories.filter((s) => s.id !== deletingStory.id)
    onStoriesChange(updated)

    if (isSupabaseConfigured) {
      await supabase.from('stories').delete().eq('id', deletingStory.id)
      await logAdminAction('story_deleted', 'story', deletingStory.id, { title: deletingStory.title })
    }

    setIsDeleteModalOpen(false)
    setDeletingStory(null)
  }

  return (
    <div className="p-8 space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមចំណងជើង..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs admin-input"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs admin-input"
          >
            <option value="all">គ្រប់ប្រភេទ</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs admin-input"
          >
            <option value="all">Free & VIP</option>
            <option value="free">តែ Free</option>
            <option value="premium">តែ VIP</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs admin-input"
          >
            <option value="all">គ្រប់ស្ថានភាព</option>
            <option value="published">បានបោះពុម្ព</option>
            <option value="draft">សេចក្តីព្រាង</option>
          </select>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>បង្កើតរឿងថ្មី</span>
        </button>
      </div>

      {/* Stories Table */}
      <div className="admin-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ចំណងជើងរឿង</th>
                <th className="py-3 px-3">ប្រភេទ</th>
                <th className="py-3 px-3">រយៈពេល</th>
                <th className="py-3 px-3">ចំនួនស្ដាប់</th>
                <th className="py-3 px-3">កម្រិត (Tier)</th>
                <th className="py-3 px-3">ស្ថានភាព</th>
                <th className="py-3 px-4 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStories.map((story) => (
                <tr key={story.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                        {story.cover_path ? (
                          <img
                            src={story.cover_path.startsWith('http') ? story.cover_path : `https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=100&q=80`}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{story.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{story.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {categories.find((c) => c.id === story.category_id)?.name || story.category?.name || 'ទូទៅ'}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {formatDurationKhmer(story.duration_seconds)}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {toKhmerDigits(story.listen_count)}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleTogglePremium(story)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                        story.is_premium
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                      title="ចុចដើម្បីប្តូរ Free / VIP"
                    >
                      {story.is_premium ? (
                        <>
                          <Crown className="w-3 h-3 fill-current" /> VIP
                        </>
                      ) : (
                        'Free'
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleTogglePublish(story)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                        story.is_published
                          ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                      title="ចុចដើម្បីប្តូរ បោះពុម្ព / ព្រាង"
                    >
                      {story.is_published ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-purple-700" /> បោះពុម្ព
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" /> សេចក្តីព្រាង
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(story)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition"
                        title="កែសម្រួល"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingStory(story)
                          setIsDeleteModalOpen(true)
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition"
                        title="លុបរឿង"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT / CREATE STORY MODAL */}
      {isEditModalOpen && editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingStory.title ? 'កែសម្រួលរឿង' : 'បង្កើតរឿងថ្មី'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ចំណងជើងរឿង (Title)</label>
                <input
                  type="text"
                  required
                  value={editingStory.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setEditingStory({
                      ...editingStory,
                      title,
                      slug: editingStory.slug || slugify(title)
                    })
                  }}
                  className="w-full px-3 py-2 rounded-xl admin-input"
                  placeholder="ឧ. សំឡេងយំក្រោយផ្ទះបាយ"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  required
                  value={editingStory.slug}
                  onChange={(e) => setEditingStory({ ...editingStory, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl admin-input font-mono"
                  placeholder="crying-behind-kitchen"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ប្រភេទទស្សនីយភាព (Category)</label>
                <select
                  value={editingStory.category_id || ''}
                  onChange={(e) => setEditingStory({ ...editingStory, category_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl admin-input"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">រយៈពេលគិតជាវិនាទី (Duration Seconds)</label>
                <input
                  type="number"
                  min="0"
                  value={editingStory.duration_seconds}
                  onChange={(e) => setEditingStory({ ...editingStory, duration_seconds: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl admin-input"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ស្មើនឹង៖ {formatDurationKhmer(editingStory.duration_seconds)}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ផ្លូវឯកសារសំឡេង Audio Path (story-audio)</label>
                <input
                  type="text"
                  required
                  value={editingStory.audio_path}
                  onChange={(e) => setEditingStory({ ...editingStory, audio_path: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl admin-input font-mono"
                  placeholder="audio/sample.mp3"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ការពិពណ៌នារឿង (Description)</label>
                <textarea
                  rows={3}
                  value={editingStory.description || ''}
                  onChange={(e) => setEditingStory({ ...editingStory, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl admin-input"
                  placeholder="សរសេរដំណើររឿងសង្ខេប..."
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingStory.is_premium}
                    onChange={(e) => setEditingStory({ ...editingStory, is_premium: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                  <span>កំណត់ជារឿង VIP (Premium)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingStory.is_published}
                    onChange={(e) => setEditingStory({ ...editingStory, is_published: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                  <span>បោះពុម្ពផ្សាយភ្លាមៗ (Published)</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && deletingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">បញ្ជាក់ការលុបរឿង</h3>
              <p className="text-xs text-slate-500">
                តើអ្នកពិតជាចង់លុបរឿង «<strong>{deletingStory.title}</strong>» នេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ។
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-1/2 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                បោះបង់
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="w-1/2 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                យល់ព្រមលុប
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
