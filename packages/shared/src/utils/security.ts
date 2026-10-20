/**
 * Check if a subscription is currently active given its record
 */
export function isSubscriptionActive(subscription?: {
  status: string
  expires_at: string | null
} | null): boolean {
  if (!subscription) return false
  if (subscription.status !== 'active') return false
  if (!subscription.expires_at) return true // Lifetime
  const expiry = new Date(subscription.expires_at).getTime()
  return expiry > Date.now()
}

/**
 * Validates audio file extension and mime type
 */
export function isValidAudioFile(fileName: string, mimeType?: string): boolean {
  const allowedExtensions = ['.mp3', '.m4a', '.aac', '.wav', '.ogg']
  const lowerName = fileName.toLowerCase()
  const hasValidExt = allowedExtensions.some(ext => lowerName.endsWith(ext))

  if (mimeType) {
    const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/ogg']
    return hasValidExt || allowedMimes.includes(mimeType)
  }
  return hasValidExt
}

/**
 * Validates image file extension and mime type
 */
export function isValidImageFile(fileName: string, mimeType?: string): boolean {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif']
  const lowerName = fileName.toLowerCase()
  const hasValidExt = allowedExtensions.some(ext => lowerName.endsWith(ext))

  if (mimeType) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    return hasValidExt || allowedMimes.includes(mimeType)
  }
  return hasValidExt
}
