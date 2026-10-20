import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { SUBSCRIPTION_PLANS } from '@khmer-horror/shared'
import type { SubscriptionPlan } from '@khmer-horror/shared'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  Crown,
  CheckCircle,
  Sparkles,
  QrCode,
  CreditCard,
  Send,
  ShieldCheck,
  Zap,
  HelpCircle,
  X
} from 'lucide-react'

export const PremiumPage: React.FC = () => {
  const { user, subscription, hasActiveSubscription, refreshProfile } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'khqr' | 'card' | 'telegram'>('khqr')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setPaymentSuccess(false)
    setCheckoutModalOpen(true)
  }

  const handleSimulatePayment = async () => {
    if (!user || !selectedPlan) return
    setIsProcessing(true)

    try {
      if (isSupabaseConfigured) {
        // Call payment webhook simulator or direct insert for development demo
        const eventId = `sim_${Date.now()}`
        let expiresAt: string | null = null
        const now = new Date()

        if (selectedPlan.id === 'monthly') {
          const nextMonth = new Date(now)
          nextMonth.setDate(nextMonth.getDate() + 30)
          expiresAt = nextMonth.toISOString()
        } else if (selectedPlan.id === 'yearly') {
          const nextYear = new Date(now)
          nextYear.setDate(nextYear.getDate() + 365)
          expiresAt = nextYear.toISOString()
        }

        await supabase.from('subscriptions').insert({
          user_id: user.id,
          plan_id: selectedPlan.id,
          status: 'active',
          starts_at: now.toISOString(),
          expires_at: expiresAt,
          provider_reference: eventId
        })

        await supabase.from('payment_events').insert({
          provider: paymentMethod === 'khqr' ? 'aba_khqr' : 'mock_gateway',
          provider_event_id: eventId,
          event_type: 'payment.succeeded',
          user_id: user.id,
          amount: selectedPlan.priceUsd,
          currency: 'USD',
          metadata: { plan_id: selectedPlan.id }
        })

        await refreshProfile()
      }

      setPaymentSuccess(true)
    } catch (err) {
      console.error('Payment simulation error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* 1. HERO HEADER */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs sm:text-sm font-bold border border-amber-300 shadow-sm">
          <Crown className="w-4 h-4 fill-amber-500 text-amber-600" />
          <span>កញ្ចប់សមាជិក VIP ផ្តាច់មុខ (VIP Membership)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
          ដោះសោពិភពរឿងរន្ធត់ខ្មែរ <br />
          <span className="bg-gradient-to-r from-purple-800 via-violet-600 to-amber-600 bg-clip-text text-transparent">
            គ្មានដែនកំណត់ និងគ្មានពាណិជ្ជកម្ម
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          ជ្រើសរើសគម្រោងដែលស័ក្តិសមបំផុតសម្រាប់អ្នក។ គាំទ្រការផលិតរឿងរន្ធត់ខ្មែរ និងរីករាយជាមួយសំឡេងច្បាស់ HD 320kbps។
        </p>

        {hasActiveSubscription && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 inline-block text-xs font-bold shadow-sm">
            🎉 អ្នកកំពុងប្រើប្រាស់គម្រោង VIP រួចរាល់ហើយ! (Active Subscription: {subscription?.plan_id?.toUpperCase()})
          </div>
        )}
      </div>

      {/* 2. PRICING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {SUBSCRIPTION_PLANS.map((plan: SubscriptionPlan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
              plan.isPopular
                ? 'horror-banner text-white shadow-2xl scale-105 border-2 border-amber-400'
                : 'glass-panel text-slate-900 border border-purple-200/80 shadow-lg'
            }`}
          >
            {plan.badgeKm && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
                {plan.badgeKm}
              </div>
            )}

            <div>
              <div className="space-y-1">
                <h3 className="text-xl font-black">{plan.nameKm}</h3>
                <p className={`text-xs ${plan.isPopular ? 'text-purple-200' : 'text-slate-500'}`}>
                  {plan.descriptionKm}
                </p>
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight">${plan.priceUsd}</span>
                <span className={`text-xs font-semibold ${plan.isPopular ? 'text-purple-200' : 'text-slate-500'}`}>
                  / {plan.billingInterval === 'month' ? 'ខែ' : plan.billingInterval === 'year' ? 'ឆ្នាំ' : 'ពេញមួយជីវិត'}
                </span>
              </div>

              {/* Feature list */}
              <div className="mt-8 space-y-3">
                <p className={`text-xs font-bold uppercase tracking-wider ${plan.isPopular ? 'text-purple-300' : 'text-purple-700'}`}>
                  អត្ថប្រយោជន៍ទទួលបាន៖
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm">
                  {plan.featuresKm.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          plan.isPopular ? 'text-amber-400' : 'text-emerald-600'
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-4">
              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-xl transition active:scale-95 flex items-center justify-center gap-2 ${
                  plan.isPopular
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20'
                    : 'bg-purple-700 hover:bg-purple-800 text-white shadow-purple-600/20'
                }`}
              >
                <Crown className="w-4 h-4 fill-current" />
                <span>ជ្រើសរើសគម្រោងនេះ</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* 3. PERKS & WHY VIP SECTION */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-purple-200/80 space-y-8">
        <h2 className="text-2xl font-black text-center text-slate-900">
          ហេតុអ្វីបានជាអ្នកគួរជាវសមាជិកភាព VIP?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white/70 border border-purple-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">រឿងរន្ធត់ផ្តាច់មុខ</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ចូលស្ដាប់រឿងព្រឺព្រួចពិសេសៗដែលមិនមានផ្សាយជាសាធារណៈ។
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/70 border border-purple-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">សំឡេង HD Master</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              សំឡេងច្បាស់ត្រជាក់ត្រចៀកកម្រិត 320kbps ជាមួយបែបផែនសំឡេង 3D Audio។
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/70 border border-purple-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">គ្មានពាណិជ្ជកម្ម</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ស្ដាប់ដោយរលូន គ្មានការកាត់ផ្អាកដោយពាណិជ្ជកម្មរំខានអារម្មណ៍។
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/70 border border-purple-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">គាំទ្រផលិតករខ្មែរ</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ចំណូលរបស់អ្នកជួយឱ្យក្រុមការងារនិពន្ធ និងផលិតរឿងថ្មីៗបន្ថែមទៀត។
            </p>
          </div>
        </div>
      </div>

      {/* 4. CHECKOUT MODAL */}
      {checkoutModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-purple-200 space-y-6">
            
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {paymentSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  ការទូទាត់ជោគជ័យ!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                  គណនីរបស់អ្នកត្រូវបានដំឡើងជា VIP រួចរាល់ហើយ។ អ្នកអាចស្ដាប់រឿង VIP ទាំងអស់បានភ្លាមៗ!
                </p>
                <button
                  onClick={() => setCheckoutModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs"
                >
                  ចាប់ផ្ដើមស្ដាប់ឥឡូវនេះ
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                    ដំណើរការទូទាត់ប្រាក់ (Checkout)
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedPlan.nameKm} — ${selectedPlan.priceUsd}
                  </h3>
                </div>

                {!user && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                    <span>សូមចូលគណនីដើម្បីភ្ជាប់គម្រោង VIP នេះ</span>
                    <Link to="/login" className="font-bold underline text-purple-800">
                      ចូលគណនី
                    </Link>
                  </div>
                )}

                {/* Payment Methods Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('khqr')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'khqr'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-red-600" />
                    <span>ABA KHQR</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'card'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>Visa / Master</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('telegram')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'telegram'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Send className="w-5 h-5 text-sky-500" />
                    <span>Telegram</span>
                  </button>
                </div>

                {/* Payment Method Content */}
                {paymentMethod === 'khqr' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                    <div className="w-44 h-44 bg-white p-2.5 mx-auto rounded-xl shadow-md border border-slate-200 flex flex-col items-center justify-center">
                      <QrCode className="w-36 h-36 text-slate-900" />
                    </div>
                    <p className="text-xs text-slate-600">
                      ស្កេនជាមួយកម្មវិធីធនាគារ (ABA, Wing, Bakong...) <br />
                      <strong className="text-slate-900">ចំនួនទឹកប្រាក់៖ ${selectedPlan.priceUsd}</strong>
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="លេខប័ណ្ណ (Card Number)"
                      className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'telegram' && (
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-2">
                    <p className="font-semibold">
                      ផ្ញើសារទូទាត់ដោយផ្ទាល់ជាមួយក្រុមការងារតាម Telegram៖
                    </p>
                    <a
                      href="https://t.me/khmerhorrorpodcast"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-sky-700 underline"
                    >
                      <Send className="w-3.5 h-3.5" /> @khmerhorrorpodcast
                    </a>
                  </div>
                )}

                {/* Simulation / Confirmation button */}
                <button
                  onClick={handleSimulatePayment}
                  disabled={!user || isProcessing}
                  className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>
                      {user ? `បញ្ជាក់ការទូទាត់ ($${selectedPlan.priceUsd})` : 'សូមចូលគណនីជាមុន'}
                    </span>
                  )}
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
