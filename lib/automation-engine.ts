import { prisma } from './prisma'

/**
 * High-level orchestrator for user-defined automations.
 *
 * Lifecycle per cron tick:
 * 1. Fetch every enabled automation whose `nextRunAt` is due (schedule trigger)
 * 2. Validate guard conditions before doing any heavy work
 * 3. Collect the target items (invoices, contacts, etc.) based on automation category
 * 4. Execute action pipelines sequentially and record granular success/failure counts
 * 5. Persist an automation_run record + bump `nextRunAt`
 *
 * The engine is intentionally conservative — it skips work when conditions are not met
 * and never throws past the top-level loop, so the cron endpoint can return quickly.
 */
export class AutomationEngine {
  // Run all scheduled automations
  static async runScheduledAutomations() {
    const now = new Date()
    
    // Find all enabled scheduled automations that should run
    const automations = await prisma.automation.findMany({
      where: {
        enabled: true,
        triggerType: 'schedule',
        OR: [
          { nextRunAt: { lte: now } },
          { nextRunAt: null }
        ]
      }
    })

    console.log(`Running ${automations.length} scheduled automations`)

    for (const automation of automations) {
      try {
        await this.executeAutomation(automation)
      } catch (error) {
        console.error(`Error executing automation ${automation.id}:`, error)
        await this.recordError(automation.id, error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }

  // Execute a single automation
  static async executeAutomation(automation: any) {
    const startTime = Date.now()
    const runId = crypto.randomUUID()
    
    console.log(`Executing automation: ${automation.name} (${automation.id})`)

    let itemsProcessed = 0
    let itemsSucceeded = 0
    let itemsFailed = 0
    let errorMessage: string | null = null
    let resultData: any = null

    try {
      // Check conditions
      const shouldRun = await this.validateConditions(automation.conditions, automation.category, automation.userId)
      
      if (!shouldRun) {
        console.log(`Automation ${automation.id} conditions not met, skipping`)
        await this.recordRun(automation.id, {
          status: 'skipped',
          itemsProcessed: 0,
          executionTime: Date.now() - startTime
        })
        return
      }

      // Get items to process based on category
      const items = await this.getItemsForAutomation(automation)
      itemsProcessed = items.length

      // Execute actions for each item
      for (const item of items) {
        try {
          await this.executeActions(automation.actions, item, automation.userId)
          itemsSucceeded++
        } catch (error) {
          itemsFailed++
          console.error(`Error processing item in automation ${automation.id}:`, error)
        }
      }

      resultData = {
        itemsProcessed,
        itemsSucceeded,
        itemsFailed
      }

      // Update automation stats
      await prisma.automation.update({
        where: { id: automation.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt: this.calculateNextRun(automation.triggerConfig),
          runCount: { increment: 1 },
          successCount: itemsSucceeded > 0 ? { increment: 1 } : undefined,
          errorCount: itemsFailed > 0 ? { increment: 1 } : undefined,
          lastError: itemsFailed > 0 ? `${itemsFailed} items failed` : null
        }
      })

      // Record successful run
      await this.recordRun(automation.id, {
        status: itemsFailed === 0 ? 'success' : 'error',
        itemsProcessed,
        itemsSucceeded,
        itemsFailed,
        resultData,
        errorMessage: itemsFailed > 0 ? `${itemsFailed} items failed` : null,
        executionTime: Date.now() - startTime
      })

    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Automation ${automation.id} failed:`, error)

      await this.recordError(automation.id, errorMessage)
      await this.recordRun(automation.id, {
        status: 'error',
        itemsProcessed,
        itemsSucceeded,
        itemsFailed,
        errorMessage,
        executionTime: Date.now() - startTime
      })
    }
  }

  // Handle event-driven triggers
  static async handleEvent(eventType: string, eventData: any, userId: string) {
    console.log(`Handling event: ${eventType} for user ${userId}`)

    // Find automations triggered by this event
    // Note: Prisma doesn't support JSON path queries, so we fetch all event automations and filter
    const allEventAutomations = await prisma.automation.findMany({
      where: {
        userId,
        enabled: true,
        triggerType: 'event'
      }
    })

    // Filter by event type in memory
    const automations = allEventAutomations.filter(auto => {
      const config = auto.triggerConfig as any
      return config?.event === eventType
    })

    for (const automation of automations) {
      try {
        // Pass event data as context
        await this.executeAutomationWithContext(automation, eventData)
      } catch (error) {
        console.error(`Error handling event for automation ${automation.id}:`, error)
      }
    }
  }

  // Execute automation with specific context (for events)
  static async executeAutomationWithContext(automation: any, context: any) {
    const startTime = Date.now()

    try {
      // Execute actions with context
      for (const action of automation.actions) {
        await this.executeAction(action, context, automation.userId)
      }

      await prisma.automation.update({
        where: { id: automation.id },
        data: {
          lastRunAt: new Date(),
          runCount: { increment: 1 },
          successCount: { increment: 1 }
        }
      })

      await this.recordRun(automation.id, {
        status: 'success',
        itemsProcessed: 1,
        itemsSucceeded: 1,
        itemsFailed: 0,
        triggerData: context,
        executionTime: Date.now() - startTime
      })
    } catch (error) {
      await this.recordError(automation.id, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  // Validate conditions
  static async validateConditions(conditions: any, category: string, userId: string): Promise<boolean> {
    if (!conditions || Object.keys(conditions).length === 0) return true

    // Category-specific condition validation
    if (category === 'invoice') {
      const where: any = { userId }
      
      if (conditions.invoiceStatus) {
        where.status = conditions.invoiceStatus
      }
      
      if (conditions.daysOverdue !== undefined) {
        const thresholdDate = new Date()
        thresholdDate.setDate(thresholdDate.getDate() + conditions.daysOverdue)
        where.dueDate = {
          lt: thresholdDate
        }
      }
      
      const count = await prisma.invoice.count({ where })
      return count > 0
    }

    if (category === 'quote') {
      const where: any = { userId }
      
      if (conditions.status) {
        where.status = conditions.status
      }
      
      if (conditions.expired) {
        where.validUntil = {
          lt: new Date()
        }
      }
      
      const count = await prisma.quote.count({ where })
      return count > 0
    }

    // Add more condition validations as needed
    return true
  }

  // Get items to process based on automation category
  static async getItemsForAutomation(automation: any): Promise<any[]> {
    const { category, conditions, userId } = automation

    switch (category) {
      case 'invoice':
        return await prisma.invoice.findMany({
          where: {
            userId,
            status: conditions?.invoiceStatus || 'SENT',
            ...(conditions?.daysOverdue && {
              dueDate: {
                lt: new Date(Date.now() + conditions.daysOverdue * 24 * 60 * 60 * 1000)
              }
            })
          },
          take: 100 // Limit for performance
        })

      case 'quote':
        return await prisma.quote.findMany({
          where: {
            userId,
            ...(conditions?.status && { status: conditions.status })
          },
          take: 100
        })

      case 'time':
        // Return empty for time tracking (usually triggered by events)
        return []

      default:
        return []
    }
  }

  // Execute actions for an item
  static async executeActions(actions: any[], item: any, userId: string) {
    for (const action of actions) {
      await this.executeAction(action, item, userId)
    }
  }

  // Execute a single action
  static async executeAction(action: any, context: any, userId: string) {
    const { type, config } = action

    switch (type) {
      case 'send_email':
        await this.sendEmail(action, context, userId)
        break

      case 'send_whatsapp':
        await this.sendWhatsApp(action, context, userId)
        break

      case 'create_invoice':
        await this.createInvoice(action, context, userId)
        break

      case 'create_quote':
        await this.createQuote(action, context, userId)
        break

      case 'create_time_entry':
        await this.createTimeEntry(action, context, userId)
        break

      case 'create_kilometer_entry':
        await this.createKilometerEntry(action, context, userId)
        break

      case 'create_calendar_event':
        await this.createCalendarEvent(action, context, userId)
        break

      case 'send_notification':
        await this.sendNotification(action, context, userId)
        break

      case 'update_invoice':
        await this.updateInvoice(action, context, userId)
        break

      default:
        console.warn(`Unknown action type: ${type}`)
    }
  }

  // Action implementations
  static async sendEmail(action: any, context: any, userId: string) {
    // TODO: Implement email sending via Gmail/Outlook API
    console.log('Sending email:', { action, context })
  }

  static async sendWhatsApp(action: any, context: any, userId: string) {
    // TODO: Implement WhatsApp sending
    console.log('Sending WhatsApp:', { action, context })
  }

  static async createInvoice(action: any, context: any, userId: string) {
    // TODO: Implement invoice creation
    console.log('Creating invoice:', { action, context })
  }

  static async createQuote(action: any, context: any, userId: string) {
    // TODO: Implement quote creation
    console.log('Creating quote:', { action, context })
  }

  static async createTimeEntry(action: any, context: any, userId: string) {
    // TODO: Implement time entry creation
    console.log('Creating time entry:', { action, context })
  }

  static async createKilometerEntry(action: any, context: any, userId: string) {
    // TODO: Implement kilometer entry creation
    console.log('Creating kilometer entry:', { action, context })
  }

  static async createCalendarEvent(action: any, context: any, userId: string) {
    // TODO: Implement calendar event creation
    console.log('Creating calendar event:', { action, context })
  }

  static async sendNotification(action: any, context: any, userId: string) {
    await prisma.notification.create({
      data: {
        userId,
        type: action.config?.type || 'automation',
        title: action.config?.title || 'Automation Notification',
        message: action.config?.message || 'An automation has been executed',
        data: context,
        priority: action.config?.priority || 'medium'
      }
    })
  }

  static async updateInvoice(action: any, context: any, userId: string) {
    if (context.id && action.config?.fields) {
      await prisma.invoice.update({
        where: { id: context.id },
        data: action.config.fields
      })
    }
  }

  // Helper methods
  static calculateNextRun(triggerConfig: any): Date | null {
    if (!triggerConfig || !triggerConfig.schedule) return null

    const now = new Date()
    const { schedule, time } = triggerConfig

    if (schedule === 'daily' && time) {
      const [hours, minutes] = time.split(':').map(Number)
      const nextRun = new Date(now)
      nextRun.setHours(hours, minutes, 0, 0)
      
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
      
      return nextRun
    }

    return null
  }

  static async recordRun(automationId: string, data: any) {
    await prisma.automationRun.create({
      data: {
        automationId,
        status: data.status,
        itemsProcessed: data.itemsProcessed || 0,
        itemsSucceeded: data.itemsSucceeded || 0,
        itemsFailed: data.itemsFailed || 0,
        triggerData: data.triggerData,
        resultData: data.resultData,
        errorMessage: data.errorMessage,
        executionTime: data.executionTime,
        completedAt: new Date()
      }
    })
  }

  static async recordError(automationId: string, errorMessage: string) {
    await prisma.automation.update({
      where: { id: automationId },
      data: {
        errorCount: { increment: 1 },
        lastError: errorMessage
      }
    })
  }
}

