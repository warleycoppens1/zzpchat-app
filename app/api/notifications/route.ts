import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const createNotificationSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  data: z.any().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  scheduledFor: z.string().optional(),
})

// GET /api/notifications - Get all notifications for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const type = searchParams.get('type')

    const where: any = { userId }
    
    if (unreadOnly) where.read = false
    if (type) where.type = type

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where })
    ])

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false }
    })

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createNotificationSchema.parse(body)

    const notification = await prisma.notification.create({
      data: {
        type: validatedData.type,
        title: validatedData.title,
        message: validatedData.message,
        data: validatedData.data,
        priority: validatedData.priority,
        scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : null,
        userId,
      }
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}


