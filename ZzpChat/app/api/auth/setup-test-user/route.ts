import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'test@zzpchat.nl'
      }
    })

    if (existingUser) {
      return NextResponse.json({ 
        message: 'Test user already exists',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name
        }
      })
    }

    // Hash the test password
    const hashedPassword = await bcrypt.hash('test123', 12)

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@zzpchat.nl',
        name: 'Test User',
        password: hashedPassword,
        subscriptionTier: 'STARTER',
        companyName: 'Test Bedrijf',
        whatsappPhoneNumber: '+31612345678'
      }
    })

    return NextResponse.json({ 
      message: 'Test user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Error creating test user:', error)
    return NextResponse.json(
      { error: 'Failed to create test user' },
      { status: 500 }
    )
  }
}
