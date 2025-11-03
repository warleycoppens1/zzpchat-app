import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'
import { autoIndexConversation } from '@/lib/rag/auto-index'
import { z } from 'zod'

const createConversationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  userMessage: z.string().min(1, 'User message is required'),
  aiResponse: z.string().min(1, 'AI response is required'),
})

// GET /api/conversations - Get all conversations for user
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/conversations called')
    
    // Try to get auth, but don't fail if not authenticated
    let userId: string | null = null
    try {
      const auth = await requireAuth(request)
      userId = auth.userId
      console.log('Authenticated user ID:', userId)
    } catch (authError) {
      console.log('Auth failed, trying without auth:', authError)
      // Continue without auth for testing
    }

    let conversations
    if (userId) {
      conversations = await prisma.aI_Conversation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    } else {
      // Get all conversations for testing
      conversations = await prisma.aI_Conversation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    }

    console.log('Found conversations:', conversations.length)
    return NextResponse.json({ 
      conversations,
      debug: {
        userId,
        totalCount: conversations.length
      }
    })
  } catch (error) {
    console.error('Error in GET /api/conversations:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      conversations: []
    }, { status: 500 })
  }
}

// POST /api/conversations - Create new conversation
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/conversations called')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    // Try to get auth, but use fallback if not available
    let userId = 'test-user-id' // Fallback for testing
    try {
      const auth = await requireAuth(request)
      userId = auth.userId
      console.log('Authenticated user ID:', userId)
    } catch (authError) {
      console.log('Auth failed, using test user:', authError)
    }
    
    // Simple validation
    if (!body.userMessage || !body.aiResponse) {
      return NextResponse.json({ 
        error: 'userMessage and aiResponse are required' 
      }, { status: 400 })
    }

    // Create hash to check for duplicates (check full content, not just first 100 chars)
    const createHash = (userMsg: string, aiMsg: string) => {
      // Use full messages for more accurate duplicate detection
      const userHash = userMsg.trim()
      const aiHash = (aiMsg || '').trim().slice(0, 200) // Limit AI response to 200 chars for hash
      return `${userHash}_${aiHash}`
    }
    
    const hash = createHash(body.userMessage, body.aiResponse)
    
    // Check for existing conversation with same content within last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    const existingConversations = await prisma.aI_Conversation.findMany({
      where: {
        userId,
        createdAt: {
          gte: tenMinutesAgo
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Check more recent conversations
    })
    
    // Check if any existing conversation matches this hash (exact match on user message)
    for (const existing of existingConversations) {
      // First check exact user message match
      if (existing.userMessage.trim() === body.userMessage.trim()) {
        // Then check if AI response is similar (first 200 chars)
        const existingAiStart = (existing.aiResponse || '').trim().slice(0, 200)
        const newAiStart = (body.aiResponse || '').trim().slice(0, 200)
        
        if (existingAiStart === newAiStart || existingAiStart.length === 0) {
          console.log('Duplicate conversation detected (exact user message match), skipping save')
          return NextResponse.json({ 
            conversation: existing,
            success: true,
            duplicate: true
          }, { status: 200 })
        }
      }
      
      // Fallback: check hash
      const existingHash = createHash(existing.userMessage, existing.aiResponse || '')
      if (existingHash === hash) {
        console.log('Duplicate conversation detected (hash match), skipping save')
        return NextResponse.json({ 
          conversation: existing,
          success: true,
          duplicate: true
        }, { status: 200 })
      }
    }

    const conversation = await prisma.aI_Conversation.create({
      data: {
        userId,
        userMessage: body.userMessage,
        aiResponse: body.aiResponse,
        actionData: {
          title: body.title || 'Test Gesprek',
        },
        status: 'COMPLETED'
      }
    })

    console.log('Created conversation:', conversation.id)
    
    // Auto-index for RAG (only if conversation is completed)
    if (conversation.status === 'COMPLETED') {
      autoIndexConversation(userId, conversation.id).catch(err => 
        console.error('Failed to auto-index conversation:', err)
      )
    }
    
    return NextResponse.json({ 
      conversation,
      success: true 
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/conversations:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 })
  }
}