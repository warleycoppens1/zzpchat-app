import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const storeDraftSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.string().min(1, 'Type is required'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['pending', 'confirmed', 'sent', 'cancelled']).default('pending'),
  metadata: z.object({
    intent: z.string(),
    complexity: z.string().optional(),
    entities: z.record(z.any()).optional(),
    originalMessage: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, content, status, metadata } = storeDraftSchema.parse(body);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate unique draft ID
    const draftId = `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store draft in conversation history
    const conversation = await prisma.aI_Conversation.create({
      data: {
        userId: userId,
        userMessage: metadata.originalMessage || `Draft created: ${type}`,
        aiResponse: content,
        actionType: mapDraftTypeToActionType(type),
        actionData: metadata,
        status: 'PROCESSING',
      },
    });

    return NextResponse.json({
      success: true,
      draftId: draftId,
      message: 'Draft succesvol opgeslagen'
    });
  } catch (error) {
    console.error('Error storing draft:', error);
    return NextResponse.json(
      { error: 'Failed to store draft' },
      { status: 500 }
    );
  }
}

function mapDraftTypeToActionType(draftType: string): 'CREATE_INVOICE' | 'CREATE_QUOTE' | 'ADD_TIME' | 'SUMMARIZE_EMAILS' | 'MANAGE_CALENDAR' | 'UNKNOWN' {
  switch (draftType) {
    case 'invoice':
      return 'CREATE_INVOICE';
    case 'quote':
      return 'CREATE_QUOTE';
    case 'time_entry':
      return 'ADD_TIME';
    case 'email_summary':
      return 'SUMMARIZE_EMAILS';
    case 'calendar_event':
      return 'MANAGE_CALENDAR';
    default:
      return 'UNKNOWN';
  }
}
