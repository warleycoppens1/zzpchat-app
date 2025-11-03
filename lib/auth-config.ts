import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'

// Safe prisma import
const getPrisma = async () => {
  try {
    const { prisma } = await import('./prisma')
    return prisma
  } catch (error) {
    console.warn('Prisma not available during build')
    return null
  }
}

export function createAuthOptions(): NextAuthOptions {
  const providers: any[] = []

  // Add Google provider only if env vars are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    )
  }

  // Add credentials provider
  providers.push(
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const prisma = await getPrisma()
          if (!prisma) {
            console.warn('Database not available')
            return null
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            return null
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  )

  return {
    providers,
    secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-for-build',
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async signIn({ user, account, profile }) {
        if (account?.provider === 'google' && user.email) {
          try {
            const prisma = await getPrisma()
            if (!prisma) return true

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email }
            })

            if (!existingUser) {
              // Create new user with Google data
              await prisma.user.create({
                data: {
                  email: user.email,
                  name: user.name || (profile as any)?.name || 'Google User',
                  image: user.image || (profile as any)?.picture,
                  emailVerified: new Date(),
                }
              })
            } else {
              // Update existing user with Google data if missing
              await prisma.user.update({
                where: { email: user.email },
                data: {
                  name: existingUser.name || user.name || (profile as any)?.name,
                  image: existingUser.image || user.image || (profile as any)?.picture,
                  emailVerified: existingUser.emailVerified || new Date(),
                }
              })
            }
          } catch (error) {
            console.error('Error syncing Google user:', error)
          }
        }
        return true
      },
      async jwt({ token, user, account }) {
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
          token.image = user.image
        }
        
        // For Google login, fetch fresh user data
        if (account?.provider === 'google' && token.email) {
          try {
            const prisma = await getPrisma()
            if (prisma) {
              const dbUser = await prisma.user.findUnique({
                where: { email: token.email }
              })
              if (dbUser) {
                token.id = dbUser.id
                token.name = dbUser.name
                token.image = dbUser.image
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error)
          }
        }
        
        return token
      },
      async session({ session, token }) {
        if (token && session.user) {
          (session.user as any).id = token.id as string
          session.user.name = token.name as string
          session.user.email = token.email as string
          session.user.image = token.image as string
        }
        return session
      },
    },
    pages: {
      signIn: '/login',
    },
  }
}
