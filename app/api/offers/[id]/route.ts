import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const updateOfferSchema = z.object({
  client: z.string().min(1, 'Client is required').optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  validUntil: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
  notes: z.string().optional(),
})

// GET /api/offers/[id] - Get specific offer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params

    const offer = await prisma.quote.findFirst({
      where: {
        id,
        userId
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ offer })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/offers/[id] - Update offer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params
    const body = await request.json()
    
    const validatedData = updateOfferSchema.parse(body)

    // Check if offer exists and belongs to user
    const existingOffer = await prisma.quote.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existingOffer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    // If client is being updated, verify it exists and belongs to user
    if (validatedData.client) {
      const client = await prisma.client.findFirst({
        where: {
          id: validatedData.client,
          userId
        }
      })

      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      }
    }

    const updateData: any = { ...validatedData }
    if (validatedData.client) {
      updateData.clientId = validatedData.client
      delete updateData.client
    }
    if (validatedData.validUntil) {
      updateData.validUntil = new Date(validatedData.validUntil)
    }

    const offer = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    return NextResponse.json({ offer })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/offers/[id] - Delete offer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params

    // Check if offer exists and belongs to user
    const existingOffer = await prisma.quote.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existingOffer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    await prisma.quote.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Offer deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
