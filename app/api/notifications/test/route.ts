import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { handleApiError } from '@/lib/errors'

// POST /api/notifications/test - Create test notifications
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    
    // Create some test notifications
    const testNotifications = [
      {
        type: 'invoice',
        title: 'Nieuwe factuur aangemaakt',
        message: 'Factuur #2025-001 voor €1,250.00 is aangemaakt en klaar om te versturen.',
        priority: 'medium' as const,
        userId,
      },
      {
        type: 'quote',
        title: 'Offerte geaccepteerd',
        message: 'Offerte #Q-2025-003 is geaccepteerd door Acme Corp. Je kunt nu beginnen met het project.',
        priority: 'high' as const,
        userId,
      },
      {
        type: 'reminder',
        title: 'Herinnering: Factuur betaling',
        message: 'Factuur #2024-089 is al 30 dagen open. Overweeg een betalingsherinnering te sturen.',
        priority: 'high' as const,
        userId,
      },
      {
        type: 'system',
        title: 'Welkom bij ZzpChat!',
        message: 'Je kilometerregistratie is succesvol toegevoegd. Je kunt nu je zakelijke ritten bijhouden.',
        priority: 'low' as const,
        userId,
      },
      {
        type: 'payment',
        title: 'Betaling ontvangen',
        message: '€850.00 ontvangen van StartupXYZ voor factuur #2024-095.',
        priority: 'medium' as const,
        userId,
      }
    ]

    // Create notifications
    const notifications = await Promise.all(
      testNotifications.map(notificationData =>
        prisma.notification.create({
          data: notificationData
        })
      )
    )

    return NextResponse.json({ 
      message: 'Test notifications created successfully',
      notifications 
    })
  } catch (error) {
    return handleApiError(error)
  }
}


