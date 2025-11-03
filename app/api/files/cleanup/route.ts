import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    
    // Get all user files
    const userFiles = await prisma.userFile.findMany({
      where: { userId },
      select: {
        id: true,
        originalName: true,
        filePath: true,
        uploadedAt: true,
        processed: true
      },
      orderBy: { uploadedAt: 'desc' }
    })

    console.log(`Found ${userFiles.length} files for user ${userId}`)

    // Delete all user files from database
    const deleteResult = await prisma.userFile.deleteMany({
      where: { userId }
    })

    console.log(`Deleted ${deleteResult.count} file records from database`)

    // Delete physical files
    let deletedFiles = 0
    for (const file of userFiles) {
      try {
        if (file.filePath) {
          // Convert stored path (/uploads/user-files/filename) to actual filesystem path
          const actualPath = file.filePath.startsWith('/')
            ? path.join(process.cwd(), file.filePath.slice(1))
            : path.join(process.cwd(), file.filePath)
          
          await fs.unlink(actualPath)
          deletedFiles++
          console.log(`Deleted physical file: ${file.originalName}`)
        }
      } catch (error) {
        // Log error but continue - file may already be deleted
        console.error(`Failed to delete physical file ${file.originalName}:`, error)
      }
    }

    // Reset user file counters
    await prisma.user.update({
      where: { id: userId },
      data: {
        filesUploaded: 0,
        storageUsed: 0
      }
    })

    console.log(`Reset file counters for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Files cleaned up successfully',
      deleted: {
        database: deleteResult.count,
        physical: deletedFiles
      }
    })

  } catch (error) {
    console.error('File cleanup error:', error)
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    
    // Get user file info
    const userFiles = await prisma.userFile.findMany({
      where: { userId },
      select: {
        id: true,
        originalName: true,
        fileSize: true,
        mimeType: true,
        uploadedAt: true,
        processed: true
      },
      orderBy: { uploadedAt: 'desc' }
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        filesUploaded: true,
        storageUsed: true,
        subscriptionTier: true
      }
    })

    return NextResponse.json({
      success: true,
      files: userFiles,
      user: user,
      totals: {
        files: userFiles.length,
        totalSize: userFiles.reduce((sum, file) => sum + (file.fileSize || 0), 0)
      }
    })

  } catch (error) {
    console.error('File info error:', error)
    return handleApiError(error)
  }
}


