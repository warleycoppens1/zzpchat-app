import NextAuth from 'next-auth'
import { createAuthOptions } from '../@/lib/auth-config'

const handler = NextAuth(createAuthOptions())

export { handler as GET, handler as POST }
