import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import fs from 'fs/promises'
import path from 'path'

// GET /api/documents/[id] - Get document details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params

    const document = await prisma.document.findFirst({
      where: { id, userId },
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

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Update last accessed
    await prisma.document.update({
      where: { id },
      data: { lastAccessed: new Date() },
    })

    return NextResponse.json({ document })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/documents/[id] - Update document
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params
    const body = await request.json()

    const document = await prisma.document.findFirst({
      where: { id, userId },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.folderId !== undefined) {
      if (body.folderId === null || body.folderId === '') {
        updateData.folderId = null
      } else {
        // Verify folder belongs to user
        const folder = await prisma.folder.findFirst({
          where: { id: body.folderId, userId },
        })
        if (!folder) {
          return NextResponse.json(
            { error: 'Folder not found' },
            { status: 404 }
          )
        }
        updateData.folderId = body.folderId
      }
    }
    if (body.clientId !== undefined) {
      if (body.clientId === null || body.clientId === '') {
        updateData.clientId = null
      } else {
        // Verify client belongs to user
        const client = await prisma.client.findFirst({
          where: { id: body.clientId, userId },
        })
        if (!client) {
          return NextResponse.json(
            { error: 'Client not found' },
            { status: 404 }
          )
        }
        updateData.clientId = body.clientId
      }
    }
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.metadata !== undefined) updateData.metadata = body.metadata

    const updated = await prisma.document.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ document: updated })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/documents/[id] - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params

    const document = await prisma.document.findFirst({
      where: { id, userId },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), 'public', document.filePath)
      await fs.unlink(filePath)
    } catch (fileError) {
      console.error('Error deleting file:', fileError)
      // Continue with DB deletion even if file deletion fails
    }

    // Delete from database
    await prisma.document.delete({
      where: { id },
    })

    // Update user storage
    await prisma.user.update({
      where: { id: userId },
      data: {
        storageUsed: { decrement: document.fileSize },
      },
    })

    return NextResponse.json({ message: 'Document deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

