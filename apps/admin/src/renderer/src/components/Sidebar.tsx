import React from 'react'
import {
  Skull,
  LayoutDashboard,
  BookOpen,
  UploadCloud,
  FolderTree,
  Users,
  Crown,
  BarChart3,
  HardDrive,
  FileText,
  Settings,
  LogOut
} from 'lucide-react'

export type AdminTab =
  | 'dashboard'
  | 'stories'
  | 'upload'
  | 'categories'
  | 'users'
  | 'subscriptions'
  | 'analytics'
  | 'storage'
  | 'logs'
  | 'settings'

interface SidebarProps {
  currentTab: AdminTab
  onSelectTab: (tab: AdminTab) => void
  onSignOut: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onSignOut }) => {
  const menuItems: { id: AdminTab; label: string; labelEn: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'ផ្ទាំងគ្រប់គ្រង', labelEn: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'stories', label: 'គ្រប់គ្រងរឿង', labelEn: 'Stories', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'upload', label: 'បញ្ចូល MP3 ថ្មី', labelEn: 'Upload MP3', icon: <UploadCloud className="w-4 h-4" />, badge: 'Upload' },
    { id: 'categories', label: 'ប្រភេទទស្សនីយភាព', labelEn: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'users', label: 'អ្នកប្រើប្រាស់', labelEn: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'សមាជិកភាព VIP', labelEn: 'Subscriptions', icon: <Crown className="w-4 h-4" /> },
    { id: 'analytics', label: 'ស្ថិតិនៃការស្ដាប់', labelEn: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'storage', label: 'គ្រប់គ្រង Storage', labelEn: 'Storage', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'logs', label: 'កំណត់ត្រាសកម្មភាព', labelEn: 'Activity Logs', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'ការកំណត់ប្រព័ន្ធ', labelEn: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 h-screen select-none">
      
      {/* Brand Header */}
      <div>
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
            <Skull className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-wide">
              Khmer Horror Admin
            </h1>
            <p className="text-[11px] text-purple-400 font-medium">
              ផ្ទាំងគ្រប់គ្រងរឿងខ្មោចខ្មែរ
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-900/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer User Info & Sign Out */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <p className="text-[10px] text-slate-400">admin@khmerhorror.com</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
            title="ចាកចេញ (Sign Out)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  )
}
