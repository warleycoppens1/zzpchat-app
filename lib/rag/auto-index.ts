/**
 * Auto-Indexing Hooks
 * Automatically indexes data when it's created or updated
 */

import { ragIndexer } from './indexer'

/**
 * Auto-index when client is created/updated
 */
export async function autoIndexClient(userId: string, clientId: string): Promise<void> {
  try {
    await ragIndexer.indexClient(userId, clientId)
  } catch (error) {
    console.error(`Auto-index failed for client ${clientId}:`, error)
    // Don't throw - indexing failures shouldn't break the main flow
  }
}

/**
 * Auto-index when invoice is created/updated
 */
export async function autoIndexInvoice(userId: string, invoiceId: string): Promise<void> {
  try {
    await ragIndexer.indexInvoice(userId, invoiceId)
  } catch (error) {
    console.error(`Auto-index failed for invoice ${invoiceId}:`, error)
  }
}

/**
 * Auto-index when quote is created/updated
 */
export async function autoIndexQuote(userId: string, quoteId: string): Promise<void> {
  try {
    await ragIndexer.indexQuote(userId, quoteId)
  } catch (error) {
    console.error(`Auto-index failed for quote ${quoteId}:`, error)
  }
}

/**
 * Auto-index when project is created/updated
 */
export async function autoIndexProject(userId: string, projectId: string): Promise<void> {
  try {
    await ragIndexer.indexProject(userId, projectId)
  } catch (error) {
    console.error(`Auto-index failed for project ${projectId}:`, error)
  }
}

/**
 * Auto-index when conversation is completed
 */
export async function autoIndexConversation(userId: string, conversationId: string): Promise<void> {
  try {
    await ragIndexer.indexConversation(userId, conversationId)
  } catch (error) {
    console.error(`Auto-index failed for conversation ${conversationId}:`, error)
  }
}

