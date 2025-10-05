import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

const createConversationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  whatsappMessageId: z.string().optional(),
  userMessage: z.string().min(1, 'User message is required'),
  aiResponse: z.string().optional(),
  actionType: z.enum(['CREATE_INVOICE', 'CREATE_QUOTE', 'ADD_TIME', 'SUMMARIZE_EMAILS', 'MANAGE_CALENDAR', 'UNKNOWN']).optional(),
  actionData: z.any().optional(),
  status: z.enum(['PROCESSING', 'COMPLETED', 'ERROR']).default('PROCESSING'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createConversationSchema.parse(body);

    const conversation = await prisma.aI_Conversation.create({
      data: {
        userId: data.userId,
        whatsappMessageId: data.whatsappMessageId,
        userMessage: data.userMessage,
        aiResponse: data.aiResponse,
        actionType: data.actionType,
        actionData: data.actionData,
        status: data.status,
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const conversations = await prisma.aI_Conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userMessage: true,
        aiResponse: true,
        actionType: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
