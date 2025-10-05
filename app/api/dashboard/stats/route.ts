import { NextRequest, NextResponse } from 'next/server'
import { prisma } from 'lib/prisma'
import { requireAuth } from 'lib/auth-middleware'
import { handleApiError } from 'lib/errors'

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)

    // Get current month and previous month dates
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get all statistics in parallel
    const [
      totalClients,
      totalInvoices,
      totalQuotes,
      totalTimeEntries,
      currentMonthInvoices,
      previousMonthInvoices,
      currentMonthRevenue,
      previousMonthRevenue,
      invoicesByStatus,
      quotesByStatus,
      recentInvoices,
      recentQuotes,
      recentTimeEntries,
    ] = await Promise.all([
      // Total counts
      prisma.client.count({ where: { userId } }),
      prisma.invoice.count({ where: { userId } }),
      prisma.quote.count({ where: { userId } }),
      prisma.timeEntry.count({ where: { userId } }),

      // Monthly comparisons
      prisma.invoice.count({
        where: {
          userId,
          createdAt: { gte: currentMonthStart }
        }
      }),
      prisma.invoice.count({
        where: {
          userId,
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd
          }
        }
      }),

      // Revenue calculations
      prisma.invoice.aggregate({
        where: {
          userId,
          status: 'PAID',
          paidAt: { gte: currentMonthStart }
        },
        _sum: { amount: true }
      }),
      prisma.invoice.aggregate({
        where: {
          userId,
          status: 'PAID',
          paidAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd
          }
        },
        _sum: { amount: true }
      }),

      // Status breakdowns
      prisma.invoice.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true }
      }),
      prisma.quote.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true }
      }),

      // Recent items
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          client: {
            select: { name: true, company: true }
          }
        }
      }),
      prisma.quote.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          client: {
            select: { name: true, company: true }
          }
        }
      }),
      prisma.timeEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          client: {
            select: { name: true }
          }
        }
      }),
    ])

    // Calculate growth percentages
    const invoiceGrowth = previousMonthInvoices > 0 
      ? ((currentMonthInvoices - previousMonthInvoices) / previousMonthInvoices) * 100
      : currentMonthInvoices > 0 ? 100 : 0

    const prevRevenue = Number(previousMonthRevenue._sum.amount || 0)
    const currentRevenue = Number(currentMonthRevenue._sum.amount || 0)
    const revenueGrowth = prevRevenue > 0
      ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
      : currentRevenue > 0 ? 100 : 0

    // Format status breakdowns
    const invoiceStatusMap = invoicesByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    const quoteStatusMap = quotesByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    const stats = {
      overview: {
        totalClients,
        totalInvoices,
        totalQuotes,
        totalTimeEntries,
      },
      revenue: {
        currentMonth: currentMonthRevenue._sum.amount || 0,
        previousMonth: previousMonthRevenue._sum.amount || 0,
        growth: Math.round(revenueGrowth * 100) / 100,
      },
      invoices: {
        currentMonth: currentMonthInvoices,
        previousMonth: previousMonthInvoices,
        growth: Math.round(invoiceGrowth * 100) / 100,
        byStatus: {
          draft: invoiceStatusMap.DRAFT || 0,
          sent: invoiceStatusMap.SENT || 0,
          paid: invoiceStatusMap.PAID || 0,
          overdue: invoiceStatusMap.OVERDUE || 0,
          cancelled: invoiceStatusMap.CANCELLED || 0,
        }
      },
      quotes: {
        byStatus: {
          draft: quoteStatusMap.DRAFT || 0,
          sent: quoteStatusMap.SENT || 0,
          accepted: quoteStatusMap.ACCEPTED || 0,
          rejected: quoteStatusMap.REJECTED || 0,
          expired: quoteStatusMap.EXPIRED || 0,
        }
      },
      recent: {
        invoices: recentInvoices,
        quotes: recentQuotes,
        timeEntries: recentTimeEntries,
      }
    }

    return NextResponse.json({ stats })
  } catch (error) {
    return handleApiError(error)
  }
}
