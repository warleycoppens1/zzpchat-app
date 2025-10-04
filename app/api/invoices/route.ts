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

const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
})

// GET /api/invoices - Get all invoices for authenticated user
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

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
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
      prisma.invoice.count({ where })
    ])

    return NextResponse.json({
      invoices,
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

// POST /api/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createInvoiceSchema.parse(body)

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

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { number: true }
    })

    const nextNumber = lastInvoice 
      ? (parseInt(lastInvoice.number) + 1).toString().padStart(4, '0')
      : '0001'

    const invoice = await prisma.invoice.create({
      data: {
        number: nextNumber,
        amount,
        clientId: validatedData.clientId,
        userId,
        description: validatedData.description,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
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

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
