import { describe, it, expect } from 'vitest'
import {
  formatDuration,
  formatDurationKhmer,
  toKhmerDigits,
  slugify,
  formatBytes
} from '@khmer-horror/shared'

describe('Formatters utility tests', () => {
  it('formats duration in seconds to mm:ss format', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(65)).toBe('01:05')
    expect(formatDuration(599)).toBe('09:59')
    expect(formatDuration(3665)).toBe('1:01:05')
  })

  it('formats duration in Khmer text', () => {
    expect(formatDurationKhmer(120)).toContain('២ នាទី')
    expect(formatDurationKhmer(3600)).toContain('១ ម៉ោង')
    expect(formatDurationKhmer(3660)).toContain('១ ម៉ោង ១ នាទី')
  })

  it('converts digits to Khmer numerals correctly', () => {
    expect(toKhmerDigits(12345)).toBe('១២៣៤៥')
    expect(toKhmerDigits(2026)).toBe('២០២៦')
    expect(toKhmerDigits('Story 99')).toBe('Story ៩៩')
  })

  it('slugifies title properly preserving Unicode and removing weird characters', () => {
    expect(slugify('Khmer Horror Story 1')).toBe('khmer-horror-story-1')
    expect(slugify('រឿង ខ្មោច លង!')).toBe('រឿង-ខ្មោច-លង')
  })

  it('formats bytes nicely', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(104857600)).toBe('100 MB')
  })
})
