import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const checkPendingDraftsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = checkPendingDraftsSchema.parse(body);

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
        createdAt: true,
      },
    });

    const hasPendingDraft = pendingConversations.length > 0;
    const pendingDraftId = hasPendingDraft ? pendingConversations[0].id : null;

    return NextResponse.json({
      hasPendingDraft,
      pendingDraftId,
      userId,
      draftCount: pendingConversations.length,
    });
  } catch (error) {
    console.error('Error checking pending drafts:', error);
    return NextResponse.json(
      { error: 'Failed to check pending drafts' },
      { status: 500 }
    );
  }
}
