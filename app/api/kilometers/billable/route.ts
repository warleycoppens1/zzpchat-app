import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'

// GET /api/kilometers/billable - Get billable kilometers for invoicing
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const clientId = searchParams.get('clientId')
    const projectId = searchParams.get('projectId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const month = searchParams.get('month') // Format: YYYY-MM

    const where: any = { 
      userId,
      isBillable: true,
      type: 'zakelijk',
      status: 'billable' // Only show entries that are ready to be billed
    }
    
    if (clientId) where.clientId = clientId
    if (projectId) where.projectId = projectId
    
    // Date filtering
    if (month) {
      const startOfMonth = new Date(`${month}-01`)
      const endOfMonth = new Date(startOfMonth)
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      endOfMonth.setDate(0) // Last day of month
      
      where.date = {
        gte: startOfMonth,
        lte: endOfMonth
      }
    } else if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [kilometerEntries, totalDistance, summary] = await Promise.all([
      prisma.kilometerEntry.findMany({
        where,
        orderBy: {
          date: 'desc'
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
      }),
      prisma.kilometerEntry.aggregate({
        where,
        _sum: { distanceKm: true }
      }),
      prisma.kilometerEntry.groupBy({
        by: ['clientId', 'projectId'],
        where,
        _sum: {
          distanceKm: true
        },
        _count: {
          id: true
        }
      })
    ])

    // Group by client and project for easier invoice creation
    const groupedKilometers = summary.map(group => {
      const client = kilometerEntries.find(entry => entry.clientId === group.clientId)?.client
      const project = kilometerEntries.find(entry => entry.projectId === group.projectId)?.project
      
      return {
        clientId: group.clientId,
        projectId: group.projectId,
        client: client || null,
        project: project || null,
        totalDistance: group._sum.distanceKm || 0,
        tripCount: group._count.id,
        entries: kilometerEntries.filter(entry => 
          entry.clientId === group.clientId && 
          entry.projectId === group.projectId
        )
      }
    })

    return NextResponse.json({
      kilometerEntries,
      groupedKilometers,
      summary: {
        totalDistance: totalDistance._sum.distanceKm || 0,
        totalTrips: kilometerEntries.length,
        groups: groupedKilometers.length
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
