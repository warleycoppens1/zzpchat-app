import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
})

// GET /api/contacts - Get all contacts for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')

    const where: any = { userId }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (tag) {
      where.tags = {
        has: tag
      }
    }

    const contacts = await prisma.client.findMany({
      where,
      orderBy: {
        name: 'asc'
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

    return NextResponse.json({ contacts })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/contacts - Create new contact
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createContactSchema.parse(body)

    const contact = await prisma.client.create({
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

    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
