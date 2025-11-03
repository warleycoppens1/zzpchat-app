import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required')
}

// Convert hex string to buffer
function getKey(): Buffer {
  if (ENCRYPTION_KEY.length === 64) {
    // 32 bytes hex encoded
    return Buffer.from(ENCRYPTION_KEY, 'hex')
  } else if (ENCRYPTION_KEY.length === 32) {
    // 32 bytes ascii
    return Buffer.from(ENCRYPTION_KEY, 'utf8')
  } else {
    // Hash to get 32 bytes
    return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()
  }
}

const key = getKey()

/**
 * Encrypt sensitive data (like OAuth tokens)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Combine iv + authTag + encrypted data
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encrypted: string): string {
  const parts = encrypted.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }

  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encryptedText = parts[2]

  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Hash API key for storage (one-way)
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}

/**
 * Generate a secure random API key
 */
export function generateApiKey(prefix: string = 'zzp'): string {
  const randomBytes = crypto.randomBytes(32)
  const randomPart = randomBytes.toString('base64url')
  return `${prefix}_${randomPart}`
}

