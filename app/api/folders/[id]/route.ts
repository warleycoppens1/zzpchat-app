import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'

// GET /api/folders/[id] - Get folder details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params

    const folder = await prisma.folder.findFirst({
      where: { id, userId },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          include: {
            _count: {
              select: {
                documents: true,
                children: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                company: true,
              },
            },
          },
        },
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ folder })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/folders/[id] - Update folder
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params
    const body = await request.json()

    const folder = await prisma.folder.findFirst({
      where: { id, userId },
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.color !== undefined) updateData.color = body.color

    if (body.parentId !== undefined) {
      if (body.parentId === null || body.parentId === '') {
        updateData.parentId = null
      } else {
        // Prevent circular references
        if (body.parentId === id) {
          return NextResponse.json(
            { error: 'Cannot set folder as its own parent' },
            { status: 400 }
          )
        }

        // Verify parent folder exists and doesn't create cycles
        const parent = await prisma.folder.findFirst({
          where: { id: body.parentId, userId },
        })
        if (!parent) {
          return NextResponse.json(
            { error: 'Parent folder not found' },
            { status: 404 }
          )
        }

        // Check for circular reference
        let currentParentId = parent.parentId
        while (currentParentId) {
          if (currentParentId === id) {
            return NextResponse.json(
              { error: 'Circular reference detected' },
              { status: 400 }
            )
          }
          const currentParent = await prisma.folder.findUnique({
            where: { id: currentParentId },
            select: { parentId: true },
          })
          currentParentId = currentParent?.parentId || null
        }

        updateData.parentId = body.parentId
      }
    }

    if (body.clientId !== undefined) {
      if (body.clientId === null || body.clientId === '') {
        updateData.clientId = null
      } else {
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

    const updated = await prisma.folder.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    })

    return NextResponse.json({ folder: updated })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/folders/[id] - Delete folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await requireAuth(request)
    const { id } = params

    const folder = await prisma.folder.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Check if folder has children or documents
    if (folder._count.children > 0 || folder._count.documents > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete folder with contents',
          hasChildren: folder._count.children > 0,
          hasDocuments: folder._count.documents > 0,
        },
        { status: 400 }
      )
    }

    await prisma.folder.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Folder deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

