import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'

// GET /api/conversations/[id] - Get specific conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)

    const conversation = await prisma.aI_Conversation.findFirst({
      where: { 
        id: params.id,
        userId 
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/conversations/[id] - Delete conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)

    const conversation = await prisma.aI_Conversation.findFirst({
      where: { 
        id: params.id,
        userId 
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    await prisma.aI_Conversation.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Conversation deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}