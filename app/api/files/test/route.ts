import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { SubscriptionTier } from '@/lib/subscription-limits'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    
    return NextResponse.json({
      success: true,
      userId,
      testData: {
        files: [],
        storageInfo: {
          used: 0,
          usedFormatted: '0 Bytes',
          limit: 10 * 1024 * 1024,
          limitFormatted: '10 MB',
          usagePercentage: 0,
          tier: SubscriptionTier.FREE,
          filesUploaded: 0
        }
      }
    })
    
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 })
  }
}


