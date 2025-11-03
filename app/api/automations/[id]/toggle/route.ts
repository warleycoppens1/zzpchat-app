import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'

// POST /api/automations/[id]/toggle - Enable/disable automation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)

    const automation = await prisma.automation.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!automation) {
      return NextResponse.json(
        { error: 'Automation not found' },
        { status: 404 }
      )
    }

    const newEnabled = !automation.enabled
    
    // Calculate nextRunAt if enabling a scheduled automation
    let nextRunAt = automation.nextRunAt
    if (newEnabled && automation.triggerType === 'schedule') {
      nextRunAt = calculateNextRun(automation.triggerConfig as any)
    } else if (!newEnabled) {
      nextRunAt = null
    }

    const updated = await prisma.automation.update({
      where: { id: params.id },
      data: {
        enabled: newEnabled,
        nextRunAt
      }
    })

    return NextResponse.json({ automation: updated })
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

