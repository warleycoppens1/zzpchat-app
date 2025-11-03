/**
 * Workflow Context Management
 * Handles user context extraction and validation for n8n workflows
 */

export interface WorkflowContext {
  userId: string
  userEmail: string
  userName: string
  serviceAccountId: string
  serviceAccountName: string
  permissions: string[]
}

/**
 * Extract and validate user context from various sources
 */
export function extractUserContext(
  userId: string | null | undefined,
  serviceAccountUserId: string | null | undefined,
  requestedUserId: string | null | undefined
): string {
  // Priority order:
  // 1. Service account bound user (most secure)
  // 2. Requested userId from payload
  // 3. Fallback to query/header userId

  if (serviceAccountUserId) {
    // Service account is bound to specific user, always use that
    return serviceAccountUserId
  }

  if (requestedUserId) {
    // Use requested userId from workflow payload
    return requestedUserId
  }

  if (userId) {
    // Fallback to provided userId
    return userId
  }

  throw new Error('User ID is required but not provided')
}

/**
 * Validate user context before processing workflow action
 */
export async function validateUserContext(
  userId: string,
  serviceAccountId: string
): Promise<{
  userId: string
  userEmail: string
  userName: string
  serviceAccountId: string
}> {
  const { prisma } = await import('@/lib/prisma')

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true }
  })

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  // Verify service account exists and is active
  const serviceAccount = await prisma.serviceAccount.findUnique({
    where: { id: serviceAccountId },
    select: { id: true, name: true, active: true }
  })

  if (!serviceAccount || !serviceAccount.active) {
    throw new Error(`Service account not found or inactive: ${serviceAccountId}`)
  }

  return {
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    serviceAccountId: serviceAccount.id
  }
}

/**
 * Create workflow context object
 */
export function createWorkflowContext(
  userId: string,
  userEmail: string,
  userName: string,
  serviceAccountId: string,
  serviceAccountName: string,
  permissions: string[]
): WorkflowContext {
  return {
    userId,
    userEmail,
    userName,
    serviceAccountId,
    serviceAccountName,
    permissions
  }
}

