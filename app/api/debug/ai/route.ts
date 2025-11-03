import { NextRequest, NextResponse } from 'next/server'
import { aiAgentService } from '@/lib/ai-agent'

export async function POST(request: NextRequest) {
  try {
    const { message, userId = 'dashboard-user' } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Test intent analysis
    const intentAnalysis = await aiAgentService.analyzeIntent(message)
    
    // Test file search
    const userFiles = await aiAgentService.getUserFiles(userId)
    
    // Test file search for specific terms
    const searchResults = await aiAgentService.searchUserFiles(userId, 'brief')
    
    return NextResponse.json({
      success: true,
      debug: {
        message,
        intentAnalysis,
        userFiles: userFiles.map(f => ({
          id: f.id,
          originalName: f.originalName,
          mimeType: f.mimeType,
          processed: f.processed
        })),
        searchResults: searchResults.map(f => ({
          id: f.id,
          originalName: f.originalName,
          mimeType: f.mimeType
        }))
      }
    })

  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    )
  }
}


