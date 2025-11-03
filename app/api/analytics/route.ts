import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns'

// GET /api/analytics - Main analytics endpoint
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let dateStart: Date
    let dateEnd: Date = new Date()

    if (startDate && endDate) {
      dateStart = new Date(startDate)
      dateEnd = new Date(endDate)
    } else {
      switch (period) {
        case 'year':
          dateStart = startOfYear(new Date())
          dateEnd = endOfYear(new Date())
          break
        case 'month':
        default:
          dateStart = startOfMonth(new Date())
          dateEnd = endOfMonth(new Date())
          break
      }
    }

    // Get revenue data
    const paidInvoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: 'PAID',
        paidAt: {
          gte: dateStart,
          lte: dateEnd
        }
      },
      select: {
        amount: true,
        paidAt: true,
        clientId: true,
      }
    })

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0)

    // Get invoice stats
    const invoices = await prisma.invoice.groupBy({
      by: ['status'],
      where: {
        userId,
        createdAt: {
          gte: dateStart,
          lte: dateEnd
        }
      },
      _count: true,
      _sum: {
        amount: true
      }
    })

    // Get client stats
    const totalClients = await prisma.client.count({
      where: { userId }
    })

    const topClients = await prisma.client.findMany({
      where: { userId },
      orderBy: { totalRevenue: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        company: true,
        totalRevenue: true,
        totalInvoices: true,
      }
    })

    // Get time tracking stats
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId,
        date: {
          gte: dateStart,
          lte: dateEnd
        }
      },
      select: {
        hours: true,
        billable: true,
      }
    })

    const totalHours = timeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0)
    const billableHours = timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + Number(entry.hours), 0)

    // Calculate growth (compare to previous period)
    const previousStart = subMonths(dateStart, 1)
    const previousEnd = subMonths(dateEnd, 1)

    const previousRevenue = await prisma.invoice.aggregate({
      where: {
        userId,
        status: 'PAID',
        paidAt: {
          gte: previousStart,
          lte: previousEnd
        }
      },
      _sum: {
        amount: true
      }
    })

    const previousRevenueAmount = Number(previousRevenue._sum.amount || 0)
    const revenueGrowth = previousRevenueAmount > 0 
      ? ((totalRevenue - previousRevenueAmount) / previousRevenueAmount) * 100 
      : 0

    return NextResponse.json({
      period: {
        start: dateStart.toISOString(),
        end: dateEnd.toISOString()
      },
      revenue: {
        total: totalRevenue,
        growth: revenueGrowth,
        trend: revenueGrowth > 0 ? 'up' : revenueGrowth < 0 ? 'down' : 'stable'
      },
      invoices: {
        byStatus: invoices.reduce((acc, inv) => {
          acc[inv.status] = {
            count: inv._count,
            total: Number(inv._sum.amount || 0)
          }
          return acc
        }, {} as Record<string, any>),
        total: invoices.reduce((sum, inv) => sum + inv._count, 0)
      },
      clients: {
        total: totalClients,
        top: topClients
      },
      timeTracking: {
        totalHours,
        billableHours,
        billablePercentage: totalHours > 0 ? (billableHours / totalHours) * 100 : 0
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

