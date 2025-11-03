import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const createAutomationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(['invoice', 'quote', 'time', 'email', 'calendar', 'kilometer']),
  triggerType: z.enum(['schedule', 'event', 'webhook']),
  triggerConfig: z.any(), // JSON object
  conditions: z.any().optional(), // JSON object
  actions: z.array(z.any()), // Array of action objects
  templateId: z.string().optional(),
  enabled: z.boolean().default(true),
})

// GET /api/automations - List all automations for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const enabled = searchParams.get('enabled')
    const isDefault = searchParams.get('isDefault')

    const where: any = { userId }
    
    if (category) where.category = category
    if (enabled !== null) where.enabled = enabled === 'true'
    if (isDefault !== null) where.isDefault = isDefault === 'true'

    const automations = await prisma.automation.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        runs: {
          take: 1,
          orderBy: { startedAt: 'desc' },
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            itemsProcessed: true,
            itemsSucceeded: true,
            itemsFailed: true,
            errorMessage: true,
          }
        }
      }
    })

    return NextResponse.json({ automations })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/automations - Create new automation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createAutomationSchema.parse(body)

    // If templateId provided, load template defaults
    let automationData = { ...validatedData }
    
    if (validatedData.templateId) {
      const template = await prisma.automationTemplate.findUnique({
        where: { id: validatedData.templateId }
      })

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }

      // Merge template defaults with provided data
      automationData = {
        ...automationData,
        triggerConfig: validatedData.triggerConfig || template.defaultTriggerConfig,
        actions: validatedData.actions.length > 0 ? validatedData.actions : (template.defaultActions as any[]),
        category: validatedData.category || template.category,
        triggerType: validatedData.triggerType || template.triggerType,
      }
    }

    // Calculate nextRunAt for scheduled automations
    let nextRunAt: Date | null = null
    if (automationData.triggerType === 'schedule' && automationData.enabled) {
      nextRunAt = calculateNextRun(automationData.triggerConfig)
    }

    const automation = await prisma.automation.create({
      data: {
        name: automationData.name,
        description: automationData.description,
        category: automationData.category,
        triggerType: automationData.triggerType,
        triggerConfig: automationData.triggerConfig,
        conditions: automationData.conditions,
        actions: automationData.actions,
        enabled: automationData.enabled,
        userId,
        nextRunAt,
      }
    })

    return NextResponse.json({ automation }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

// Helper function to calculate next run time for scheduled automations
function calculateNextRun(triggerConfig: any): Date | null {
  if (!triggerConfig || !triggerConfig.schedule) return null

  const now = new Date()
  const { schedule, time } = triggerConfig

  if (schedule === 'daily' && time) {
    const [hours, minutes] = time.split(':').map(Number)
    const nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)
    
    // If time has passed today, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }
    
    return nextRun
  }

  // Add more schedule types (weekly, monthly) as needed
  return null
}

