import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { formatBytes, getSubscriptionLimits } from '@/lib/subscription-limits'
import { SubscriptionTier } from '@/lib/subscription-limits'
import fs from 'fs/promises'
import path from 'path'

// GET /api/files - Get all files for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    
    // Get user files
    const files = await prisma.userFile.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        filename: true,
        originalName: true,
        fileSize: true,
        mimeType: true,
        uploadedAt: true,
        lastAccessed: true,
        processed: true
      }
    })
    
    // Get user storage info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        storageUsed: true,
        subscriptionTier: true,
        filesUploaded: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const limits = getSubscriptionLimits(user.subscriptionTier as SubscriptionTier)
    
    return NextResponse.json({
      files: files.map(file => ({
        ...file,
        fileSizeFormatted: formatBytes(file.fileSize)
      })),
      storageInfo: {
        used: user.storageUsed || 0,
        usedFormatted: formatBytes(user.storageUsed || 0),
        limit: limits.storageLimit,
        limitFormatted: formatBytes(limits.storageLimit),
        usagePercentage: Math.round(((user.storageUsed || 0) / limits.storageLimit) * 100),
        tier: user.subscriptionTier,
        filesUploaded: user.filesUploaded || 0
      }
    })
    
  } catch (error) {
    console.error('Error fetching files:', error)
    return handleApiError(error)
  }
}

// DELETE /api/files - Delete a specific file
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }
    
    // Get file info before deletion
    const file = await prisma.userFile.findFirst({
      where: { 
        id: fileId,
        userId // Ensure user owns the file
      },
      select: {
        id: true,
        filename: true,
        originalName: true,
        filePath: true,
        fileSize: true
      }
    })
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    // Delete file from database
    await prisma.userFile.delete({
      where: { id: fileId }
    })
    
    // Update user storage usage
    await prisma.user.update({
      where: { id: userId },
      data: {
        storageUsed: {
          decrement: file.fileSize
        },
        filesUploaded: {
          decrement: 1
        }
      }
    })
    
    // Delete physical file from disk
    if (file.filePath) {
      try {
        // Convert stored path (/uploads/user-files/filename) to actual filesystem path
        const actualPath = file.filePath.startsWith('/')
          ? path.join(process.cwd(), file.filePath.slice(1))
          : path.join(process.cwd(), 'uploads', 'user-files', file.filename)
        
        await fs.unlink(actualPath)
        console.log(`Deleted physical file: ${file.originalName}`)
      } catch (error) {
        // Log error but don't fail the request - file is already deleted from DB
        console.error(`Failed to delete physical file ${file.originalName}:`, error)
      }
    }
    
    console.log(`File deleted: ${file.originalName} by user ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting file:', error)
    return handleApiError(error)
  }
}


