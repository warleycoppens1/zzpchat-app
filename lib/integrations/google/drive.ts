/**
 * Google Drive Integration Service
 * Handles Google Drive API operations
 */

import { BaseIntegration, IntegrationCredentials } from '../base'
import { google } from 'googleapis'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: number
  createdTime?: Date
  modifiedTime?: Date
  webViewLink?: string
  thumbnailLink?: string
  parents?: string[]
}

export interface DriveListOptions {
  pageSize?: number
  pageToken?: string
  query?: string
  folderId?: string
}

export class DriveService extends BaseIntegration {
  private oauth2Client: any
  private drive: any

  constructor(userId: string) {
    super(userId, 'GOOGLE_DRIVE')
  }

  /**
   * Initialize OAuth2 client
   */
  private async initializeClient(): Promise<void> {
    if (!this.credentials) {
      await this.load()
    }

    if (!this.credentials) {
      throw new Error('Google Drive not connected')
    }

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL || process.env.APP_URL}/api/integrations/google/callback`
    )

    const accessToken = await this.getValidAccessToken()
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: this.credentials.refreshToken
    })

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client })
  }

  /**
   * Refresh access token
   */
  protected async refreshAccessToken(): Promise<IntegrationCredentials> {
    if (!this.credentials?.refreshToken) {
      throw new Error('No refresh token available')
    }

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL || process.env.APP_URL}/api/integrations/google/callback`
    )

    this.oauth2Client.setCredentials({
      refresh_token: this.credentials.refreshToken
    })

    const { credentials } = await this.oauth2Client.refreshAccessToken()

    return {
      accessToken: credentials.access_token,
      refreshToken: this.credentials.refreshToken,
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
      scope: this.credentials.scope
    }
  }

  /**
   * List files
   */
  async listFiles(options: DriveListOptions = {}): Promise<{
    files: DriveFile[]
    nextPageToken?: string
  }> {
    await this.initializeClient()

    const queryParts: string[] = []
    if (options.folderId) {
      queryParts.push(`'${options.folderId}' in parents`)
    }
    if (options.query) {
      queryParts.push(options.query)
    }

    const response = await this.drive.files.list({
      pageSize: options.pageSize || 50,
      pageToken: options.pageToken,
      q: queryParts.join(' and ') || undefined,
      fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, parents)',
      orderBy: 'modifiedTime desc'
    })

    const files: DriveFile[] = (response.data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ? parseInt(file.size) : undefined,
      createdTime: file.createdTime ? new Date(file.createdTime) : undefined,
      modifiedTime: file.modifiedTime ? new Date(file.modifiedTime) : undefined,
      webViewLink: file.webViewLink,
      thumbnailLink: file.thumbnailLink,
      parents: file.parents
    }))

    return {
      files,
      nextPageToken: response.data.nextPageToken
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<DriveFile> {
    await this.initializeClient()

    const response = await this.drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, parents'
    })

    const file = response.data
    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ? parseInt(file.size) : undefined,
      createdTime: file.createdTime ? new Date(file.createdTime) : undefined,
      modifiedTime: file.modifiedTime ? new Date(file.modifiedTime) : undefined,
      webViewLink: file.webViewLink,
      thumbnailLink: file.thumbnailLink,
      parents: file.parents
    }
  }

  /**
   * Upload file
   */
  async uploadFile(
    name: string,
    mimeType: string,
    content: Buffer | string,
    parentFolderId?: string
  ): Promise<DriveFile> {
    await this.initializeClient()

    const fileMetadata: any = {
      name,
      mimeType
    }

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId]
    }

    const media = {
      mimeType,
      body: typeof content === 'string' ? Buffer.from(content) : content
    }

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, parents'
    })

    return {
      id: response.data.id!,
      name: response.data.name!,
      mimeType: response.data.mimeType!,
      size: response.data.size ? parseInt(response.data.size) : undefined,
      createdTime: response.data.createdTime ? new Date(response.data.createdTime) : undefined,
      modifiedTime: response.data.modifiedTime ? new Date(response.data.modifiedTime) : undefined,
      webViewLink: response.data.webViewLink,
      parents: response.data.parents
    }
  }

  /**
   * Download file
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    await this.initializeClient()

    const response = await this.drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'arraybuffer' })

    return Buffer.from(response.data)
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.initializeClient()

    await this.drive.files.delete({
      fileId
    })
  }

  /**
   * Create folder
   */
  async createFolder(name: string, parentFolderId?: string): Promise<DriveFile> {
    await this.initializeClient()

    const fileMetadata: any = {
      name,
      mimeType: 'application/vnd.google-apps.folder'
    }

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId]
    }

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, mimeType, createdTime, modifiedTime, webViewLink, parents'
    })

    return {
      id: response.data.id!,
      name: response.data.name!,
      mimeType: response.data.mimeType!,
      createdTime: response.data.createdTime ? new Date(response.data.createdTime) : undefined,
      modifiedTime: response.data.modifiedTime ? new Date(response.data.modifiedTime) : undefined,
      webViewLink: response.data.webViewLink,
      parents: response.data.parents
    }
  }

  /**
   * Search files
   */
  async searchFiles(query: string, maxResults: number = 10): Promise<DriveFile[]> {
    const result = await this.listFiles({
      query: `name contains '${query}'`,
      pageSize: maxResults
    })
    return result.files
  }
}

