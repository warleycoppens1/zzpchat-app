import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'

// GET /api/folders - List folders (tree structure)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    const parentId = searchParams.get('parentId')
    const clientId = searchParams.get('clientId')
    const includeDocuments = searchParams.get('includeDocuments') === 'true'

    const where: any = { userId }

    if (parentId === 'null' || parentId === '') {
      where.parentId = null
    } else if (parentId) {
      where.parentId = parentId
    }

    if (clientId) {
      where.clientId = clientId
    }

    const folders = await prisma.folder.findMany({
      where,
      include: {
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
        documents: includeDocuments
          ? {
              take: 10,
              orderBy: { uploadedAt: 'desc' },
              select: {
                id: true,
                name: true,
                mimeType: true,
                fileSize: true,
                uploadedAt: true,
              },
            }
          : false,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ folders })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/folders - Create folder
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()

    const { name, description, parentId, clientId, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      )
    }

    // Verify parent folder if provided
    if (parentId) {
      const parent = await prisma.folder.findFirst({
        where: { id: parentId, userId },
      })
      if (!parent) {
        return NextResponse.json(
          { error: 'Parent folder not found' },
          { status: 404 }
        )
      }
    }

    // Verify client if provided
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, userId },
      })
      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        description: description || null,
        parentId: parentId || null,
        clientId: clientId || null,
        color: color || null,
        userId,
      },
      include: {
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    })

    return NextResponse.json({ folder }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

