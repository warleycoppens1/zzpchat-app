import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { BrowserController } from '@/lib/browser-automation/browser-controller'
import { handleApiError } from '@/lib/errors'

interface BrowserAction {
  type: 'navigate' | 'click' | 'type' | 'screenshot' | 'extract' | 'wait' | 'select' | 'upload'
  selector?: string
  url?: string
  text?: string
  value?: string
  options?: string[]
  filePath?: string
  timeout?: number
}

// POST /api/ai/browser - Execute browser actions
export async function POST(request: NextRequest) {
  let browserController: BrowserController | null = null

  try {
    const { userId } = await requireAuth(request)
    const body = await request.json()

    const { action, actions, url } = body

    // Initialize browser controller
    browserController = new BrowserController()
    
    // If single action, convert to array
    const actionsToExecute: BrowserAction[] = action ? [action] : (actions || [])

    if (actionsToExecute.length === 0) {
      return NextResponse.json(
        { error: 'No actions provided' },
        { status: 400 }
      )
    }

    // If first action is navigate or we have a URL, add navigation
    if (url && (!actionsToExecute[0] || actionsToExecute[0].type !== 'navigate')) {
      actionsToExecute.unshift({
        type: 'navigate',
        url,
        timeout: 30000,
      })
    }

    // Execute actions
    const results = await browserController.executeSequence(actionsToExecute)

    // Take final screenshot if requested or if there were errors
    const hasErrors = results.some(r => !r.success)
    if (hasErrors || body.includeScreenshot) {
      const screenshotResult = await browserController.executeAction({
        type: 'screenshot',
        options: ['fullPage'],
      })
      
      if (screenshotResult.screenshot) {
        results[results.length - 1].screenshot = screenshotResult.screenshot
      }
    }

    // Clean up
    await browserController.close()

    return NextResponse.json({
      success: !hasErrors,
      results,
      summary: {
        total: results.length,
        succeeded: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    })
  } catch (error: any) {
    // Clean up on error
    if (browserController) {
      try {
        await browserController.close()
      } catch (closeError) {
        console.error('Error closing browser:', closeError)
      }
    }
    
    return handleApiError(error)
  }
}

// GET /api/ai/browser - Get browser automation status and capabilities
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)

    return NextResponse.json({
      available: true,
      capabilities: [
        'navigate',
        'click',
        'type',
        'screenshot',
        'extract',
        'wait',
        'select',
        'upload',
      ],
      message: 'Browser automation is available',
    })
  } catch (error) {
    return handleApiError(error)
  }
}

