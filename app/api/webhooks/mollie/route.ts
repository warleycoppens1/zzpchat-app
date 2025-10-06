import { NextRequest, NextResponse } from 'next/server'
import { MollieService } from '@/lib/mollie'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/errors'

// POST /api/webhooks/mollie - Handle Mollie webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const paymentId = body.id

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
    }

    // Get payment details from Mollie
    const payment = await MollieService.getPayment(paymentId)
    
    console.log('Mollie webhook received:', {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      metadata: payment.metadata,
    })

    // Process based on payment status
    switch (payment.status) {
      case 'paid':
        await handlePaidPayment(payment)
        break
        
      case 'failed':
      case 'canceled':
      case 'expired':
        await handleFailedPayment(payment)
        break
        
      default:
        console.log(`Payment ${payment.id} status: ${payment.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mollie webhook error:', error)
    return handleApiError(error)
  }
}

async function handlePaidPayment(payment: any) {
  const metadata = payment.metadata || {}
  
  if (metadata.type === 'invoice_payment' && metadata.invoiceId) {
    // Update invoice status to paid
    await prisma.invoice.update({
      where: { id: metadata.invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      }
    })
    
    console.log(`Invoice ${metadata.invoiceId} marked as paid`)
    
    // TODO: Send confirmation email
    // This can be implemented with a direct email service or SimAI workflow
    console.log('Invoice payment confirmed - email notification needed', {
      invoiceId: metadata.invoiceId,
      paymentId: payment.id,
      amount: payment.amount.value,
      customerEmail: metadata.customerEmail,
    })
  }
  
  if (metadata.subscriptionTier && metadata.userId) {
    // Update user subscription status
    await prisma.user.update({
      where: { id: metadata.userId },
      data: {
        subscriptionTier: metadata.subscriptionTier,
      }
    })
    
    console.log(`User ${metadata.userId} subscription updated to ${metadata.subscriptionTier}`)
  }
}

async function handleFailedPayment(payment: any) {
  const metadata = payment.metadata || {}
  
  if (metadata.type === 'invoice_payment' && metadata.invoiceId) {
    // Could mark invoice as payment failed
    console.log(`Payment failed for invoice ${metadata.invoiceId}`)
    
    // TODO: Send failure notification
    // This can be implemented with a direct email service or SimAI workflow
    console.log('Payment failed - notification needed', {
      invoiceId: metadata.invoiceId,
      paymentId: payment.id,
      reason: payment.status,
    })
  }
}
