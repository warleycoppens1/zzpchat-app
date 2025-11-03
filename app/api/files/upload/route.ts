import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { canUploadFile, canUploadFileAccurate } from '@/lib/subscription-limits'
import { SubscriptionTier } from '@/lib/subscription-limits'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'user-files')

// Ensure upload directory exists
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

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Ensure user has a valid subscription tier
    const userTier = (user.subscriptionTier as SubscriptionTier) || SubscriptionTier.FREE
    
    console.log('User tier:', userTier)
    console.log('User storage:', user.storageUsed || 0)
    console.log('File size:', file.size)
    console.log('Files uploaded:', user.filesUploaded || 0)

    // Check subscription limits using accurate database count
    const uploadCheck = await canUploadFileAccurate(
      userId,
      userTier,
      file.size,
      prisma
    )

    console.log('Upload check result:', uploadCheck)

    if (!uploadCheck.allowed) {
      return NextResponse.json({ 
        error: uploadCheck.reason,
        currentCount: uploadCheck.currentCount,
        limit: uploadCheck.limit
      }, { status: 400 })
    }

    const fileExtension = path.extname(file.name)
    const uniqueFilename = `${uuidv4()}${fileExtension}`
    const filePath = path.join(UPLOAD_DIR, uniqueFilename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    // Improve MIME type detection - fallback to extension-based detection
    let detectedMimeType = file.type
    
    // If MIME type is generic or missing, try to detect from extension
    if (!detectedMimeType || detectedMimeType === 'application/octet-stream') {
      const ext = fileExtension.toLowerCase()
      const mimeTypeMap: Record<string, string> = {
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.json': 'application/json',
      }
      
      if (mimeTypeMap[ext]) {
        detectedMimeType = mimeTypeMap[ext]
      }
    }

    const newFile = await prisma.userFile.create({
      data: {
        userId,
        filename: uniqueFilename,
        originalName: file.name,
        fileSize: file.size,
        mimeType: detectedMimeType || file.type,
        filePath: `/uploads/user-files/${uniqueFilename}`,
      },
    })

    // Update user's storage usage
    await prisma.user.update({
      where: { id: userId },
      data: {
        storageUsed: {
          increment: file.size,
        },
        filesUploaded: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: {
        id: newFile.id,
        originalName: newFile.originalName,
        mimeType: newFile.mimeType || detectedMimeType || file.type || 'application/octet-stream',
        fileSize: newFile.fileSize,
        fileSizeFormatted: `${(newFile.fileSize / (1024 * 1024)).toFixed(2)} MB`,
        uploadedAt: newFile.uploadedAt,
      },
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading file:', error)
    return handleApiError(error)
  }
}