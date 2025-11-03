import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const createKilometerEntrySchema = z.object({
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  fromLocation: z.string().min(1, 'From location is required'),
  toLocation: z.string().min(1, 'To location is required'),
  distanceKm: z.number().min(0.1, 'Distance must be greater than 0'),
  purpose: z.string().min(1, 'Purpose is required'),
  type: z.enum(['zakelijk', 'privé']).default('zakelijk'),
  notes: z.string().optional(),
  isBillable: z.boolean().default(true),
  status: z.enum(['draft', 'billable', 'billed']).default('draft'),
})

// GET /api/kilometers - Get all kilometer entries for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const clientId = searchParams.get('clientId')
    const projectId = searchParams.get('projectId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')
    const isBillable = searchParams.get('isBillable')
    const status = searchParams.get('status')

    const where: any = { userId }
    
    if (clientId) where.clientId = clientId
    if (projectId) where.projectId = projectId
    if (type) where.type = type
    if (isBillable !== null) where.isBillable = isBillable === 'true'
    if (status) where.status = status
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [kilometerEntries, total, totalDistance] = await Promise.all([
      prisma.kilometerEntry.findMany({
        where,
        orderBy: {
          date: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      prisma.kilometerEntry.count({ where }),
      prisma.kilometerEntry.aggregate({
        where,
        _sum: { distanceKm: true }
      })
    ])

    return NextResponse.json({
      kilometerEntries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalDistance: totalDistance._sum.distanceKm || 0
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/kilometers - Create new kilometer entry
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createKilometerEntrySchema.parse(body)

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

    const kilometerEntry = await prisma.kilometerEntry.create({
      data: {
        projectId: validatedData.projectId || null,
        clientId: validatedData.clientId || null,
        date: new Date(validatedData.date),
        fromLocation: validatedData.fromLocation,
        toLocation: validatedData.toLocation,
        distanceKm: validatedData.distanceKm,
        purpose: validatedData.purpose,
        type: validatedData.type,
        notes: validatedData.notes,
        isBillable: validatedData.isBillable,
        status: validatedData.status,
        userId,
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

    return NextResponse.json({ kilometerEntry }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
