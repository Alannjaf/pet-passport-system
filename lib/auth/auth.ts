import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { adminUsers, users, branchAssignments } from '@/lib/db/schema'
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
          const adminHash = process.env.ADMIN_PASSWORD_HASH
          if (!adminHash) {
            console.error('ADMIN_PASSWORD_HASH environment variable is not set')
            return null
          }
          const isValid = await bcrypt.compare(password, adminHash)
          if (isValid) {
            return {
              id: 'admin',
              name: 'Syndicate Admin',
              role: 'syndicate',
              assignedCityIds: [],
            }
          }
          return null
        }

        // Check admin users (branch heads)
        const adminUser = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.username, accountNumber))
          .limit(1)

        if (adminUser.length > 0) {
          const admin = adminUser[0]
          const isValidPassword = await bcrypt.compare(password, admin.password)
          if (!isValidPassword) {
            return null
          }

          // Get assigned cities for branch head
          let assignedCityIds: number[] = []
          if (admin.role === 'branch_head') {
            const assignments = await db
              .select({ cityId: branchAssignments.cityId })
              .from(branchAssignments)
              .where(eq(branchAssignments.userId, admin.id))
            assignedCityIds = assignments.map(a => a.cityId)
          }

          return {
            id: admin.id.toString(),
            name: admin.username,
            role: admin.role,
            assignedCityIds,
          }
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
          assignedCityIds: [],
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.accountNumber = user.accountNumber
        token.assignedCityIds = user.assignedCityIds
      }

      // Re-check clinic status on each request
      if (token.role === 'clinic' && token.sub && token.sub !== 'admin') {
        try {
          const [clinic] = await db
            .select({ status: users.status })
            .from(users)
            .where(eq(users.id, parseInt(token.sub)))
            .limit(1)

          if (clinic && clinic.status === 'blocked') {
            token.blocked = true
          }
        } catch {
          // If DB check fails, don't block the user
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token.blocked) {
        session.user.role = 'blocked'
        return session
      }
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.sub as string
        session.user.accountNumber = token.accountNumber as string
        session.user.assignedCityIds = token.assignedCityIds as number[]
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
})

