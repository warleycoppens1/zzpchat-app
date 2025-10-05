import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create test user if it doesn't exist
  const testUserEmail = 'test@zzpchat.nl'
  let testUser = await prisma.user.findUnique({
    where: { email: testUserEmail }
  })

  if (!testUser) {
    console.log('👤 Creating test user...')
    const hashedPassword = await bcrypt.hash('test123', 12)
    
    testUser = await prisma.user.create({
      data: {
        email: testUserEmail,
        name: 'Test User',
        password: hashedPassword,
        companyName: 'Test Bedrijf BV',
        subscriptionTier: 'PRO',
        whatsappPhoneNumber: '+31612345678',
      }
    })
    console.log('✅ Test user created')
  } else {
    console.log('👤 Test user already exists')
  }

  // Create demo clients
  console.log('🏢 Creating demo clients...')
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { 
        id: 'demo-client-1'
      },
      update: {},
      create: {
        id: 'demo-client-1',
        name: 'Jan Jansen',
        email: 'jan@jansen.nl',
        company: 'Jansen Bouw BV',
        phone: '+31612345678',
        address: 'Hoofdstraat 123, 1234 AB Amsterdam',
        vatNumber: 'NL123456789B01',
        userId: testUser.id,
      }
    }),
    prisma.client.upsert({
      where: { 
        id: 'demo-client-2'
      },
      update: {},
      create: {
        id: 'demo-client-2',
        name: 'Maria Pietersen',
        email: 'maria@webdesign.nl',
        company: 'Creative Web Design',
        phone: '+31687654321',
        address: 'Kerkstraat 45, 5678 CD Utrecht',
        vatNumber: 'NL987654321B01',
        userId: testUser.id,
      }
    }),
    prisma.client.upsert({
      where: { 
        id: 'demo-client-3'
      },
      update: {},
      create: {
        id: 'demo-client-3',
        name: 'Peter de Vries',
        email: 'peter@techstart.nl',
        company: 'TechStart Solutions',
        phone: '+31611223344',
        address: 'Businesspark 789, 9012 EF Rotterdam',
        vatNumber: 'NL456789123B01',
        userId: testUser.id,
      }
    })
  ])
  console.log(`✅ Created ${clients.length} demo clients`)

  // Create demo time entries
  console.log('⏰ Creating demo time entries...')
  const timeEntries = [
    {
      project: 'Website Redesign',
      hours: 8.5,
      date: new Date('2025-01-15'),
      notes: 'Initial design mockups and wireframes',
      clientId: clients[1].id,
      userId: testUser.id,
    },
    {
      project: 'Database Migration',
      hours: 6.0,
      date: new Date('2025-01-14'),
      notes: 'Migrated legacy database to new system',
      clientId: clients[2].id,
      userId: testUser.id,
    },
    {
      project: 'Construction Planning',
      hours: 4.5,
      date: new Date('2025-01-13'),
      notes: 'Project planning and resource allocation',
      clientId: clients[0].id,
      userId: testUser.id,
    },
    {
      project: 'Website Redesign',
      hours: 7.0,
      date: new Date('2025-01-12'),
      notes: 'Frontend development and responsive design',
      clientId: clients[1].id,
      userId: testUser.id,
    }
  ]

  for (const entry of timeEntries) {
    await prisma.timeEntry.upsert({
      where: {
        id: `demo-time-${entry.project.replace(/\s+/g, '-').toLowerCase()}-${entry.date.toISOString().split('T')[0]}`
      },
      update: {},
      create: {
        id: `demo-time-${entry.project.replace(/\s+/g, '-').toLowerCase()}-${entry.date.toISOString().split('T')[0]}`,
        ...entry
      }
    })
  }
  console.log(`✅ Created ${timeEntries.length} demo time entries`)

  // Create demo invoices
  console.log('🧾 Creating demo invoices...')
  const invoices = [
    {
      id: 'demo-invoice-1',
      number: '2025001',
      amount: 2125.00,
      status: 'PAID' as const,
      clientId: clients[1].id,
      userId: testUser.id,
      description: 'Website redesign project - Phase 1',
      dueDate: new Date('2025-02-15'),
      sentAt: new Date('2025-01-16'),
      paidAt: new Date('2025-01-20'),
      lineItems: [
        {
          description: 'Design and wireframing',
          quantity: 8.5,
          rate: 75,
          amount: 637.50
        },
        {
          description: 'Frontend development',
          quantity: 15,
          rate: 85,
          amount: 1275.00
        },
        {
          description: 'Testing and deployment',
          quantity: 2.5,
          rate: 85,
          amount: 212.50
        }
      ]
    },
    {
      id: 'demo-invoice-2',
      number: '2025002',
      amount: 1500.00,
      status: 'SENT' as const,
      clientId: clients[0].id,
      userId: testUser.id,
      description: 'Construction project consultation',
      dueDate: new Date('2025-02-28'),
      sentAt: new Date('2025-01-25'),
      lineItems: [
        {
          description: 'Project planning and consultation',
          quantity: 20,
          rate: 75,
          amount: 1500.00
        }
      ]
    }
  ]

  for (const invoice of invoices) {
    await prisma.invoice.upsert({
      where: { id: invoice.id },
      update: {},
      create: invoice
    })
  }
  console.log(`✅ Created ${invoices.length} demo invoices`)

  // Create demo quotes
  console.log('💼 Creating demo quotes...')
  const quotes = [
    {
      id: 'demo-quote-1',
      number: 'Q2025001',
      amount: 3500.00,
      status: 'SENT' as const,
      clientId: clients[2].id,
      userId: testUser.id,
      description: 'Complete system migration and optimization',
      validUntil: new Date('2025-03-01'),
      sentAt: new Date('2025-01-20'),
      lineItems: [
        {
          description: 'Database migration',
          quantity: 25,
          rate: 90,
          amount: 2250.00
        },
        {
          description: 'System optimization',
          quantity: 15,
          rate: 85,
          amount: 1275.00
        }
      ]
    }
  ]

  for (const quote of quotes) {
    await prisma.quote.upsert({
      where: { id: quote.id },
      update: {},
      create: quote
    })
  }
  console.log(`✅ Created ${quotes.length} demo quotes`)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
