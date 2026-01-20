import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      accountNumber?: string
      assignedCityIds?: number[]
    } & DefaultSession['user']
  }

  interface User {
    role: string
    accountNumber?: string
    assignedCityIds?: number[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    accountNumber?: string
    assignedCityIds?: number[]
  }
}

