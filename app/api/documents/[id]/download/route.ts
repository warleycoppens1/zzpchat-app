import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import fs from 'fs/promises'
import path from 'path'

// GET /api/documents/[id]/download - Download document file
export async function GET(
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

    const filePath = path.join(process.cwd(), 'public', document.filePath)

    try {
      const fileBuffer = await fs.readFile(filePath)

      // Update last accessed
      await prisma.document.update({
        where: { id },
        data: { lastAccessed: new Date() },
      })

      return new NextResponse(Buffer.from(fileBuffer), {
        headers: {
          'Content-Type': document.mimeType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(document.originalName)}"`,
          'Content-Length': document.fileSize.toString(),
        },
      })
    } catch (fileError) {
      console.error('Error reading file:', fileError)
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      )
    }
  } catch (error) {
    return handleApiError(error)
  }
}

