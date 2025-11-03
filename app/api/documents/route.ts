import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'

// GET /api/documents - List documents with optional filters
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    const folderId = searchParams.get('folderId')
    const clientId = searchParams.get('clientId')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')?.split(',')
    const mimeType = searchParams.get('mimeType')

    const where: any = { userId }

    if (folderId === 'null' || folderId === '') {
      where.folderId = null
    } else if (folderId) {
      where.folderId = folderId
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags }
    }

    if (mimeType) {
      where.mimeType = { contains: mimeType }
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/documents - Create document (after upload)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()

    const {
      name,
      description,
      filename,
      originalName,
      fileSize,
      mimeType,
      filePath,
      folderId,
      clientId,
      tags,
      metadata,
    } = body

    if (!name || !filename || !originalName || !filePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if folder exists and belongs to user
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      })
      if (!folder) {
        return NextResponse.json(
          { error: 'Folder not found' },
          { status: 404 }
        )
      }
    }

    // Check if client exists and belongs to user
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

    const document = await prisma.document.create({
      data: {
        name,
        description: description || null,
        filename,
        originalName,
        fileSize: parseInt(fileSize),
        mimeType,
        filePath,
        folderId: folderId || null,
        clientId: clientId || null,
        tags: tags || [],
        metadata: metadata || null,
        uploadedBy: userId,
        userId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Update user storage
    await prisma.user.update({
      where: { id: userId },
      data: {
        storageUsed: { increment: fileSize },
      },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

