import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError, NotFoundError } from '@/lib/errors'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate must be greater than or equal to 0'),
  amount: z.number().min(0, 'Amount must be greater than or equal to 0'),
})

const updateInvoiceSchema = z.object({
  description: z.string().optional(),
  dueDate: z.string().datetime().optional().or(z.null()),
  lineItems: z.array(lineItemSchema).optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
})

// GET /api/invoices/[id] - Get specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        client: true,
        timeEntries: true,
      }
    })

    if (!invoice) {
      throw new NotFoundError('Invoice not found')
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/invoices/[id] - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = updateInvoiceSchema.parse(body)

    // Check if invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!existingInvoice) {
      throw new NotFoundError('Invoice not found')
    }

    // Calculate new amount if line items are updated
    let amount = existingInvoice.amount
    if (validatedData.lineItems) {
      amount = new Decimal(validatedData.lineItems.reduce((sum, item) => sum + item.amount, 0))
    }

    const updateData: any = {
      ...validatedData,
      amount,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : validatedData.dueDate,
    }

    // Set sentAt when status changes to SENT
    if (validatedData.status === 'SENT' && existingInvoice.status !== 'SENT') {
      updateData.sentAt = new Date()
    }

    // Set paidAt when status changes to PAID
    if (validatedData.status === 'PAID' && existingInvoice.status !== 'PAID') {
      updateData.paidAt = new Date()
    }

    const invoice = await prisma.invoice.update({
      where: {
        id: params.id
      },
      data: updateData,
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

    return NextResponse.json({ invoice })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)

    // Check if invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!existingInvoice) {
      throw new NotFoundError('Invoice not found')
    }

    // Only allow deletion of draft invoices
    if (existingInvoice.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted' },
        { status: 400 }
      )
    }

    await prisma.invoice.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
