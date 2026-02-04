interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 60_000

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; retryAfter?: number } {
  cleanup()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true }
  }

  entry.count++
  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { success: false, retryAfter }
  }

  return { success: true }
}
