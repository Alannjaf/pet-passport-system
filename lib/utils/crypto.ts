import { randomInt } from 'crypto'

export function secureRandomString(length: number, charset: string): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(randomInt(charset.length))
  }
  return result
}

export function generateAccountNumber(): string {
  const num = randomInt(10000, 100000)
  return `CLN-${num}`
}

export function generatePassword(length: number = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  return secureRandomString(length, chars)
}

export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (password.length < 10) {
    return { valid: false, error: 'Password must be at least 10 characters' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }
  return { valid: true }
}
