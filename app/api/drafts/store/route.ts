import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const storeDraftSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  status: z.enum(['pending', 'confirmed', 'sent', 'cancelled']).default('pending'),
  draftData: z.any(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftId, userId, status, draftData } = storeDraftSchema.parse(body);

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

    // Store draft in conversation history
    const conversation = await prisma.aI_Conversation.create({
      data: {
        userId: userId,
        userMessage: `Draft created: ${draftId}`,
        aiResponse: `Draft stored with status: ${status}`,
        actionType: getActionTypeFromDraftData(draftData),
        actionData: draftData,
        status: 'PROCESSING',
      },
    });

    return NextResponse.json({
      success: true,
      draftId: draftId,
      conversationId: conversation.id,
      status: status,
      message: 'Draft stored successfully',
    });
  } catch (error) {
    console.error('Error storing draft:', error);
    return NextResponse.json(
      { error: 'Failed to store draft' },
      { status: 500 }
    );
  }
}

function getActionTypeFromDraftData(draftData: any): string {
  if (!draftData || typeof draftData !== 'object') {
    return 'UNKNOWN';
  }

  const draftType = draftData.draftType || '';
  
  switch (draftType) {
    case 'invoice_draft':
      return 'CREATE_INVOICE';
    case 'quote_draft':
      return 'CREATE_QUOTE';
    case 'time_entry':
      return 'ADD_TIME';
    case 'gmail_draft':
    case 'calendar_event':
      return 'SUMMARIZE_EMAILS';
    default:
      return 'UNKNOWN';
  }
}
