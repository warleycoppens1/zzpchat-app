import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import fs from 'fs/promises'
import path from 'path'

// POST /api/documents/export - Export multiple documents as ZIP (or individual downloads)
// For now, we'll export as a JSON list and let the client download files individually
// In production, use a proper ZIP library like archiver or adm-zip
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()
    const { documentIds } = body

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'Document IDs required' },
        { status: 400 }
      )
    }

    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
        userId,
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        filePath: true,
        fileSize: true,
      },
    })

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents found' },
        { status: 404 }
      )
    }

    // For now, return a JSON list of download URLs
    // The frontend can handle downloading multiple files
    // In production, implement proper ZIP creation on server
    const downloadLinks = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      originalName: doc.originalName,
      downloadUrl: `/api/documents/${doc.id}/download`,
      size: doc.fileSize,
    }))

    return NextResponse.json({
      message: 'Export ready',
      documents: downloadLinks,
      // For single document, redirect to download
      ...(documents.length === 1 && {
        redirectUrl: downloadLinks[0].downloadUrl,
      }),
    })
  } catch (error) {
    console.error('Error exporting documents:', error)
    return handleApiError(error)
  }
}

