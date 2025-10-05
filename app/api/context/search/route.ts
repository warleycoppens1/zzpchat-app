import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

const searchContextSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  query: z.string().min(1, 'Query is required'),
  topK: z.number().min(1).max(20).default(5),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, query, topK } = searchContextSchema.parse(body);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Search for relevant context from user's data
    const searchResults = await Promise.all([
      // Search clients
      prisma.client.findMany({
        where: {
          userId: userId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
          phone: true,
          notes: true,
          tags: true,
        },
        take: Math.ceil(topK / 3),
      }),
      // Search invoices
      prisma.invoice.findMany({
        where: {
          userId: userId,
          OR: [
            { number: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          number: true,
          amount: true,
          status: true,
          description: true,
          client: {
            select: {
              name: true,
              company: true,
            },
          },
        },
        take: Math.ceil(topK / 3),
      }),
      // Search quotes
      prisma.quote.findMany({
        where: {
          userId: userId,
          OR: [
            { number: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          number: true,
          amount: true,
          status: true,
          description: true,
          notes: true,
          client: {
            select: {
              name: true,
              company: true,
            },
          },
        },
        take: Math.ceil(topK / 3),
      }),
    ]);

    const [clients, invoices, quotes] = searchResults;

    // Format results for AI consumption
    const results = {
      clients: clients.map(client => ({
        type: 'client',
        id: client.id,
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
        tags: client.tags,
      })),
      invoices: invoices.map(invoice => ({
        type: 'invoice',
        id: invoice.id,
        number: invoice.number,
        amount: invoice.amount.toString(),
        status: invoice.status,
        description: invoice.description,
        client: invoice.client,
      })),
      quotes: quotes.map(quote => ({
        type: 'quote',
        id: quote.id,
        number: quote.number,
        amount: quote.amount.toString(),
        status: quote.status,
        description: quote.description,
        notes: quote.notes,
        client: quote.client,
      })),
    };

    return NextResponse.json({
      results,
      totalResults: clients.length + invoices.length + quotes.length,
      query,
      userId,
    });
  } catch (error) {
    console.error('Error searching context:', error);
    return NextResponse.json(
      { error: 'Failed to search context' },
      { status: 500 }
    );
  }
}
