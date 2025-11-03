import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'
import { autoIndexInvoice } from '@/lib/rag/auto-index'

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
  includeKilometers: z.boolean().optional(),
  kilometerRate: z.number().optional(),
  kilometerMonth: z.string().optional(), // Format: YYYY-MM
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

    const lineItems = [...validatedData.lineItems]
    let totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0)

    // Add kilometers if requested
    if (validatedData.includeKilometers && validatedData.kilometerRate && validatedData.kilometerMonth) {
      const startOfMonth = new Date(`${validatedData.kilometerMonth}-01`)
      const endOfMonth = new Date(startOfMonth)
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      endOfMonth.setDate(0) // Last day of month

      const billableKilometers = await prisma.kilometerEntry.findMany({
        where: {
          userId,
          clientId: validatedData.clientId,
          isBillable: true,
          type: 'zakelijk',
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      })

      if (billableKilometers.length > 0) {
        const totalKilometers = billableKilometers.reduce((sum, entry) => sum + Number(entry.distanceKm), 0)
        const kilometerAmount = totalKilometers * validatedData.kilometerRate

        lineItems.push({
          description: `Kilometervergoeding ${validatedData.kilometerMonth} — ${totalKilometers.toFixed(0)} km × €${validatedData.kilometerRate.toFixed(2)}`,
          quantity: totalKilometers,
          rate: validatedData.kilometerRate,
          amount: kilometerAmount
        })

        totalAmount += kilometerAmount
      }
    }

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
        amount: totalAmount,
        clientId: validatedData.clientId,
        userId,
        description: validatedData.description,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        lineItems: lineItems,
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

    // Auto-index for RAG
    autoIndexInvoice(userId, invoice.id).catch(err => 
      console.error('Failed to auto-index invoice:', err)
    )

    // Mark kilometer entries as billed if they were included
    if (validatedData.includeKilometers && validatedData.kilometerRate && validatedData.kilometerMonth) {
      const startOfMonth = new Date(`${validatedData.kilometerMonth}-01`)
      const endOfMonth = new Date(startOfMonth)
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      endOfMonth.setDate(0) // Last day of month

      await prisma.kilometerEntry.updateMany({
        where: {
          userId,
          clientId: validatedData.clientId,
          isBillable: true,
          type: 'zakelijk',
          status: 'billable',
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        data: {
          status: 'billed',
          invoiceId: invoice.id
        }
      })
    }

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
