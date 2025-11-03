import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const updateAutomationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  triggerConfig: z.any().optional(),
  conditions: z.any().optional(),
  actions: z.array(z.any()).optional(),
  enabled: z.boolean().optional(),
})

// GET /api/automations/[id] - Get automation details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    
    const automation = await prisma.automation.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        runs: {
          take: 20,
          orderBy: { startedAt: 'desc' },
        }
      }
    })

    if (!automation) {
      return NextResponse.json(
        { error: 'Automation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ automation })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/automations/[id] - Update automation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = updateAutomationSchema.parse(body)

    // Verify automation belongs to user
    const existing = await prisma.automation.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Automation not found' },
        { status: 404 }
      )
    }

    // Recalculate nextRunAt if triggerConfig or enabled changed
    let nextRunAt = existing.nextRunAt
    if (
      (validatedData.triggerConfig || validatedData.enabled !== undefined) &&
      existing.triggerType === 'schedule'
    ) {
      const enabled = validatedData.enabled ?? existing.enabled
      const triggerConfig = validatedData.triggerConfig ?? existing.triggerConfig
      nextRunAt = enabled ? calculateNextRun(triggerConfig) : null
    }

    const automation = await prisma.automation.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        nextRunAt,
      }
    })

    return NextResponse.json({ automation })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/automations/[id] - Delete automation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)

    // Verify automation belongs to user and is not a default automation
    const existing = await prisma.automation.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Automation not found' },
        { status: 404 }
      )
    }

    if (existing.isDefault) {
      // Don't delete default automations, just disable them
      const automation = await prisma.automation.update({
        where: { id: params.id },
        data: { enabled: false }
      })
      return NextResponse.json({ automation, message: 'Default automation disabled' })
    }

    await prisma.automation.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Automation deleted' })
  } catch (error) {
    return handleApiError(error)
  }
}

// Helper function to calculate next run time
function calculateNextRun(triggerConfig: any): Date | null {
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

