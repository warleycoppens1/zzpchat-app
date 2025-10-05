import { NextRequest, NextResponse } from 'next/server'
import { prisma } from 'lib/prisma'
import { requireAuth } from 'lib/auth-middleware'
import { handleApiError } from 'lib/errors'
import { z } from 'zod'

const createTimeEntrySchema = z.object({
  project: z.string().min(1, 'Project is required'),
  hours: z.number().min(0.01, 'Hours must be greater than 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z.string().optional(),
  clientId: z.string().optional(),
})

// GET /api/time-entries - Get all time entries for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const clientId = searchParams.get('clientId')
    const project = searchParams.get('project')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { userId }
    
    if (clientId) where.clientId = clientId
    if (project) where.project = { contains: project, mode: 'insensitive' }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [timeEntries, total, totalHours] = await Promise.all([
      prisma.timeEntry.findMany({
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
          invoice: {
            select: {
              id: true,
              number: true,
              status: true,
            }
          }
        }
      }),
      prisma.timeEntry.count({ where }),
      prisma.timeEntry.aggregate({
        where,
        _sum: { hours: true }
      })
    ])

    return NextResponse.json({
      timeEntries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalHours: totalHours._sum.hours || 0
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/time-entries - Create new time entry
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createTimeEntrySchema.parse(body)

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

    const timeEntry = await prisma.timeEntry.create({
      data: {
        project: validatedData.project,
        hours: validatedData.hours,
        date: new Date(validatedData.date),
        notes: validatedData.notes,
        clientId: validatedData.clientId || null,
        userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          }
        }
      }
    })

    return NextResponse.json({ timeEntry }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
