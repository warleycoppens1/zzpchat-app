import { NextRequest, NextResponse } from 'next/server'
import { prisma } from 'lib/prisma'
import { requireAuth } from 'lib/auth-middleware'
import { handleApiError } from 'lib/errors'
import { z } from 'zod'

const updateContactSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  vatNumber: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/contacts/[id] - Get specific contact
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params

    const contact = await prisma.client.findFirst({
      where: {
        id,
        userId
      },
      include: {
        _count: {
          select: {
            invoices: true,
            quotes: true,
            timeEntries: true,
          }
        },
        invoices: {
          select: {
            id: true,
            number: true,
            amount: true,
            status: true,
            dueDate: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        quotes: {
          select: {
            id: true,
            amount: true,
            status: true,
            validUntil: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    })

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ contact })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/contacts/[id] - Update contact
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params
    const body = await request.json()
    
    const validatedData = updateContactSchema.parse(body)

    // Check if contact exists and belongs to user
    const existingContact = await prisma.client.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    const updateData: any = { ...validatedData }
    if (validatedData.email === '') {
      updateData.email = null
    }

    const contact = await prisma.client.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ contact })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/contacts/[id] - Delete contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params

    // Check if contact exists and belongs to user
    const existingContact = await prisma.client.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    // Check if contact has associated invoices or quotes
    const associatedData = await prisma.client.findFirst({
      where: { id },
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

    if (associatedData && (
      associatedData._count.invoices > 0 || 
      associatedData._count.quotes > 0 || 
      associatedData._count.timeEntries > 0
    )) {
      return NextResponse.json(
        { 
          error: 'Cannot delete contact with associated invoices, quotes, or time entries. Please remove these first.' 
        },
        { status: 400 }
      )
    }

    await prisma.client.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
