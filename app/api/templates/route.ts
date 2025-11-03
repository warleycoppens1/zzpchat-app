import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  type: z.enum(['INVOICE', 'QUOTE']),
  data: z.object({
    billFrom: z.object({
      name: z.string(),
      company: z.string(),
      address: z.string(),
      email: z.string(),
      phone: z.string(),
    }),
    lineItems: z.array(z.object({
      description: z.string(),
      quantity: z.number(),
      rate: z.number(),
      amount: z.number(),
    })),
    taxRate: z.number(),
    discountRate: z.number(),
    shipping: z.number(),
    notes: z.string().optional(),
    terms: z.string().optional(),
  })
})

// GET /api/templates - Get all templates for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type') // 'INVOICE' or 'QUOTE'

    const where = {
      userId,
      ...(type && { type: type as 'INVOICE' | 'QUOTE' }),
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createTemplateSchema.parse(body)

    const template = await prisma.template.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        data: validatedData.data,
        userId,
      }
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}


