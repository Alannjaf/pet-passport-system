import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'

// Generate random account number
function generateAccountNumber() {
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `CLN-${randomNum}`
}

// Generate random password
function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'syndicate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clinicName, contactInfo } = body

    if (!clinicName) {
      return NextResponse.json({ error: 'Clinic name is required' }, { status: 400 })
    }

    // Generate account number and password
    const accountNumber = generateAccountNumber()
    const plainPassword = generatePassword()
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    // Insert clinic
    const newClinic = await db.insert(users).values({
      accountNumber,
      password: hashedPassword,
      clinicName,
      contactInfo: contactInfo || null,
      status: 'active',
      createdBy: 'syndicate',
    }).returning()

    return NextResponse.json({
      success: true,
      clinic: newClinic[0],
      credentials: {
        accountNumber,
        password: plainPassword,
      },
    })
  } catch (error) {
    console.error('Error creating clinic:', error)
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 })
  }
}

