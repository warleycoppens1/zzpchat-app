/**
 * RAG Re-indexing API
 * Allows manual re-indexing of user data
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { ragIndexer } from '@/lib/rag/indexer'

// POST /api/rag/reindex - Re-index all user data
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)

    // Re-index all data in the background
    ragIndexer.indexAllUserData(userId).catch(error => {
      console.error(`Background re-indexing failed for user ${userId}:`, error)
    })

    return NextResponse.json({
      success: true,
      message: 'Re-indexing started in the background',
    })
  } catch (error: any) {
    console.error('Error starting re-index:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to start re-indexing' },
      { status: 500 }
    )
  }
}

