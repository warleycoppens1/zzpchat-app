import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate must be greater than or equal to 0'),
  amount: z.number().min(0, 'Amount must be greater than or equal to 0'),
})

const createQuoteSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  description: z.string().optional(),
  validUntil: z.string().datetime().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
})

// GET /api/quotes - Get all quotes for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const where = {
      userId,
      ...(status && { status: status as any }),
      ...(clientId && { clientId }),
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              company: true,
              email: true,
            }
          }
        }
      }),
      prisma.quote.count({ where })
    ])

    return NextResponse.json({
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/quotes - Create new quote
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createQuoteSchema.parse(body)

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: validatedData.clientId,
        userId
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Calculate total amount
    const amount = validatedData.lineItems.reduce((sum, item) => sum + item.amount, 0)

    // Generate quote number
    const lastQuote = await prisma.quote.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { number: true }
    })

    const nextNumber = lastQuote 
      ? (parseInt(lastQuote.number) + 1).toString().padStart(4, '0')
      : '0001'

    const quote = await prisma.quote.create({
      data: {
        number: nextNumber,
        amount,
        clientId: validatedData.clientId,
        userId,
        description: validatedData.description,
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
        lineItems: validatedData.lineItems,
        status: 'DRAFT',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({ quote }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
