import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  vatNumber: z.string().optional(),
})

// GET /api/clients - Get all clients for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)

    const clients = await prisma.client.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
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

    return NextResponse.json({ clients })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/clients - Create new client
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createClientSchema.parse(body)

    const client = await prisma.client.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
        userId,
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

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
