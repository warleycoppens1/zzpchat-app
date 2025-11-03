/**
 * Browser Automation Controller
 * Safe browser automation using Puppeteer for AI assistant
 */

import puppeteer, { Browser, Page } from 'puppeteer'

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

interface BrowserResult {
  success: boolean
  data?: any
  screenshot?: string
  error?: string
  url?: string
}

// Allowed domains for security (can be configured per user)
const DEFAULT_ALLOWED_DOMAINS = [
  'google.com',
  'microsoft.com',
  'linkedin.com',
  'github.com',
  'stackoverflow.com',
  'belastingdienst.nl',
  'kvk.nl',
  'mollie.com',
  'stripe.com',
  // Add more trusted domains as needed
]

export class BrowserController {
  private browser: Browser | null = null
  private page: Page | null = null
  private allowedDomains: string[] = DEFAULT_ALLOWED_DOMAINS

  constructor(allowedDomains?: string[]) {
    if (allowedDomains) {
      this.allowedDomains = allowedDomains
    }
  }

  async initialize(): Promise<void> {
    if (this.browser) {
      return
    }

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    })
  }

  async createPage(): Promise<Page> {
    await this.initialize()
    
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    this.page = await this.browser.newPage()
    
    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 })
    
    // Set user agent
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    return this.page
  }

  private isDomainAllowed(url: string): boolean {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      const hostname = urlObj.hostname.replace('www.', '')
      
      return this.allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      )
    } catch {
      return false
    }
  }

  async executeAction(action: BrowserAction): Promise<BrowserResult> {
    try {
      if (!this.page) {
        await this.createPage()
      }

      if (!this.page) {
        throw new Error('Failed to create page')
      }

      const result: BrowserResult = {
        success: true,
        url: this.page.url(),
      }

      switch (action.type) {
        case 'navigate':
          if (!action.url) {
            throw new Error('URL is required for navigate action')
          }
          
          // Check if domain is allowed
          if (!this.isDomainAllowed(action.url)) {
            throw new Error(`Domain not allowed: ${action.url}. Please request access for this domain.`)
          }

          await this.page.goto(action.url, {
            waitUntil: 'networkidle2',
            timeout: action.timeout || 30000,
          })
          
          result.url = this.page.url()
          result.data = { message: `Navigated to ${action.url}` }
          break

        case 'click':
          if (!action.selector) {
            throw new Error('Selector is required for click action')
          }
          
          await this.page.waitForSelector(action.selector, { timeout: action.timeout || 10000 })
          await this.page.click(action.selector)
          
          // Wait a bit for any resulting navigation or DOM changes
          await this.page.waitForTimeout(1000)
          
          result.data = { message: `Clicked element: ${action.selector}` }
          result.url = this.page.url()
          break

        case 'type':
          if (!action.selector || !action.text) {
            throw new Error('Selector and text are required for type action')
          }
          
          await this.page.waitForSelector(action.selector, { timeout: action.timeout || 10000 })
          await this.page.click(action.selector, { clickCount: 3 }) // Select all existing text
          await this.page.type(action.selector, action.text, { delay: 50 })
          
          result.data = { message: `Typed text into: ${action.selector}` }
          break

        case 'screenshot':
          const screenshot = await this.page.screenshot({
            type: 'png',
            fullPage: action.options?.includes('fullPage') || false,
          })
          
          result.screenshot = `data:image/png;base64,${screenshot.toString('base64')}`
          result.data = { message: 'Screenshot captured' }
          break

        case 'extract':
          if (!action.selector) {
            throw new Error('Selector is required for extract action')
          }
          
          await this.page.waitForSelector(action.selector, { timeout: action.timeout || 10000 })
          
          const extracted = await this.page.evaluate((sel) => {
            const elements = document.querySelectorAll(sel)
            return Array.from(elements).map((el: any) => ({
              text: el.innerText || el.textContent,
              html: el.innerHTML,
              value: el.value,
              href: el.href,
            }))
          }, action.selector)
          
          result.data = { extracted }
          break

        case 'wait':
          await this.page.waitForTimeout(action.timeout || 2000)
          result.data = { message: 'Waited' }
          break

        case 'select':
          if (!action.selector || !action.value) {
            throw new Error('Selector and value are required for select action')
          }
          
          await this.page.waitForSelector(action.selector, { timeout: action.timeout || 10000 })
          await this.page.select(action.selector, action.value)
          
          result.data = { message: `Selected ${action.value} in ${action.selector}` }
          break

        case 'upload':
          if (!action.selector || !action.filePath) {
            throw new Error('Selector and filePath are required for upload action')
          }
          
          const fileInput = await this.page.$(action.selector)
          if (!fileInput) {
            throw new Error(`File input not found: ${action.selector}`)
          }
          
          await fileInput.uploadFile(action.filePath)
          result.data = { message: `Uploaded file: ${action.filePath}` }
          break

        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }

      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Browser action failed',
        url: this.page?.url(),
      }
    }
  }

  async executeSequence(actions: BrowserAction[]): Promise<BrowserResult[]> {
    const results: BrowserResult[] = []
    
    for (const action of actions) {
      const result = await this.executeAction(action)
      results.push(result)
      
      // Stop if an action failed
      if (!result.success) {
        break
      }
    }
    
    return results
  }

  async getPageContent(): Promise<string> {
    if (!this.page) {
      throw new Error('No page available')
    }
    
    return await this.page.content()
  }

  async getPageText(): Promise<string> {
    if (!this.page) {
      throw new Error('No page available')
    }
    
    return await this.page.evaluate(() => document.body.innerText)
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close()
      this.page = null
    }
    
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

