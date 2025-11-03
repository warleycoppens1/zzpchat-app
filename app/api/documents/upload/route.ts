import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'documents')

async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create upload directory:', error)
    throw new Error('Failed to prepare upload directory')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    await ensureUploadDir()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folderId = formData.get('folderId')?.toString()
    const clientId = formData.get('clientId')?.toString()
    const name = formData.get('name')?.toString()
    const description = formData.get('description')?.toString()
    const tags = formData.get('tags')?.toString()?.split(',').filter(Boolean) || []

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Verify folder if provided
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

    const fileExtension = path.extname(file.name)
    const uniqueFilename = `${uuidv4()}${fileExtension}`
    const filePath = path.join(UPLOAD_DIR, uniqueFilename)
    const publicPath = `/uploads/documents/${uniqueFilename}`

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    // Detect MIME type
    let detectedMimeType = file.type
    if (!detectedMimeType || detectedMimeType === 'application/octet-stream') {
      const ext = fileExtension.toLowerCase()
      const mimeTypeMap: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
      }
      if (mimeTypeMap[ext]) {
        detectedMimeType = mimeTypeMap[ext]
      }
    }

    const document = await prisma.document.create({
      data: {
        name: name || file.name,
        description: description || null,
        filename: uniqueFilename,
        originalName: file.name,
        fileSize: file.size,
        mimeType: detectedMimeType,
        filePath: publicPath,
        folderId: folderId || null,
        clientId: clientId || null,
        tags,
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
        storageUsed: { increment: file.size },
      },
    })

    return NextResponse.json(
      {
        message: 'Document uploaded successfully',
        document: {
          ...document,
          fileSizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error uploading document:', error)
    return handleApiError(error)
  }
}

