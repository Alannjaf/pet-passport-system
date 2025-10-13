import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { adminUsers, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        accountNumber: { label: 'Account Number', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.accountNumber || !credentials?.password) {
          return null
        }

        const accountNumber = credentials.accountNumber as string
        const password = credentials.password as string

        // Check if it's admin credentials
        if (accountNumber === process.env.ADMIN_USERNAME) {
          if (password === process.env.ADMIN_PASSWORD) {
            return {
              id: 'admin',
              name: 'Syndicate Admin',
              role: 'syndicate',
            }
          }
          return null
        }

        // Check clinic users
        const user = await db
          .select()
          .from(users)
          .where(eq(users.accountNumber, accountNumber))
          .limit(1)

        if (user.length === 0) {
          return null
        }

        const clinic = user[0]

        // Check if clinic is blocked
        if (clinic.status === 'blocked') {
          throw new Error('Your account has been blocked. Please contact the syndicate.')
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, clinic.password)
        if (!isValidPassword) {
          return null
        }

        return {
          id: clinic.id.toString(),
          name: clinic.clinicName,
          role: 'clinic',
          accountNumber: clinic.accountNumber,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.accountNumber = user.accountNumber
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.sub as string
        session.user.accountNumber = token.accountNumber as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

