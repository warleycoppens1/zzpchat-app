import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'

// GET /api/analytics/invoices - Invoice analytics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)

    // Get all invoices with payment info
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        amount: true,
        sentAt: true,
        paidAt: true,
        dueDate: true,
        createdAt: true,
      }
    })

    // Calculate average payment time
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID' && inv.sentAt && inv.paidAt)
    const paymentTimes = paidInvoices.map(inv => {
      const sent = new Date(inv.sentAt!).getTime()
      const paid = new Date(inv.paidAt!).getTime()
      return (paid - sent) / (1000 * 60 * 60 * 24) // days
    })

    const avgPaymentTime = paymentTimes.length > 0
      ? paymentTimes.reduce((sum, time) => sum + time, 0) / paymentTimes.length
      : 0

    // Get overdue invoices
    const now = new Date()
    const overdueInvoices = invoices.filter(inv => {
      if (inv.status !== 'SENT' || !inv.dueDate) return false
      return new Date(inv.dueDate) < now
    })

    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0)

    // Status breakdown
    const statusBreakdown = invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Amount by status
    const amountByStatus = invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + Number(inv.amount)
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      total: invoices.length,
      byStatus: statusBreakdown,
      amountByStatus,
      averagePaymentTime: Math.round(avgPaymentTime * 10) / 10, // Round to 1 decimal
      overdue: {
        count: overdueInvoices.length,
        amount: overdueAmount
      },
      paid: {
        count: statusBreakdown.PAID || 0,
        amount: amountByStatus.PAID || 0
      },
      unpaid: {
        count: (statusBreakdown.SENT || 0) + (statusBreakdown.DRAFT || 0),
        amount: (amountByStatus.SENT || 0) + (amountByStatus.DRAFT || 0)
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

