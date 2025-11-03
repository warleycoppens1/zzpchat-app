import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'

// DELETE /api/conversations/delete-all - Delete all conversations for user
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    
    console.log('Deleting all conversations for user:', userId)
    
    // Get count before deletion
    const countBefore = await prisma.aI_Conversation.count({
      where: { userId }
    })
    
    // Get total conversations in database (for verification)
    const totalInDatabase = await prisma.aI_Conversation.count()
    
    console.log(`User ${userId} has ${countBefore} conversations`)
    console.log(`Total conversations in database: ${totalInDatabase}`)
    
    // Delete all conversations for the user only
    const result = await prisma.aI_Conversation.deleteMany({
      where: { userId }
    })
    
    // Verify only user's conversations were deleted
    const totalAfterDeletion = await prisma.aI_Conversation.count()
    const otherUsersConversations = totalAfterDeletion
    
    console.log(`Deleted ${result.count} conversations for user ${userId}`)
    console.log(`Remaining conversations in database: ${otherUsersConversations}`)
    console.log(`Other users' conversations preserved: ${totalInDatabase - result.count}`)
    
    return NextResponse.json({ 
      success: true,
      deletedCount: result.count,
      message: `Alle ${result.count} gesprekken zijn verwijderd`
    })
    
  } catch (error) {
    console.error('Error deleting all conversations:', error)
    return handleApiError(error)
  }
}
