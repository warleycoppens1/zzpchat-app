import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const updateKilometerEntrySchema = z.object({
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  fromLocation: z.string().min(1, 'From location is required').optional(),
  toLocation: z.string().min(1, 'To location is required').optional(),
  distanceKm: z.number().min(0.1, 'Distance must be greater than 0').optional(),
  purpose: z.string().min(1, 'Purpose is required').optional(),
  type: z.enum(['zakelijk', 'privé']).optional(),
  notes: z.string().optional(),
  isBillable: z.boolean().optional(),
})

// GET /api/kilometers/[id] - Get specific kilometer entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    
    const kilometerEntry = await prisma.kilometerEntry.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        }
      }
    })

    if (!kilometerEntry) {
      return NextResponse.json(
        { error: 'Kilometer entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ kilometerEntry })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/kilometers/[id] - Update kilometer entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = updateKilometerEntrySchema.parse(body)

    // Check if kilometer entry exists and belongs to user
    const existingEntry = await prisma.kilometerEntry.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Kilometer entry not found' },
        { status: 404 }
      )
    }

    // Verify client belongs to user if clientId is provided
    if (validatedData.clientId) {
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
    }

    // Verify project belongs to user if projectId is provided
    if (validatedData.projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: validatedData.projectId,
          userId
        }
      })

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
    }

    const updateData: any = {}
    
    if (validatedData.date) updateData.date = new Date(validatedData.date)
    if (validatedData.fromLocation) updateData.fromLocation = validatedData.fromLocation
    if (validatedData.toLocation) updateData.toLocation = validatedData.toLocation
    if (validatedData.distanceKm) updateData.distanceKm = validatedData.distanceKm
    if (validatedData.purpose) updateData.purpose = validatedData.purpose
    if (validatedData.type) updateData.type = validatedData.type
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.isBillable !== undefined) updateData.isBillable = validatedData.isBillable
    if (validatedData.projectId !== undefined) updateData.projectId = validatedData.projectId || null
    if (validatedData.clientId !== undefined) updateData.clientId = validatedData.clientId || null

    const kilometerEntry = await prisma.kilometerEntry.update({
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
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        }
      }
    })

    return NextResponse.json({ kilometerEntry })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/kilometers/[id] - Delete kilometer entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    
    // Check if kilometer entry exists and belongs to user
    const existingEntry = await prisma.kilometerEntry.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Kilometer entry not found' },
        { status: 404 }
      )
    }

    await prisma.kilometerEntry.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Kilometer entry deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}


