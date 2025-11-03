import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

// GET /api/analytics/time-tracking - Time tracking stats
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const period = searchParams.get('period') || 'month'

    let dateStart: Date
    let dateEnd: Date = new Date()

    if (period === 'week') {
      dateStart = startOfWeek(new Date())
      dateEnd = endOfWeek(new Date())
    } else {
      dateStart = startOfMonth(new Date())
      dateEnd = endOfMonth(new Date())
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId,
        date: {
          gte: dateStart,
          lte: dateEnd
        }
      },
      include: {
        client: {
          select: {
            name: true,
            company: true
          }
        },
        projectRelation: {
          select: {
            name: true
          }
        }
      }
    })

    // Calculate totals
    const totalHours = timeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0)
    const billableHours = timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + Number(entry.hours), 0)
    const nonBillableHours = totalHours - billableHours

    // Group by client
    const byClient = timeEntries.reduce((acc, entry) => {
      const clientId = entry.clientId || 'unknown'
      const clientName = entry.client?.company || entry.client?.name || 'Geen klant'
      
      if (!acc[clientId]) {
        acc[clientId] = {
          clientId,
          clientName,
          hours: 0,
          billableHours: 0
        }
      }
      
      acc[clientId].hours += Number(entry.hours)
      if (entry.billable) {
        acc[clientId].billableHours += Number(entry.hours)
      }
      
      return acc
    }, {} as Record<string, any>)

    const clientData = Object.values(byClient)
      .sort((a: any, b: any) => b.hours - a.hours)
      .slice(0, 10)

    // Group by project
    const byProject = timeEntries.reduce((acc, entry) => {
      const projectId = entry.projectId || entry.project || 'unknown'
      const projectName = entry.projectRelation?.name || entry.project || 'Geen project'
      
      if (!acc[projectId]) {
        acc[projectId] = {
          projectId,
          projectName,
          hours: 0
        }
      }
      
      acc[projectId].hours += Number(entry.hours)
      return acc
    }, {} as Record<string, any>)

    const projectData = Object.values(byProject)
      .sort((a: any, b: any) => b.hours - a.hours)
      .slice(0, 10)

    return NextResponse.json({
      period: {
        start: dateStart.toISOString(),
        end: dateEnd.toISOString()
      },
      totalHours,
      billableHours,
      nonBillableHours,
      billablePercentage: totalHours > 0 ? (billableHours / totalHours) * 100 : 0,
      byClient: clientData,
      byProject: projectData,
      totalEntries: timeEntries.length
    })
  } catch (error) {
    return handleApiError(error)
  }
}

