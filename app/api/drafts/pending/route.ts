import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

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

    // Check for pending drafts in the conversation history
    const pendingConversations = await prisma.aI_Conversation.findMany({
      where: {
        userId: userId,
        status: 'PROCESSING',
        actionType: {
          in: ['CREATE_INVOICE', 'CREATE_QUOTE', 'ADD_TIME', 'SUMMARIZE_EMAILS', 'MANAGE_CALENDAR']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: {
        id: true,
        actionType: true,
        actionData: true,
        userMessage: true,
        aiResponse: true,
        createdAt: true,
      },
    });

    const hasPendingDraft = pendingConversations.length > 0;
    
    if (hasPendingDraft) {
      const draft = pendingConversations[0];
      return NextResponse.json({
        hasPending: true,
        draft: {
          draftId: draft.id,
          userId: userId,
          type: mapActionTypeToDraftType(draft.actionType || 'UNKNOWN'),
          content: draft.aiResponse || draft.userMessage,
          status: 'pending',
          createdAt: draft.createdAt.toISOString(),
          metadata: {
            intent: draft.actionType,
            entities: draft.actionData || {},
            originalMessage: draft.userMessage
          }
        }
      });
    }

    return NextResponse.json({
      hasPending: false,
      draft: null
    });
  } catch (error) {
    console.error('Error checking pending drafts:', error);
    return NextResponse.json(
      { error: 'Failed to check pending drafts' },
      { status: 500 }
    );
  }
}

function mapActionTypeToDraftType(actionType: string): string {
  switch (actionType) {
    case 'CREATE_INVOICE':
      return 'invoice';
    case 'CREATE_QUOTE':
      return 'quote';
    case 'ADD_TIME':
      return 'time_entry';
    case 'SUMMARIZE_EMAILS':
      return 'email_summary';
    case 'MANAGE_CALENDAR':
      return 'calendar_event';
    default:
      return 'unknown';
  }
}
