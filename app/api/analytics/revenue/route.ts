import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { startOfMonth, endOfMonth, eachDayOfInterval, subDays, format } from 'date-fns'

// GET /api/analytics/revenue - Revenue breakdown
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const period = searchParams.get('period') || 'month' // 'day', 'week', 'month'
    const days = parseInt(searchParams.get('days') || '30')

    const endDate = new Date()
    const startDate = subDays(endDate, days)

    // Get paid invoices in period
    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: 'PAID',
        paidAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        amount: true,
        paidAt: true,
        clientId: true,
        client: {
          select: {
            name: true,
            company: true
          }
        }
      },
      orderBy: {
        paidAt: 'desc'
      }
    })

    // Group by period
    const revenueByPeriod: Record<string, number> = {}
    const revenueByClient: Record<string, { name: string; amount: number }> = {}

    invoices.forEach(invoice => {
      // Group by period
      const dateKey = format(new Date(invoice.paidAt!), period === 'day' ? 'yyyy-MM-dd' : period === 'week' ? 'yyyy-ww' : 'yyyy-MM')
      revenueByPeriod[dateKey] = (revenueByPeriod[dateKey] || 0) + Number(invoice.amount)

      // Group by client
      const clientKey = invoice.clientId
      const clientName = invoice.client.company || invoice.client.name
      if (!revenueByClient[clientKey]) {
        revenueByClient[clientKey] = { name: clientName, amount: 0 }
      }
      revenueByClient[clientKey].amount += Number(invoice.amount)
    })

    // Convert to arrays for charts
    const trendData = Object.entries(revenueByPeriod)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const clientData = Object.entries(revenueByClient)
      .map(([clientId, data]) => ({ clientId, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)

    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0)
    const averagePerDay = days > 0 ? totalRevenue / days : 0

    return NextResponse.json({
      total: totalRevenue,
      averagePerDay,
      trend: trendData,
      byClient: clientData,
      period
    })
  } catch (error) {
    return handleApiError(error)
  }
}

