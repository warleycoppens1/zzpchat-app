import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  image: z.string().url().optional(),
  language: z.string().optional(),
  region: z.string().optional(),
})

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        language: true,
        region: true,
        companyName: true,
        phone: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = updateProfileSchema.parse(body)

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...validatedData,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        language: true,
        region: true,
        companyName: true,
        phone: true,
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    return handleApiError(error)
  }
}


