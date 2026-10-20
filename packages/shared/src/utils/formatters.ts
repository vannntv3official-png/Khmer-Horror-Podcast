/**
 * Format duration in seconds to "mm:ss" or "hh:mm:ss"
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  const totalSecs = Math.floor(seconds)
  const hours = Math.floor(totalSecs / 3600)
  const minutes = Math.floor((totalSecs % 3600) / 60)
  const secs = totalSecs % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format duration in Khmer text (e.g., "៤៥ នាទី" or "១ ម៉ោង ១៥ នាទី")
 */
export function formatDurationKhmer(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '០ វិនាទី'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  const toKhmerNum = (num: number): string => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩']
    return num.toString().split('').map(d => khmerDigits[parseInt(d, 10)] ?? d).join('')
  }

  if (hours > 0 && minutes > 0) {
    return `${toKhmerNum(hours)} ម៉ោង ${toKhmerNum(minutes)} នាទី`
  } else if (hours > 0) {
    return `${toKhmerNum(hours)} ម៉ោង`
  } else if (minutes > 0) {
    return `${toKhmerNum(minutes)} នាទី`
  }
  return `${toKhmerNum(Math.floor(seconds))} វិនាទី`
}

/**
 * Convert western number to Khmer numeral string
 */
export function toKhmerDigits(value: number | string): string {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩']
  return value.toString().split('').map(char => {
    const parsed = parseInt(char, 10)
    return isNaN(parsed) ? char : khmerDigits[parsed]
  }).join('')
}

/**
 * Slugify a title (supports Khmer and English)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, '') // Keep Unicode letters, combining marks (Khmer vowels/coeng), and digits
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)
}

/**
 * Format bytes to human readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Format ISO date string nicely
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return isoString
  }
}
