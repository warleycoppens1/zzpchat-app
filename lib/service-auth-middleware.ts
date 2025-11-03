import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import { UnauthorizedError, ForbiddenError } from './errors'
import crypto from 'crypto'

/**
 * Verify API key from Authorization header
 * Supports both "Bearer <apiKey>" and "ApiKey <apiKey>" formats
 */
async function verifyApiKey(apiKey: string): Promise<{
  serviceAccount: {
    id: string
    name: string
    userId: string | null
    permissions: string[]
    active: boolean
    rateLimit: number | null
  }
}> {
  if (!apiKey) {
    throw new UnauthorizedError('API key is required')
  }

  // Hash the provided API key
  const apiKeyHash = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex')

  // Find service account by hashed key
  const serviceAccount = await prisma.serviceAccount.findFirst({
    where: {
      apiKeyHash,
      active: true
    }
  })

  if (!serviceAccount) {
    throw new UnauthorizedError('Invalid API key')
  }

  // Check rate limiting if configured
  if (serviceAccount.rateLimit) {
    const now = new Date()
    const resetTime = serviceAccount.rateLimitReset || now
    
    // Reset counter if reset time has passed
    if (resetTime < now) {
      await prisma.serviceAccount.update({
        where: { id: serviceAccount.id },
        data: {
          rateLimitUsed: 0,
          rateLimitReset: new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
        }
      })
      serviceAccount.rateLimitUsed = 0
    }

    // Check if limit exceeded
    if (serviceAccount.rateLimitUsed >= serviceAccount.rateLimit) {
      throw new ForbiddenError('Rate limit exceeded')
    }

    // Increment usage counter
    await prisma.serviceAccount.update({
      where: { id: serviceAccount.id },
      data: {
        rateLimitUsed: { increment: 1 },
        usageCount: { increment: 1 },
        lastUsedAt: now
      }
    })
  } else {
    // Just update usage stats
    await prisma.serviceAccount.update({
      where: { id: serviceAccount.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    })
  }

  return {
    serviceAccount: {
      id: serviceAccount.id,
      name: serviceAccount.name,
      userId: serviceAccount.userId,
      permissions: serviceAccount.permissions,
      active: serviceAccount.active,
      rateLimit: serviceAccount.rateLimit
    }
  }
}

/**
 * Middleware for service account authentication
 * Requires X-API-Key header or Authorization header with Bearer/ApiKey token
 * Also requires userId in request body or query for user context
 */
export async function requireServiceAuth(request: NextRequest) {
  // Extract API key from headers
  const authHeader = request.headers.get('authorization') || request.headers.get('x-api-key')
  
  if (!authHeader) {
    throw new UnauthorizedError('API key is required. Use X-API-Key header or Authorization header')
  }

  // Support both "Bearer <key>" and "ApiKey <key>" and plain key formats
  let apiKey: string
  if (authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7)
  } else if (authHeader.startsWith('ApiKey ')) {
    apiKey = authHeader.substring(7)
  } else {
    apiKey = authHeader
  }

  const { serviceAccount } = await verifyApiKey(apiKey)

  // Extract userId from request (body, query, or header)
  const url = new URL(request.url)
  const userIdFromQuery = url.searchParams.get('userId')
  const userIdFromHeader = request.headers.get('x-user-id')
  
  let userId: string | null = null
  let requestBody: any = null

  // Try to get userId from body for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const clone = request.clone()
      requestBody = await clone.json().catch(() => null)
      if (requestBody?.userId) {
        userId = requestBody.userId
      }
    } catch {
      // Body might not be JSON or already consumed
    }
  }

  // Fallback to query or header
  userId = userId || userIdFromQuery || userIdFromHeader

  // If service account is bound to a specific user, use that
  if (serviceAccount.userId) {
    userId = serviceAccount.userId
  }

  // Validate userId is provided
  if (!userId) {
    throw new UnauthorizedError('User ID is required. Provide userId in request body, query parameter, or X-User-Id header')
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true }
  })

  if (!user) {
    throw new UnauthorizedError('User not found')
  }

  return {
    serviceAccountId: serviceAccount.id,
    serviceAccountName: serviceAccount.name,
    userId,
    userEmail: user.email,
    userName: user.name,
    permissions: serviceAccount.permissions,
    // Restore request body if it was consumed
    requestBody
  }
}

/**
 * Check if service account has specific permission
 */
export function hasPermission(
  permissions: string[],
  requiredPermission: string
): boolean {
  // Empty permissions array means all permissions
  if (permissions.length === 0) {
    return true
  }

  // Check exact match
  if (permissions.includes(requiredPermission)) {
    return true
  }

  // Check wildcard permissions (e.g., "invoices.*" matches "invoices.create")
  const wildcardPattern = requiredPermission.replace(/\.([^.]+)$/, '.*')
  if (permissions.includes(wildcardPattern)) {
    return true
  }

  // Check if required permission is a subset (e.g., "invoices" matches "invoices.create")
  const basePermission = requiredPermission.split('.')[0]
  if (permissions.includes(basePermission)) {
    return true
  }

  return false
}

/**
 * Middleware that requires both service auth and specific permission
 */
export async function requireServiceAuthWithPermission(
  request: NextRequest,
  permission: string
) {
  const auth = await requireServiceAuth(request)

  if (!hasPermission(auth.permissions, permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`)
  }

  return auth
}

