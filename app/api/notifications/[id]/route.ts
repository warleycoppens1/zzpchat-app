import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'

// GET /api/notifications/[id] - Get specific notification
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    
    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ notification })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/notifications/[id] - Update notification (mark as read)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    const notification = await prisma.notification.update({
      where: {
        id: params.id
      },
      data: {
        read: body.read !== undefined ? body.read : true,
        sentAt: body.read ? new Date() : undefined,
      }
    })

    return NextResponse.json({ notification })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    
    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    await prisma.notification.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Notification deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}


