import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'

// POST /api/conversations/cleanup - Remove duplicate conversations
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    
    console.log('Starting conversation cleanup for user:', userId)
    
    // Get all conversations for the user
    const conversations = await prisma.aI_Conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`Found ${conversations.length} conversations`)
    
    // Group conversations by content hash
    const conversationGroups = new Map<string, any[]>()
    
    conversations.forEach(conv => {
      const hash = `${conv.userMessage?.slice(0, 50)}_${conv.aiResponse?.slice(0, 50)}`
      if (!conversationGroups.has(hash)) {
        conversationGroups.set(hash, [])
      }
      conversationGroups.get(hash)!.push(conv)
    })
    
    console.log(`Found ${conversationGroups.size} unique conversation groups`)
    
    let deletedCount = 0
    
    // For each group, keep only the most recent conversation
    const deletePromises: Promise<void>[] = []
    Array.from(conversationGroups.entries()).forEach(([hash, group]) => {
      if (group.length > 1) {
        // Sort by createdAt descending (newest first)
        group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        // Keep the first (newest) one, delete the rest
        const toDelete = group.slice(1)
        
        for (const conv of toDelete) {
          deletePromises.push(
            prisma.aI_Conversation.delete({
              where: { id: conv.id }
            }).then(() => {
              deletedCount++
            })
          )
        }
        
        console.log(`Deleted ${toDelete.length} duplicates for hash: ${hash.slice(0, 20)}...`)
      }
    })
    
    await Promise.all(deletePromises)
    
    console.log(`Cleanup complete. Deleted ${deletedCount} duplicate conversations`)
    
    return NextResponse.json({ 
      success: true,
      deletedCount,
      originalCount: conversations.length,
      uniqueCount: conversations.length - deletedCount
    })
    
  } catch (error) {
    console.error('Error in conversation cleanup:', error)
    return handleApiError(error)
  }
}
