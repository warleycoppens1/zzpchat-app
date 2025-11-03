/**
 * RAG Indexer Service
 * Automatically indexes business data for vector search
 */

import { prisma } from '@/lib/prisma'
import { vectorStore, VectorStoreDocument } from './vector-store'

export class RAGIndexer {
  /**
   * Index a client
   */
  async indexClient(userId: string, clientId: string): Promise<void> {
    try {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
          invoices: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              number: true,
              amount: true,
              status: true,
            },
          },
          quotes: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              number: true,
              amount: true,
              status: true,
            },
          },
        },
      })

      if (!client || client.userId !== userId) {
        return
      }

      // Build content string for embedding
      const contentParts = [
        `Klant: ${client.name}`,
        client.company ? `Bedrijf: ${client.company}` : null,
        client.email ? `Email: ${client.email}` : null,
        client.phone ? `Telefoon: ${client.phone}` : null,
        client.address ? `Adres: ${client.address}` : null,
        client.notes ? `Notities: ${client.notes}` : null,
        client.industry ? `Branche: ${client.industry}` : null,
      ].filter(Boolean)

      if (client.invoices.length > 0) {
        const invoiceSummary = `Facturen: ${client.invoices.map(i => `#${i.number} (€${i.amount}, ${i.status})`).join(', ')}`
        contentParts.push(invoiceSummary)
      }

      if (client.quotes.length > 0) {
        const quoteSummary = `Offertes: ${client.quotes.map(q => `#${q.number} (€${q.amount}, ${q.status})`).join(', ')}`
        contentParts.push(quoteSummary)
      }

      const content = contentParts.join('\n')

      const document: VectorStoreDocument = {
        entityType: 'client',
        entityId: clientId,
        content,
        metadata: {
          name: client.name,
          company: client.company,
          email: client.email,
          createdAt: client.createdAt.toISOString(),
        },
      }

      await vectorStore.storeEmbedding(userId, document)
    } catch (error: any) {
      console.error(`Error indexing client ${clientId}:`, error)
    }
  }

  /**
   * Index an invoice
   */
  async indexInvoice(userId: string, invoiceId: string): Promise<void> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          client: {
            select: {
              name: true,
              company: true,
            },
          },
        },
      })

      if (!invoice || invoice.userId !== userId) {
        return
      }

      const lineItems = invoice.lineItems as any[]
      const lineItemsText = lineItems
        ? lineItems.map((item: any) => `${item.description || 'Item'}: ${item.quantity}x €${item.rate || 0} = €${item.amount || 0}`).join('\n')
        : ''

      const content = [
        `Factuur ${invoice.number}`,
        `Klant: ${invoice.client?.name || 'Onbekend'}${invoice.client?.company ? ` (${invoice.client.company})` : ''}`,
        `Bedrag: €${invoice.amount}`,
        `Status: ${invoice.status}`,
        invoice.description ? `Beschrijving: ${invoice.description}` : null,
        invoice.dueDate ? `Vervaldatum: ${invoice.dueDate.toISOString().split('T')[0]}` : null,
        lineItemsText ? `Regels:\n${lineItemsText}` : null,
      ].filter(Boolean).join('\n')

      const document: VectorStoreDocument = {
        entityType: 'invoice',
        entityId: invoiceId,
        content,
        metadata: {
          number: invoice.number,
          amount: Number(invoice.amount),
          status: invoice.status,
          clientName: invoice.client?.name,
          createdAt: invoice.createdAt.toISOString(),
        },
      }

      await vectorStore.storeEmbedding(userId, document)
    } catch (error: any) {
      console.error(`Error indexing invoice ${invoiceId}:`, error)
    }
  }

  /**
   * Index a quote
   */
  async indexQuote(userId: string, quoteId: string): Promise<void> {
    try {
      const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: {
          client: {
            select: {
              name: true,
              company: true,
            },
          },
        },
      })

      if (!quote || quote.userId !== userId) {
        return
      }

      const lineItems = quote.lineItems as any[]
      const lineItemsText = lineItems
        ? lineItems.map((item: any) => `${item.description || 'Item'}: ${item.quantity}x €${item.rate || 0} = €${item.amount || 0}`).join('\n')
        : ''

      const content = [
        `Offerte ${quote.number}`,
        `Klant: ${quote.client?.name || 'Onbekend'}${quote.client?.company ? ` (${quote.client.company})` : ''}`,
        `Bedrag: €${quote.amount}`,
        `Status: ${quote.status}`,
        quote.description ? `Beschrijving: ${quote.description}` : null,
        quote.notes ? `Notities: ${quote.notes}` : null,
        quote.validUntil ? `Geldig tot: ${quote.validUntil.toISOString().split('T')[0]}` : null,
        lineItemsText ? `Regels:\n${lineItemsText}` : null,
      ].filter(Boolean).join('\n')

      const document: VectorStoreDocument = {
        entityType: 'quote',
        entityId: quoteId,
        content,
        metadata: {
          number: quote.number,
          amount: Number(quote.amount),
          status: quote.status,
          clientName: quote.client?.name,
          createdAt: quote.createdAt.toISOString(),
        },
      }

      await vectorStore.storeEmbedding(userId, document)
    } catch (error: any) {
      console.error(`Error indexing quote ${quoteId}:`, error)
    }
  }

  /**
   * Index a conversation
   */
  async indexConversation(userId: string, conversationId: string): Promise<void> {
    try {
      const conversation = await prisma.aI_Conversation.findUnique({
        where: { id: conversationId },
      })

      if (!conversation || conversation.userId !== userId) {
        return
      }

      const content = [
        `Vraag: ${conversation.userMessage}`,
        conversation.aiResponse ? `Antwoord: ${conversation.aiResponse.slice(0, 500)}` : null, // Limit response length
      ].filter(Boolean).join('\n')

      const document: VectorStoreDocument = {
        entityType: 'conversation',
        entityId: conversationId,
        content,
        metadata: {
          actionType: conversation.actionType,
          status: conversation.status,
          createdAt: conversation.createdAt.toISOString(),
        },
      }

      await vectorStore.storeEmbedding(userId, document)
    } catch (error: any) {
      console.error(`Error indexing conversation ${conversationId}:`, error)
    }
  }

  /**
   * Index a project
   */
  async indexProject(userId: string, projectId: string): Promise<void> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          client: {
            select: {
              name: true,
              company: true,
            },
          },
        },
      })

      if (!project || project.userId !== userId) {
        return
      }

      const content = [
        `Project: ${project.name}`,
        project.description ? `Beschrijving: ${project.description}` : null,
        project.client ? `Klant: ${project.client.name}${project.client.company ? ` (${project.client.company})` : ''}` : null,
        project.hourlyRate ? `Uurtarief: €${project.hourlyRate}` : null,
        project.budget ? `Budget: €${project.budget}` : null,
        `Status: ${project.status}`,
      ].filter(Boolean).join('\n')

      const document: VectorStoreDocument = {
        entityType: 'project',
        entityId: projectId,
        content,
        metadata: {
          name: project.name,
          status: project.status,
          clientName: project.client?.name,
          createdAt: project.createdAt.toISOString(),
        },
      }

      await vectorStore.storeEmbedding(userId, document)
    } catch (error: any) {
      console.error(`Error indexing project ${projectId}:`, error)
    }
  }

  /**
   * Index all data for a user (useful for initial setup or re-indexing)
   */
  async indexAllUserData(userId: string): Promise<void> {
    console.log(`Starting full re-index for user ${userId}...`)

    try {
      // Index clients
      const clients = await prisma.client.findMany({ where: { userId } })
      for (const client of clients) {
        await this.indexClient(userId, client.id)
      }

      // Index invoices
      const invoices = await prisma.invoice.findMany({ where: { userId } })
      for (const invoice of invoices) {
        await this.indexInvoice(userId, invoice.id)
      }

      // Index quotes
      const quotes = await prisma.quote.findMany({ where: { userId } })
      for (const quote of quotes) {
        await this.indexQuote(userId, quote.id)
      }

      // Index projects
      const projects = await prisma.project.findMany({ where: { userId } })
      for (const project of projects) {
        await this.indexProject(userId, project.id)
      }

      // Index recent conversations
      const conversations = await prisma.aI_Conversation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100, // Index last 100 conversations
      })
      for (const conversation of conversations) {
        await this.indexConversation(userId, conversation.id)
      }

      console.log(`Completed full re-index for user ${userId}`)
    } catch (error: any) {
      console.error(`Error in full re-index for user ${userId}:`, error)
      throw error
    }
  }
}

// Export singleton
export const ragIndexer = new RAGIndexer()

