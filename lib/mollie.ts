import { createMollieClient } from '@mollie/api-client'

// Initialize Mollie client
export const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
})

export interface CreatePaymentData {
  amount: {
    currency: string
    value: string
  }
  description: string
  redirectUrl: string
  webhookUrl?: string
  metadata?: Record<string, any>
  method?: string[]
}

export interface CreateSubscriptionData {
  amount: {
    currency: string
    value: string
  }
  interval: string
  description: string
  webhookUrl?: string
  metadata?: Record<string, any>
}

export class MollieService {
  // Create a one-time payment
  static async createPayment(data: CreatePaymentData) {
    try {
      const payment = await mollieClient.payments.create({
        amount: data.amount,
        description: data.description,
        redirectUrl: data.redirectUrl,
        webhookUrl: data.webhookUrl,
        metadata: data.metadata,
        method: data.method,
      })

      return payment
    } catch (error) {
      console.error('Mollie payment creation error:', error)
      throw error
    }
  }

  // Get payment status
  static async getPayment(paymentId: string) {
    try {
      const payment = await mollieClient.payments.get(paymentId)
      return payment
    } catch (error) {
      console.error('Mollie get payment error:', error)
      throw error
    }
  }

  // Create a customer for subscriptions
  static async createCustomer(email: string, name: string, metadata?: Record<string, any>) {
    try {
      const customer = await mollieClient.customers.create({
        email,
        name,
        metadata,
      })

      return customer
    } catch (error) {
      console.error('Mollie customer creation error:', error)
      throw error
    }
  }

  // Create a subscription
  static async createSubscription(customerId: string, data: CreateSubscriptionData) {
    try {
      const subscription = await mollieClient.customerSubscriptions.create({
        customerId,
        amount: data.amount,
        interval: data.interval,
        description: data.description,
        webhookUrl: data.webhookUrl,
        metadata: data.metadata,
      })

      return subscription
    } catch (error) {
      console.error('Mollie subscription creation error:', error)
      throw error
    }
  }

  // Cancel a subscription
  static async cancelSubscription(customerId: string, subscriptionId: string) {
    try {
      const subscription = await mollieClient.customerSubscriptions.cancel(subscriptionId, {
        customerId,
      })

      return subscription
    } catch (error) {
      console.error('Mollie subscription cancellation error:', error)
      throw error
    }
  }

  // Get subscription status
  static async getSubscription(customerId: string, subscriptionId: string) {
    try {
      const subscription = await mollieClient.customerSubscriptions.get(subscriptionId, {
        customerId,
      })

      return subscription
    } catch (error) {
      console.error('Mollie get subscription error:', error)
      throw error
    }
  }

  // List all payments for a customer
  static async getCustomerPayments(customerId: string) {
    try {
      const payments = await mollieClient.customerPayments.page({
        customerId,
      })

      return payments
    } catch (error) {
      console.error('Mollie get customer payments error:', error)
      throw error
    }
  }

  // Create payment link for invoice
  static async createInvoicePaymentLink(invoiceId: string, amount: number, description: string, customerEmail?: string) {
    const paymentData: CreatePaymentData = {
      amount: {
        currency: 'EUR',
        value: amount.toFixed(2),
      },
      description,
      redirectUrl: `${process.env.APP_URL}/dashboard/invoices/${invoiceId}?payment=success`,
      webhookUrl: `${process.env.APP_URL}/api/webhooks/mollie`,
      metadata: {
        invoiceId,
        type: 'invoice_payment',
      },
    }

    if (customerEmail) {
      paymentData.metadata!.customerEmail = customerEmail
    }

    const payment = await this.createPayment(paymentData)
    return payment.getCheckoutUrl()
  }

  // Create subscription for user
  static async createUserSubscription(userId: string, email: string, name: string, tier: 'STARTER' | 'PRO' | 'BUSINESS') {
    // Subscription pricing
    const pricing = {
      STARTER: { amount: '0.00', interval: '1 month' },
      PRO: { amount: '29.99', interval: '1 month' },
      BUSINESS: { amount: '79.99', interval: '1 month' },
    }

    const plan = pricing[tier]

    // Create customer first
    const customer = await this.createCustomer(email, name, {
      userId,
      subscriptionTier: tier,
    })

    // Create subscription (skip for free tier)
    if (tier !== 'STARTER') {
      const subscription = await this.createSubscription(customer.id, {
        amount: {
          currency: 'EUR',
          value: plan.amount,
        },
        interval: plan.interval,
        description: `ZzpChat ${tier} Subscription`,
        webhookUrl: `${process.env.APP_URL}/api/webhooks/mollie`,
        metadata: {
          userId,
          subscriptionTier: tier,
        },
      })

      return { customer, subscription }
    }

    return { customer, subscription: null }
  }
}
