import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { generateAccountNumber, generatePassword } from '@/lib/utils/crypto'

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

    const { password: _hash, ...clinicSafe } = newClinic[0]
    return NextResponse.json({
      success: true,
      clinic: clinicSafe,
      credentials: {
        accountNumber,
        password: plainPassword,
        clinicName,
      },
    })
  } catch (error) {
    console.error('Error creating clinic:', error)
    return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 })
  }
}

