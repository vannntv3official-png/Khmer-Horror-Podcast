import { describe, it, expect } from 'vitest'
import {
  isValidAudioFile,
  isValidImageFile,
  isSubscriptionActive
} from '@khmer-horror/shared'

describe('Security & Validation utility tests', () => {
  it('validates audio files by extension and mime type', () => {
    expect(isValidAudioFile('horror_story.mp3')).toBe(true)
    expect(isValidAudioFile('track.m4a')).toBe(true)
    expect(isValidAudioFile('track.wav')).toBe(true)
    expect(isValidAudioFile('malicious.exe')).toBe(false)
    expect(isValidAudioFile('script.js')).toBe(false)
    expect(isValidAudioFile('audio.file', 'audio/mpeg')).toBe(true)
  })

  it('validates image files by extension and mime type', () => {
    expect(isValidImageFile('cover.webp')).toBe(true)
    expect(isValidImageFile('cover.jpg')).toBe(true)
    expect(isValidImageFile('cover.png')).toBe(true)
    expect(isValidImageFile('cover.svg.exe')).toBe(false)
  })

  it('evaluates subscription status correctly', () => {
    // Null or undefined
    expect(isSubscriptionActive(null)).toBe(false)
    expect(isSubscriptionActive(undefined)).toBe(false)

    // Expired status
    expect(isSubscriptionActive({ status: 'expired', expires_at: null })).toBe(false)
    expect(isSubscriptionActive({ status: 'cancelled', expires_at: null })).toBe(false)

    // Lifetime active (expires_at is null)
    expect(isSubscriptionActive({ status: 'active', expires_at: null })).toBe(true)

    // Active in future
    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString()
    expect(isSubscriptionActive({ status: 'active', expires_at: futureDate })).toBe(true)

    // Active in past (expired)
    const pastDate = new Date(Date.now() - 86400000).toISOString()
    expect(isSubscriptionActive({ status: 'active', expires_at: pastDate })).toBe(false)
  })
})
