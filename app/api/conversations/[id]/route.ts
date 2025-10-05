import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

const updateConversationSchema = z.object({
  aiResponse: z.string().optional(),
  actionType: z.enum(['CREATE_INVOICE', 'CREATE_QUOTE', 'ADD_TIME', 'SUMMARIZE_EMAILS', 'MANAGE_CALENDAR', 'UNKNOWN']).optional(),
  actionData: z.any().optional(),
  status: z.enum(['PROCESSING', 'COMPLETED', 'ERROR']).optional(),
  errorMessage: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await prisma.aI_Conversation.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = updateConversationSchema.parse(body);

    const conversation = await prisma.aI_Conversation.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.aI_Conversation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
