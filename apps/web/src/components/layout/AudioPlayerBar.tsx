import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAudioPlayer } from '../../contexts/AudioPlayerContext'
import { formatDuration } from '@khmer-horror/shared'
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Gauge,
  Crown,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export const AudioPlayerBar: React.FC = () => {
  const {
    currentTrack,
    currentStory,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isMuted,
    isLoading,
    error,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
    toggleMute,
    skip
  } = useAudioPlayer()

  const [isSpeedOpen, setIsSpeedOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  if (!currentTrack) return null

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = parseFloat(e.target.value)
    seek((newPercent / 100) * duration)
  }

  const speedOptions = [0.8, 1.0, 1.25, 1.5, 2.0]

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isMinimized ? 'translate-y-[calc(100%-2.5rem)]' : 'translate-y-0'
      }`}
    >
      {/* Error alert if any */}
      {error && (
        <div className="max-w-4xl mx-auto mb-2 px-4">
          <div className="bg-red-500/90 text-white text-xs px-4 py-2 rounded-xl backdrop-blur-md flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Link
              to="/premium"
              className="ml-3 underline font-bold hover:text-red-100 shrink-0"
            >
              ជាវកញ្ចប់ VIP ឥឡូវនេះ
            </Link>
          </div>
        </div>
      )}

      {/* Minimize Toggle Header */}
      <div className="max-w-7xl mx-auto flex justify-end px-4">
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="bg-white/90 backdrop-blur-md border border-b-0 border-purple-200/80 px-3 py-1 rounded-t-xl text-xs font-semibold text-purple-700 flex items-center gap-1 shadow-sm hover:bg-purple-50"
        >
          {isMinimized ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> បើកឧបករណ៍ចាក់សំឡេង
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> បង្រួមតូច
            </>
          )}
        </button>
      </div>

      {/* Main Glass Audio Bar */}
      <div className="bg-white/90 backdrop-blur-xl border-t border-purple-200/70 shadow-2xl shadow-purple-900/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col gap-2">

          {/* Seek Progress Bar */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-medium text-slate-500 w-10 text-right tabular-nums">
              {formatDuration(currentTime)}
            </span>
            <div className="relative flex-1 flex items-center group">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progressPercentage || 0}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-purple-100 group-hover:h-2 rounded-lg appearance-none cursor-pointer accent-purple-600 transition-all"
              />
            </div>
            <span className="text-[11px] font-medium text-slate-500 w-10 text-left tabular-nums">
              {formatDuration(duration || currentTrack.durationSeconds)}
            </span>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4">

            {/* Left: Track Information */}
            <div className="flex items-center gap-3 min-w-0 max-w-[260px] sm:max-w-xs md:max-w-sm">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-xl object-cover shadow border border-purple-200/60 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/stories/${currentStory?.id || currentTrack.id}`}
                    className="font-bold text-sm text-slate-900 truncate hover:text-purple-700 transition"
                  >
                    {currentTrack.title}
                  </Link>
                  {currentTrack.isPremium && (
                    <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-400" />
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {currentTrack.categoryName || 'រឿងរន្ធត់ខ្មែរ'}
                </p>
              </div>
            </div>

            {/* Center: Playback Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Skip Back 10s */}
              <button
                onClick={() => skip(-10)}
                className="p-2 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-full transition"
                title="ថយក្រោយ ១០ វិនាទី"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Main Play/Pause Button */}
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-700 to-violet-600 hover:from-purple-800 hover:to-violet-700 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 active:scale-95 transition"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>

              {/* Skip Forward 10s */}
              <button
                onClick={() => skip(10)}
                className="p-2 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-full transition"
                title="ទៅមុខ ១០ វិនាទី"
              >
                <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Right: Rate & Volume Controls */}
            <div className="flex items-center gap-3">
              {/* Speed Controller */}
              <div className="relative">
                <button
                  onClick={() => setIsSpeedOpen(!isSpeedOpen)}
                  className="px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200/80 transition flex items-center gap-1"
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>{playbackRate}x</span>
                </button>

                {isSpeedOpen && (
                  <div className="absolute bottom-10 right-0 bg-white/95 backdrop-blur-md border border-purple-200 rounded-xl p-1.5 shadow-xl flex flex-col gap-1 z-50">
                    {speedOptions.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setPlaybackRate(rate)
                          setIsSpeedOpen(false)
                        }}
                        className={`px-3 py-1 text-xs rounded-lg text-left font-semibold ${
                          playbackRate === rate
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-700 hover:bg-purple-50'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Volume Slider (Hidden on small mobile) */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-slate-600 hover:text-purple-700 transition"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Go to full story details */}
              <Link
                to={`/stories/${currentStory?.id || currentTrack.id}`}
                className="hidden md:inline-flex p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition"
                title="បើកទំព័ររឿងលម្អិត"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
