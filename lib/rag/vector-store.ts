/**
 * Vector Store Service
 * Stores and retrieves vector embeddings from the database
 */

import { prisma } from '@/lib/prisma'
import { embeddingService, EmbeddingResult } from './embedding-service'

export interface VectorStoreDocument {
  entityType: string
  entityId: string
  content: string
  metadata?: Record<string, any>
}

export interface VectorSearchResult {
  id: string
  entityType: string
  entityId: string
  content: string
  metadata: any
  similarity: number
}

export class VectorStore {
  /**
   * Store embedding for a document
   */
  async storeEmbedding(
    userId: string,
    document: VectorStoreDocument,
    chunkIndex: number = 0
  ): Promise<void> {
    try {
      // Generate embedding
      const { embedding } = await embeddingService.generateEmbedding(document.content)

      // Store in database
      await prisma.vectorEmbedding.upsert({
        where: {
          entityType_entityId_chunkIndex: {
            entityType: document.entityType,
            entityId: document.entityId,
            chunkIndex,
          },
        },
        create: {
          userId,
          entityType: document.entityType,
          entityId: document.entityId,
          content: document.content,
          embeddingJson: embedding, // Store as JSON (will be converted to vector if pgvector is available)
          metadata: document.metadata || {},
          chunkIndex,
        },
        update: {
          content: document.content,
          embeddingJson: embedding,
          metadata: document.metadata || {},
        },
      })
    } catch (error: any) {
      console.error(`Error storing embedding for ${document.entityType}:${document.entityId}:`, error)
      throw error
    }
  }

  /**
   * Store multiple embeddings (batch)
   */
  async storeEmbeddings(
    userId: string,
    documents: VectorStoreDocument[]
  ): Promise<void> {
    // For now, process sequentially to avoid overwhelming the API
    // In production, you might want to batch this more efficiently
    for (const doc of documents) {
      try {
        await this.storeEmbedding(userId, doc)
      } catch (error) {
        console.error(`Failed to store embedding for ${doc.entityType}:${doc.entityId}:`, error)
        // Continue with other documents
      }
    }
  }

  /**
   * Search for similar documents using vector similarity
   */
  async searchSimilar(
    userId: string,
    queryText: string,
    options: {
      entityTypes?: string[]
      limit?: number
      minSimilarity?: number
    } = {}
  ): Promise<VectorSearchResult[]> {
    const { entityTypes, limit = 5, minSimilarity = 0.7 } = options

    try {
      // Generate embedding for query
      const { embedding: queryEmbedding } = await embeddingService.generateEmbedding(queryText)

      // Get all embeddings for this user (filtered by entity types if provided)
      const where: any = { userId }
      if (entityTypes && entityTypes.length > 0) {
        where.entityType = { in: entityTypes }
      }

      const embeddings = await prisma.vectorEmbedding.findMany({
        where,
        select: {
          id: true,
          entityType: true,
          entityId: true,
          content: true,
          metadata: true,
          embeddingJson: true,
        },
      })

      // Calculate similarity for each embedding
      const results: VectorSearchResult[] = []

      for (const emb of embeddings) {
        if (!emb.embeddingJson || !Array.isArray(emb.embeddingJson)) {
          continue
        }

        const similarity = embeddingService.cosineSimilarity(
          queryEmbedding,
          emb.embeddingJson as number[]
        )

        if (similarity >= minSimilarity) {
          results.push({
            id: emb.id,
            entityType: emb.entityType,
            entityId: emb.entityId,
            content: emb.content,
            metadata: emb.metadata || {},
            similarity,
          })
        }
      }

      // Sort by similarity (highest first) and limit
      results.sort((a, b) => b.similarity - a.similarity)
      return results.slice(0, limit)
    } catch (error: any) {
      console.error('Error in vector search:', error)
      throw error
    }
  }

  /**
   * Delete embeddings for an entity
   */
  async deleteEmbeddings(
    userId: string,
    entityType: string,
    entityId: string
  ): Promise<void> {
    try {
      await prisma.vectorEmbedding.deleteMany({
        where: {
          userId,
          entityType,
          entityId,
        },
      })
    } catch (error: any) {
      console.error(`Error deleting embeddings for ${entityType}:${entityId}:`, error)
      throw error
    }
  }

  /**
   * Check if entity is already indexed
   */
  async isIndexed(
    userId: string,
    entityType: string,
    entityId: string
  ): Promise<boolean> {
    const count = await prisma.vectorEmbedding.count({
      where: {
        userId,
        entityType,
        entityId,
      },
    })
    return count > 0
  }
}

// Export singleton
export const vectorStore = new VectorStore()

