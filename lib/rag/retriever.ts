/**
 * RAG Retriever Service
 * Retrieves relevant context for AI responses using vector search
 */

import { vectorStore, VectorSearchResult } from './vector-store'

export interface RetrievedContext {
  content: string
  sources: Array<{
    type: string
    id: string
    metadata: any
    similarity: number
  }>
}

export class RAGRetriever {
  /**
   * Retrieve relevant context for a query
   */
  async retrieveContext(
    userId: string,
    query: string,
    options: {
      entityTypes?: string[]
      maxResults?: number
      minSimilarity?: number
    } = {}
  ): Promise<RetrievedContext> {
    try {
      const results = await vectorStore.searchSimilar(userId, query, {
        entityTypes: options.entityTypes,
        limit: options.maxResults || 5,
        minSimilarity: options.minSimilarity || 0.7,
      })

      // Format context for AI
      const contextParts = results.map((result, index) => {
        const source = `${result.entityType}:${result.entityId}`
        return `[${index + 1}] ${result.content} (Bron: ${source}, Relevante: ${(result.similarity * 100).toFixed(1)}%)`
      })

      const content = contextParts.length > 0
        ? `RELEVANTE CONTEXT UIT JE DATA:\n${contextParts.join('\n\n')}`
        : ''

      return {
        content,
        sources: results.map(result => ({
          type: result.entityType,
          id: result.entityId,
          metadata: result.metadata,
          similarity: result.similarity,
        })),
      }
    } catch (error: any) {
      console.error('Error retrieving context:', error)
      // Return empty context on error (don't break the flow)
      return {
        content: '',
        sources: [],
      }
    }
  }

  /**
   * Smart retrieval based on query intent
   */
  async retrieveSmartContext(
    userId: string,
    query: string,
    intent?: string
  ): Promise<RetrievedContext> {
    // Determine relevant entity types based on intent or query
    let entityTypes: string[] | undefined

    const queryLower = query.toLowerCase()

    if (queryLower.includes('klant') || queryLower.includes('client') || queryLower.includes('customer')) {
      entityTypes = ['client']
    } else if (queryLower.includes('factuur') || queryLower.includes('invoice') || queryLower.includes('betal')) {
      entityTypes = ['invoice', 'client']
    } else if (queryLower.includes('offerte') || queryLower.includes('quote') || queryLower.includes('proposal')) {
      entityTypes = ['quote', 'client']
    } else if (queryLower.includes('project')) {
      entityTypes = ['project', 'client']
    } else if (queryLower.includes('vorig') || queryLower.includes('gesprek') || queryLower.includes('conversatie')) {
      entityTypes = ['conversation']
    }

    return this.retrieveContext(userId, query, {
      entityTypes,
      maxResults: 5,
      minSimilarity: 0.65, // Slightly lower threshold for broader results
    })
  }
}

// Export singleton
export const ragRetriever = new RAGRetriever()

