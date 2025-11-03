import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Test endpoint to check if everything works
export async function GET(request: NextRequest) {
  try {
    console.log('Test endpoint called')
    
    // Test database connection
    const conversations = await prisma.aI_Conversation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('Found conversations:', conversations.length)
    
    return NextResponse.json({ 
      success: true, 
      conversationCount: conversations.length,
      conversations: conversations.map(c => ({
        id: c.id,
        userId: c.userId,
        userMessage: c.userMessage?.slice(0, 50) + '...',
        aiResponse: c.aiResponse?.slice(0, 50) + '...',
        createdAt: c.createdAt
      }))
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}


