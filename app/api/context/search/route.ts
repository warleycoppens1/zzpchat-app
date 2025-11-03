import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const searchContextSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  intent: z.string().optional(),
  limit: z.number().min(1).max(20).default(5),
  filters: z.object({
    type: z.array(z.string()).optional(),
    dateRange: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
    }).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await requireAuth(request)
    
    const body = await request.json();
    const { query, intent, limit, filters } = searchContextSchema.parse(body);

    // Use authenticated userId from session instead of body
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build search conditions
    const clientWhere: any = {
      userId: userId,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
      ],
    };

    const invoiceWhere: any = {
      userId: userId,
      OR: [
        { number: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    const quoteWhere: any = {
      userId: userId,
      OR: [
        { number: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Add date filters if provided
    if (filters?.dateRange?.from || filters?.dateRange?.to) {
      const dateFilter: any = {};
      if (filters.dateRange.from) dateFilter.gte = new Date(filters.dateRange.from);
      if (filters.dateRange.to) dateFilter.lte = new Date(filters.dateRange.to);
      
      invoiceWhere.createdAt = dateFilter;
      quoteWhere.createdAt = dateFilter;
    }

    // Search for relevant context from user's data
    const searchResults = await Promise.all([
      // Search clients
      prisma.client.findMany({
        where: clientWhere,
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
          phone: true,
          notes: true,
          tags: true,
          createdAt: true,
        },
        take: Math.ceil(limit / 3),
        orderBy: { createdAt: 'desc' },
      }),
      // Search invoices
      prisma.invoice.findMany({
        where: invoiceWhere,
        select: {
          id: true,
          number: true,
          amount: true,
          status: true,
          description: true,
          createdAt: true,
          client: {
            select: {
              name: true,
              company: true,
            },
          },
        },
        take: Math.ceil(limit / 3),
        orderBy: { createdAt: 'desc' },
      }),
      // Search quotes
      prisma.quote.findMany({
        where: quoteWhere,
        select: {
          id: true,
          number: true,
          amount: true,
          status: true,
          description: true,
          notes: true,
          createdAt: true,
          client: {
            select: {
              name: true,
              company: true,
            },
          },
        },
        take: Math.ceil(limit / 3),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const [clients, invoices, quotes] = searchResults;

    // Format results for AI consumption with scores
    const allResults = [
      ...clients.map((client, index) => ({
        id: `client-${client.id}`,
        content: `${client.name}${client.company ? ` (${client.company})` : ''} - ${client.email || 'Geen email'} - ${client.phone || 'Geen telefoon'}${client.notes ? ` - ${client.notes}` : ''}`,
        score: calculateScore(query, client.name, client.company, client.notes),
        metadata: {
          type: 'client_info',
          id: client.id,
          clientName: client.name,
          company: client.company,
          lastUpdated: client.createdAt.toISOString()
        }
      })),
      ...invoices.map((invoice, index) => ({
        id: `invoice-${invoice.id}`,
        content: `Factuur #${invoice.number} voor ${invoice.client?.name || 'Onbekende klant'} - €${invoice.amount} - Status: ${invoice.status}${invoice.description ? ` - ${invoice.description}` : ''}`,
        score: calculateScore(query, invoice.number, invoice.client?.name, invoice.description),
        metadata: {
          type: 'invoice',
          id: invoice.id,
          invoiceNumber: invoice.number,
          amount: Number(invoice.amount),
          status: invoice.status,
          clientName: invoice.client?.name
        }
      })),
      ...quotes.map((quote, index) => ({
        id: `quote-${quote.id}`,
        content: `Offerte #${quote.number} voor ${quote.client?.name || 'Onbekende klant'} - €${quote.amount} - Status: ${quote.status}${quote.description ? ` - ${quote.description}` : ''}${quote.notes ? ` - ${quote.notes}` : ''}`,
        score: calculateScore(query, quote.number, quote.client?.name, quote.description),
        metadata: {
          type: 'quote',
          id: quote.id,
          quoteNumber: quote.number,
          amount: Number(quote.amount),
          status: quote.status,
          clientName: quote.client?.name
        }
      })),
    ];

    // Sort by score and limit results
    const sortedResults = allResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Generate context string
    const context = sortedResults
      .map(result => result.content)
      .join('\n\n');

    return NextResponse.json({
      results: sortedResults,
      totalResults: sortedResults.length,
      context: context
    });
  } catch (error) {
    console.error('Error searching context:', error);
    return NextResponse.json(
      { error: 'Failed to search context' },
      { status: 500 }
    );
  }
}

function calculateScore(query: string, ...fields: (string | null | undefined)[]): number {
  const queryLower = query.toLowerCase();
  const validFields = fields.filter(field => field && typeof field === 'string');
  
  if (validFields.length === 0) return 0;
  
  let score = 0;
  let matches = 0;
  
  validFields.forEach(field => {
    const fieldLower = field!.toLowerCase();
    
    // Exact match gets highest score
    if (fieldLower === queryLower) {
      score += 1.0;
      matches++;
    }
    // Contains match gets medium score
    else if (fieldLower.includes(queryLower)) {
      score += 0.8;
      matches++;
    }
    // Word boundary match gets lower score
    else if (new RegExp(`\\b${queryLower}`, 'i').test(fieldLower)) {
      score += 0.6;
      matches++;
    }
    // Partial word match gets lowest score
    else if (queryLower.split(' ').some(word => fieldLower.includes(word))) {
      score += 0.3;
      matches++;
    }
  });
  
  // Normalize score based on number of matches
  return matches > 0 ? Math.min(score / matches, 1.0) : 0;
}
