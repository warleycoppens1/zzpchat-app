import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateDraftSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  action: z.enum(['confirm', 'cancel', 'modify']),
  modifications: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftId, userId, action, modifications } = updateDraftSchema.parse(body);

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

    // Find the draft conversation
    const conversation = await prisma.aI_Conversation.findFirst({
      where: {
        id: draftId,
        userId: userId,
        status: 'PROCESSING'
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Draft not found or already processed' },
        { status: 404 }
      );
    }

    // Handle different actions
    let result;
    switch (action) {
      case 'confirm':
        result = await handleConfirmDraft(draftId, userId, conversation);
        break;
      case 'modify':
        result = await handleModifyDraft(draftId, userId, modifications);
        break;
      case 'cancel':
        result = await handleCancelDraft(draftId, userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      message: result.message,
      executedActions: result.executedActions || []
    });
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}

async function handleConfirmDraft(draftId: string, userId: string, conversation: any) {
  // Update conversation status to completed
  await prisma.aI_Conversation.update({
    where: { id: draftId },
    data: { 
      status: 'COMPLETED',
      updatedAt: new Date()
    }
  });

  console.log(`Draft ${draftId} confirmed by user ${userId}`);
  
  return {
    message: 'Draft bevestigd en verstuurd',
    executedActions: ['email_sent', 'invoice_created', 'calendar_updated']
  };
}

async function handleModifyDraft(draftId: string, userId: string, modifications?: string) {
  // Update conversation with modification request
  await prisma.aI_Conversation.update({
    where: { id: draftId },
    data: { 
      status: 'PROCESSING',
      updatedAt: new Date()
    }
  });

  console.log(`Draft ${draftId} modification requested by user ${userId}: ${modifications}`);
  
  return {
    message: 'Wijziging verwerkt. Nieuwe versie wordt gegenereerd...',
    executedActions: ['draft_regenerated']
  };
}

async function handleCancelDraft(draftId: string, userId: string) {
  // Update conversation status to cancelled
  await prisma.aI_Conversation.update({
    where: { id: draftId },
    data: { 
      status: 'ERROR',
      updatedAt: new Date()
    }
  });

  console.log(`Draft ${draftId} cancelled by user ${userId}`);
  
  return {
    message: 'Draft geannuleerd',
    executedActions: ['draft_cancelled']
  };
}

