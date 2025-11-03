import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'

// GET /api/automations/templates - Get all available templates
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')

    const where: any = {
      OR: [
        { isPublic: true },
        // Could add user-created templates here if needed
      ]
    }
    
    if (category) {
      where.category = category
    }

    const templates = await prisma.automationTemplate.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({ templates })
  } catch (error) {
    return handleApiError(error)
  }
}

