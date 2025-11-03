/**
 * Embedding Service
 * Generates vector embeddings using OpenAI's text-embedding-3-small model
 */

const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

export interface EmbeddingResult {
  embedding: number[]
  tokenCount?: number
}

export class EmbeddingService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
    if (!this.apiKey) {
      console.warn('OpenAI API key not found - embeddings will fail')
    }
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty')
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OPENAI_EMBEDDING_MODEL,
          input: text.trim(),
          dimensions: EMBEDDING_DIMENSIONS,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenAI embedding API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      const embedding = data.data[0]?.embedding

      if (!embedding || !Array.isArray(embedding)) {
        throw new Error('Invalid embedding response from OpenAI')
      }

      return {
        embedding,
        tokenCount: data.usage?.total_tokens,
      }
    } catch (error: any) {
      console.error('Error generating embedding:', error)
      throw new Error(`Failed to generate embedding: ${error.message}`)
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    if (texts.length === 0) {
      return []
    }

    // OpenAI allows up to 2048 inputs per request, but we'll batch in smaller chunks
    const batchSize = 100
    const results: EmbeddingResult[] = []

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      const validBatch = batch.filter(text => text && text.trim().length > 0)

      if (validBatch.length === 0) {
        continue
      }

      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: OPENAI_EMBEDDING_MODEL,
            input: validBatch.map(t => t.trim()),
            dimensions: EMBEDDING_DIMENSIONS,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Batch embedding error: ${response.status} ${errorText}`)
          // Continue with other batches even if one fails
          continue
        }

        const data = await response.json()
        const embeddings = data.data || []

        embeddings.forEach((item: any, index: number) => {
          if (item.embedding && Array.isArray(item.embedding)) {
            results.push({
              embedding: item.embedding,
              tokenCount: data.usage?.total_tokens ? Math.floor(data.usage.total_tokens / embeddings.length) : undefined,
            })
          }
        })

        // Small delay to respect rate limits
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (error: any) {
        console.error(`Error in batch embedding ${i}-${i + batch.length}:`, error)
        // Continue with other batches
      }
    }

    return results
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimension')
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]
      norm1 += embedding1[i] * embedding1[i]
      norm2 += embedding2[i] * embedding2[i]
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2)
    if (denominator === 0) {
      return 0
    }

    return dotProduct / denominator
  }
}

// Export singleton
export const embeddingService = new EmbeddingService()

