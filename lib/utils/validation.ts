const ALLOWED_MIME_PREFIXES = [
  'data:image/jpeg',
  'data:image/jpg',
  'data:image/png',
  'data:image/webp',
  'data:image/gif',
  'data:application/pdf',
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
    return `${fieldName}: Invalid file format. Allowed: JPEG, PNG, WebP, GIF, PDF`
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

/**
 * Validate a document field that may be either a JSON-stringified array of
 * base64 data-URIs or a single base64 data-URI string (legacy format).
 * Returns an error message string or null if valid.
 */
export function validateBase64ArrayField(
  value: unknown,
  fieldName: string,
  maxSizeBytes: number = MAX_BASE64_SIZE
): string | null {
  if (!value) return null

  // Try to parse as JSON array (value may be a JSON string or already an array)
  let items: unknown[] | null = null
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        items = parsed
      }
    } catch {
      // Not JSON — treat as a single legacy base64 string
      return validateBase64Image(value, fieldName, maxSizeBytes)
    }
  } else if (Array.isArray(value)) {
    items = value
  }

  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (typeof item !== 'string') {
        return `${fieldName}: file ${i + 1} is not a valid base64 string`
      }
      const err = validateBase64Image(item, fieldName, maxSizeBytes)
      if (err) return err
    }
    return null
  }

  // Fallback: validate as single string
  if (typeof value === 'string') {
    return validateBase64Image(value, fieldName, maxSizeBytes)
  }

  return `${fieldName}: invalid format`
}

export function safeParseInt(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}
