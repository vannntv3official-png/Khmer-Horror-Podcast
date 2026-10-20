import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Skull,
  Radio,
  Crown,
  Search,
  User,
  LogOut,
  Heart,
  History,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react'

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, hasActiveSubscription, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/stories?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-900 via-purple-700 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
              <Skull className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                ផតខាស់រឿងរន្ធត់ខ្មែរ
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              </span>
              <span className="text-xs font-semibold text-purple-700 tracking-wider uppercase">
                Khmer Horror Podcast
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-xs w-full">
            <Search className="w-4 h-4 text-purple-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="ស្វែងរកចំណងជើងរឿង..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full text-sm glass-input placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-purple-700 hover:bg-purple-50/60 rounded-xl transition"
            >
              ទំព័រដើម
            </Link>
            <Link
              to="/stories"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-purple-700 hover:bg-purple-50/60 rounded-xl transition flex items-center gap-1.5"
            >
              <Radio className="w-4 h-4 text-purple-600" />
              បណ្ណាល័យរឿង
            </Link>
            <Link
              to="/premium"
              className="px-3.5 py-2 text-sm font-semibold text-purple-700 bg-purple-100/70 hover:bg-purple-200/60 rounded-xl transition flex items-center gap-1.5 border border-purple-200/50 shadow-sm"
            >
              <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
              កញ្ចប់ VIP
            </Link>
            <Link
              to="/about"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-purple-700 hover:bg-purple-50/60 rounded-xl transition"
            >
              អំពីយើង
            </Link>
          </nav>

          {/* User / Auth Area */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-full border border-purple-200/80 bg-white/70 hover:bg-purple-50/80 transition shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 to-violet-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow">
                    {profile?.display_name ? profile.display_name.charAt(0) : 'U'}
                  </div>
                  <span className="text-xs font-medium text-slate-800 max-w-[120px] truncate pr-1.5">
                    {profile?.display_name || 'គណនីខ្ញុំ'}
                  </span>
                  {hasActiveSubscription && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
                      VIP
                    </span>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 rounded-2xl glass-dropdown p-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-3 py-2 border-b border-purple-100 mb-1">
                      <p className="text-xs text-slate-500">បានចូលប្រើប្រាស់ជា</p>
                      <p className="text-sm font-bold text-purple-900 truncate">
                        {profile?.display_name || user.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-purple-50 transition"
                    >
                      <User className="w-4 h-4 text-purple-600" />
                      ព័ត៌មានផ្ទាល់ខ្លួន
                    </Link>

                    <Link
                      to="/profile?tab=favorites"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-purple-50 transition"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      រឿងចូលចិត្ត
                    </Link>

                    <Link
                      to="/profile?tab=history"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-purple-50 transition"
                    >
                      <History className="w-4 h-4 text-blue-500" />
                      ប្រវត្តិស្ដាប់
                    </Link>

                    {isAdmin && (
                      <div className="pt-1 border-t border-purple-100 mt-1">
                        <div className="px-3 py-1.5 text-xs font-semibold text-purple-600 flex items-center gap-1.5 bg-purple-50/80 rounded-lg">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          គណនីអ្នកគ្រប់គ្រង (Admin)
                        </div>
                      </div>
                    )}

                    <div className="pt-1 border-t border-purple-100 mt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          signOut()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        ចាកចេញ (Sign Out)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-700 hover:bg-purple-50/70 rounded-xl transition"
                >
                  ចូលគណនី
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-violet-600 hover:from-purple-800 hover:to-violet-700 rounded-xl shadow-md shadow-purple-500/20 transition active:scale-95"
                >
                  ចុះឈ្មោះ
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-header border-t border-purple-100 px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <Search className="w-4 h-4 text-purple-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="ស្វែងរកចំណងជើងរឿង..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm glass-input placeholder:text-slate-400"
            />
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:bg-purple-50"
          >
            ទំព័រដើម
          </Link>
          <Link
            to="/stories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:bg-purple-50 flex items-center justify-between"
          >
            <span>បណ្ណាល័យរឿងទាំងអស់</span>
            <Radio className="w-4 h-4 text-purple-600" />
          </Link>
          <Link
            to="/premium"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-bold text-purple-700 bg-purple-50/80 hover:bg-purple-100/60 flex items-center justify-between"
          >
            <span>កញ្ចប់សមាជិក VIP</span>
            <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 hover:bg-purple-50"
          >
            អំពីយើង
          </Link>

          {user ? (
            <div className="pt-4 border-t border-purple-100 space-y-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-800 hover:bg-purple-50 rounded-xl"
              >
                <User className="w-4 h-4 text-purple-600" />
                ព័ត៌មានផ្ទាល់ខ្លួន ({profile?.display_name || user.email})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  signOut()
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                ចាកចេញ (Sign Out)
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-purple-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                ចូលគណនី
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-sm font-semibold text-white bg-purple-700 rounded-xl shadow"
              >
                ចុះឈ្មោះ
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
