const ALLOWED_MIME_PREFIXES = [
  'data:image/jpeg',
  'data:image/jpg',
  'data:image/png',
  'data:image/webp',
  'data:image/gif',
]

const MAX_BASE64_SIZE = 5 * 1024 * 1024 // 5MB decoded

export function validateBase64Image(
  value: string | null | undefined,
  fieldName: string,
  maxSizeBytes: number = MAX_BASE64_SIZE
): string | null {
  if (!value) return null

  const hasValidPrefix = ALLOWED_MIME_PREFIXES.some(prefix => value.startsWith(prefix))
  if (!hasValidPrefix) {
    return `${fieldName}: Invalid image format. Allowed: JPEG, PNG, WebP, GIF`
  }

  const commaIndex = value.indexOf(',')
  if (commaIndex === -1) {
    return `${fieldName}: Invalid base64 format`
  }
  const base64Data = value.substring(commaIndex + 1)
  const estimatedBytes = Math.ceil(base64Data.length * 0.75)
  if (estimatedBytes > maxSizeBytes) {
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(1)
    return `${fieldName}: Image exceeds maximum size of ${maxMB}MB`
  }

  return null
}

export function validateBase64Fields(
  body: Record<string, unknown>,
  fields: string[],
  maxSizeBytes?: number
): string | null {
  for (const field of fields) {
    const value = body[field] as string | null | undefined
    const error = validateBase64Image(value, field, maxSizeBytes)
    if (error) return error
  }
  return null
}

export function safeParseInt(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}
