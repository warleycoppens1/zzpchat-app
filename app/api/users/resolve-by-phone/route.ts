import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const resolveUserSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = resolveUserSchema.parse(body);

    // Normalize phone number (remove +, spaces, etc.)
    const normalizedPhone = phone.replace(/[^\d]/g, '');

    // Find user by phone number
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: phone },
          { phone: normalizedPhone },
          { phone: `+${normalizedPhone}` },
          { phone: `+31${normalizedPhone.slice(1)}` }, // Dutch format
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subscriptionTier: true,
        language: true,
        timezone: true,
        notifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        userId: null,
        error: 'user_not_found',
        message: 'Geen gebruiker gevonden met dit telefoonnummer'
      }, { status: 404 });
    }

    return NextResponse.json({
      userId: user.id,
      name: user.name,
      email: user.email,
      tier: user.subscriptionTier || 'standard',
      settings: {
        language: user.language || 'nl',
        timezone: user.timezone || 'Europe/Amsterdam',
        notifications: user.notifications ?? true
      }
    });
  } catch (error) {
    console.error('Error resolving user by phone:', error);
    return NextResponse.json(
      { error: 'Failed to resolve user' },
      { status: 500 }
    );
  }
}
