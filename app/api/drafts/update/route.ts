import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const updateDraftSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  action: z.enum(['confirm', 'send', 'modify', 'cancel']),
  userId: z.string().min(1, 'User ID is required'),
  userResponse: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftId, action, userId, userResponse } = updateDraftSchema.parse(body);

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

    // Handle different actions
    let result;
    switch (action) {
      case 'confirm':
        result = await handleConfirmDraft(draftId, userId);
        break;
      case 'send':
        result = await handleSendDraft(draftId, userId);
        break;
      case 'modify':
        result = await handleModifyDraft(draftId, userId, userResponse);
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
      draftId,
      result,
      message: getActionMessage(action),
    });
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}

async function handleConfirmDraft(draftId: string, userId: string) {
  // For now, just log the confirmation
  // In a real implementation, this would update the draft status
  console.log(`Draft ${draftId} confirmed by user ${userId}`);
  
  return {
    status: 'confirmed',
    message: 'Draft bevestigd en opgeslagen',
  };
}

async function handleSendDraft(draftId: string, userId: string) {
  // For now, just log the send action
  // In a real implementation, this would send the email/invoice/etc.
  console.log(`Draft ${draftId} sent by user ${userId}`);
  
  return {
    status: 'sent',
    message: 'Draft verzonden',
  };
}

async function handleModifyDraft(draftId: string, userId: string, userResponse?: string) {
  // For now, just log the modification request
  // In a real implementation, this would update the draft with user feedback
  console.log(`Draft ${draftId} modification requested by user ${userId}: ${userResponse}`);
  
  return {
    status: 'modification_requested',
    message: 'Wijziging verwerkt. Nieuwe versie wordt gegenereerd...',
    userFeedback: userResponse,
  };
}

async function handleCancelDraft(draftId: string, userId: string) {
  // For now, just log the cancellation
  // In a real implementation, this would delete or mark the draft as cancelled
  console.log(`Draft ${draftId} cancelled by user ${userId}`);
  
  return {
    status: 'cancelled',
    message: 'Draft geannuleerd',
  };
}

function getActionMessage(action: string): string {
  switch (action) {
    case 'confirm':
      return '✅ Draft bevestigd en opgeslagen';
    case 'send':
      return '📤 Draft verzonden';
    case 'modify':
      return '✏️ Wijziging verwerkt. Nieuwe versie wordt gegenereerd...';
    case 'cancel':
      return '❌ Draft geannuleerd';
    default:
      return '🔄 Actie verwerkt';
  }
}
