import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { UnauthorizedError } from './errors'

export async function requireAuth(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })

  if (!token || !token.id) {
    throw new UnauthorizedError('Authentication required')
  }

  return {
    userId: token.id as string,
    email: token.email as string,
    name: token.name as string,
  }
}

export async function optionalAuth(request: NextRequest) {
  try {
    return await requireAuth(request)
  } catch {
    return null
  }
}
