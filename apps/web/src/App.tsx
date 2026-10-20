import React from 'react'
import { BrowserRouter, Routes, Route, ScrollRestoration } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AudioPlayerProvider } from './contexts/AudioPlayerContext'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { AudioPlayerBar } from './components/layout/AudioPlayerBar'

// Pages
import { HomePage } from './pages/HomePage'
import { StoriesPage } from './pages/StoriesPage'
import { StoryDetailPage } from './pages/StoryDetailPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { ProfilePage } from './pages/ProfilePage'
import { PremiumPage } from './pages/PremiumPage'
import { AboutPage } from './pages/info/AboutPage'
import { ContactPage } from './pages/info/ContactPage'
import { PrivacyPage } from './pages/info/PrivacyPage'
import { TermsPage } from './pages/info/TermsPage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AudioPlayerProvider>
          <div className="min-h-screen flex flex-col bg-[#faf9fd] text-[#1e1b4b] relative pb-28">
            <Navbar />
            
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/stories" element={<StoriesPage />} />
                <Route path="/stories/:id" element={<StoryDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/premium" element={<PremiumPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
              </Routes>
            </main>

            <Footer />
            <AudioPlayerBar />
          </div>
        </AudioPlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
