/**
 * Base Integration Class
 * Provides common functionality for all integrations
 */

import { prisma } from '../prisma'
import { decrypt, encrypt } from '../encryption'

export interface IntegrationCredentials {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  scope?: string[]
}

export interface IntegrationConfig {
  userId: string
  integrationType: string
  credentials: IntegrationCredentials
  settings?: Record<string, any>
}

export abstract class BaseIntegration {
  protected userId: string
  protected integrationType: string
  protected credentials: IntegrationCredentials | null = null
  protected settings: Record<string, any> = {}

  constructor(userId: string, integrationType: string) {
    this.userId = userId
    this.integrationType = integrationType
  }

  /**
   * Load integration from database
   */
  async load(): Promise<void> {
    const integration = await prisma.integration.findUnique({
      where: {
        type_userId: {
          type: this.integrationType as any,
          userId: this.userId
        }
      }
    })

    if (!integration || integration.status !== 'CONNECTED') {
      throw new Error(`Integration ${this.integrationType} not found or not connected`)
    }

    // Decrypt credentials
    try {
      const decryptedCredentials = decrypt(integration.credentials)
      this.credentials = JSON.parse(decryptedCredentials)
      
      if (this.credentials && integration.refreshToken) {
        this.credentials.refreshToken = decrypt(integration.refreshToken)
      }
      
      if (this.credentials && integration.expiresAt) {
        this.credentials.expiresAt = integration.expiresAt
      }

      if (this.credentials) {
        this.credentials.scope = integration.scope || []
      }
      this.settings = (integration.settings as Record<string, any>) || {}
    } catch (error) {
      throw new Error(`Failed to decrypt credentials: ${error}`)
    }
  }

  /**
   * Save integration to database
   */
  protected async save(credentials: IntegrationCredentials, settings?: Record<string, any>): Promise<void> {
    // Encrypt credentials
    const encryptedCredentials = encrypt(JSON.stringify({
      accessToken: credentials.accessToken,
      expiresAt: credentials.expiresAt
    }))

    const encryptedRefreshToken = credentials.refreshToken
      ? encrypt(credentials.refreshToken)
      : null

    await prisma.integration.upsert({
      where: {
        type_userId: {
          type: this.integrationType as any,
          userId: this.userId
        }
      },
      create: {
        type: this.integrationType as any,
        userId: this.userId,
        credentials: encryptedCredentials,
        refreshToken: encryptedRefreshToken,
        scope: credentials.scope || [],
        expiresAt: credentials.expiresAt,
        status: 'CONNECTED',
        connectedAt: new Date(),
        settings: settings || {}
      },
      update: {
        credentials: encryptedCredentials,
        refreshToken: encryptedRefreshToken,
        scope: credentials.scope || [],
        expiresAt: credentials.expiresAt,
        status: 'CONNECTED',
        settings: settings || {}
      }
    })

    this.credentials = credentials
    this.settings = settings || {}
  }

  /**
   * Check if token is expired
   */
  protected isTokenExpired(): boolean {
    if (!this.credentials?.expiresAt) {
      return false // No expiration set, assume valid
    }
    return new Date() >= this.credentials.expiresAt
  }

  /**
   * Refresh access token (must be implemented by subclasses)
   */
  protected abstract refreshAccessToken(): Promise<IntegrationCredentials>

  /**
   * Get valid access token (refreshes if needed)
   */
  protected async getValidAccessToken(): Promise<string> {
    if (!this.credentials) {
      await this.load()
    }

    if (!this.credentials) {
      throw new Error('No credentials available')
    }

    // Check if token needs refresh
    if (this.isTokenExpired() && this.credentials.refreshToken) {
      this.credentials = await this.refreshAccessToken()
      await this.save(this.credentials)
    }

    return this.credentials.accessToken
  }

  /**
   * Update settings
   */
  async updateSettings(settings: Record<string, any>): Promise<void> {
    await prisma.integration.update({
      where: {
        type_userId: {
          type: this.integrationType as any,
          userId: this.userId
        }
      },
      data: {
        settings: { ...this.settings, ...settings }
      }
    })

    this.settings = { ...this.settings, ...settings }
  }

  /**
   * Disconnect integration
   */
  async disconnect(): Promise<void> {
    await prisma.integration.update({
      where: {
        type_userId: {
          type: this.integrationType as any,
          userId: this.userId
        }
      },
      data: {
        status: 'DISCONNECTED',
        credentials: '',
        refreshToken: null,
      }
    })

    this.credentials = null
  }

  /**
   * Get integration status
   */
  async getStatus(): Promise<{
    connected: boolean
    expiresAt?: Date
    lastSync?: Date
    error?: string
  }> {
    const integration = await prisma.integration.findUnique({
      where: {
        type_userId: {
          type: this.integrationType as any,
          userId: this.userId
        }
      },
      select: {
        status: true,
        expiresAt: true,
        lastSync: true,
        lastError: true
      }
    })

    if (!integration) {
      return { connected: false }
    }

    return {
      connected: integration.status === 'CONNECTED',
      expiresAt: integration.expiresAt || undefined,
      lastSync: integration.lastSync || undefined,
      error: integration.lastError || undefined
    }
  }
}

