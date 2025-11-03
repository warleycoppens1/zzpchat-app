import { NextRequest, NextResponse } from 'next/server'
import { AutomationEngine } from '@/lib/automation-engine'

// Cron endpoint for running scheduled automations
// Configure in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/run-automations",
//     "schedule": "* * * * *"
//   }]
// }
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Running scheduled automations...')
    await AutomationEngine.runScheduledAutomations()

    return NextResponse.json({ 
      success: true,
      message: 'Automations executed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error running automations:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

