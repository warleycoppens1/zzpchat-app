import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError, NotFoundError } from '@/lib/errors'
import { z } from 'zod'

const updateClientSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email().optional().or(z.literal('')),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  vatNumber: z.string().optional(),
})

// GET /api/clients/[id] - Get specific client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        timeEntries: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            invoices: true,
            quotes: true,
            timeEntries: true,
          }
        }
      }
    })

    if (!client) {
      throw new NotFoundError('Client not found')
    }

    return NextResponse.json({ client })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/clients/[id] - Update client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = updateClientSchema.parse(body)

    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!existingClient) {
      throw new NotFoundError('Client not found')
    }

    const client = await prisma.client.update({
      where: {
        id: params.id
      },
      data: {
        ...validatedData,
        email: validatedData.email || null,
      },
      include: {
        _count: {
          select: {
            invoices: true,
            quotes: true,
            timeEntries: true,
          }
        }
      }
    })

    return NextResponse.json({ client })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/clients/[id] - Delete client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)

    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!existingClient) {
      throw new NotFoundError('Client not found')
    }

    await prisma.client.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
