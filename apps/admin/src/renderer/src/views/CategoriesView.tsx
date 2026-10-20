import React, { useState } from 'react'
import type { Category, Story } from '@khmer-horror/shared'
import { slugify, formatDate } from '@khmer-horror/shared'
import { supabase, isSupabaseConfigured, logAdminAction } from '../lib/supabase'
import { FolderTree, Plus, Edit, Trash2, X, Save } from 'lucide-react'

interface CategoriesViewProps {
  categories: Category[]
  stories: Story[]
  onCategoriesChange: (updatedCategories: Category[]) => void
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  stories,
  onCategoriesChange
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleOpenNew = () => {
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: '',
      name_en: '',
      slug: '',
      description: '',
      created_at: new Date().toISOString()
    }
    setEditingCategory(newCat)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory({ ...cat })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return
    setIsSaving(true)

    try {
      const exists = categories.some((c) => c.id === editingCategory.id)
      let updated: Category[] = []

      if (exists) {
        updated = categories.map((c) => (c.id === editingCategory.id ? editingCategory : c))
        if (isSupabaseConfigured) {
          await supabase.from('categories').update({
            name: editingCategory.name,
            name_en: editingCategory.name_en,
            slug: editingCategory.slug || slugify(editingCategory.name),
            description: editingCategory.description
          }).eq('id', editingCategory.id)

          await logAdminAction('category_updated', 'category', editingCategory.id, { name: editingCategory.name })
        }
      } else {
        updated = [...categories, editingCategory]
        if (isSupabaseConfigured) {
          await supabase.from('categories').insert({
            name: editingCategory.name,
            name_en: editingCategory.name_en,
            slug: editingCategory.slug || slugify(editingCategory.name),
            description: editingCategory.description
          })

          await logAdminAction('category_created', 'category', editingCategory.id, { name: editingCategory.name })
        }
      }

      onCategoriesChange(updated)
      setIsModalOpen(false)
      setEditingCategory(null)
    } catch (err) {
      console.error('Failed to save category:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុបប្រភេទ «${name}» នេះមែនទេ?`)) return
    const updated = categories.filter((c) => c.id !== id)
    onCategoriesChange(updated)

    if (isSupabaseConfigured) {
      await supabase.from('categories').delete().eq('id', id)
      await logAdminAction('category_deleted', 'category', id, { name })
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-purple-700" />
            <span>គ្រប់គ្រងប្រភេទទស្សនីយភាពរឿង (Categories)</span>
          </h2>
          <p className="text-xs text-slate-500">
            បែងចែកប្រភេទរឿងព្រឺព្រួច អបិយជំនឿ ព្រៃជ្រៅ និងខ្មោចលង
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>បង្កើតប្រភេទថ្មី</span>
        </button>
      </div>

      <div className="admin-card rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">ឈ្មោះប្រភេទ (ខ្មែរ)</th>
              <th className="py-3 px-4">ឈ្មោះជាភាសាអង់គ្លេស</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-3">ចំនួនរឿង</th>
              <th className="py-3 px-4 text-right">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => {
              const count = stories.filter((s) => s.category_id === cat.id).length
              return (
                <tr key={cat.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{cat.name}</td>
                  <td className="py-3 px-4 text-slate-600">{cat.name_en || '—'}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{cat.slug}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      {count} រឿង
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50"
                        title="កែសម្រួល"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50"
                        title="លុប"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCategory.name ? 'កែសម្រួលប្រភេទ' : 'បង្កើតប្រភេទថ្មី'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ឈ្មោះប្រភេទជាភាសាខ្មែរ *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setEditingCategory({
                      ...editingCategory,
                      name,
                      slug: editingCategory.slug || slugify(name)
                    })
                  }}
                  className="w-full px-3 py-2 rounded-xl admin-input"
                  placeholder="ឧ. ព្រលឹងវិញ្ញាណ"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ឈ្មោះជាភាសាអង់គ្លេស (English Name)
                </label>
                <input
                  type="text"
                  value={editingCategory.name_en || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl admin-input"
                  placeholder="Spirits & Ghosts"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl admin-input font-mono"
                  placeholder="spirits-and-ghosts"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ការពិពណ៌នា</label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl admin-input"
                  placeholder="សេចក្តីពិពណ៌នាសង្ខេប..."
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
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

    </div>
  )
}
