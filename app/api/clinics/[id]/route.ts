import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

// Generate random password
function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// DELETE - Delete clinic
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'syndicate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await db.delete(users).where(eq(users.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting clinic:', error)
    return NextResponse.json({ error: 'Failed to delete clinic' }, { status: 500 })
  }
}

// PATCH - Update clinic (block/unblock, reset password)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'syndicate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    if (action === 'block') {
      await db.update(users).set({ status: 'blocked' }).where(eq(users.id, parseInt(id)))
      return NextResponse.json({ success: true })
    }

    if (action === 'unblock') {
      await db.update(users).set({ status: 'active' }).where(eq(users.id, parseInt(id)))
      return NextResponse.json({ success: true })
    }

    if (action === 'reset-password') {
      const newPassword = generatePassword()
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      
      await db.update(users).set({ password: hashedPassword }).where(eq(users.id, parseInt(id)))
      
      return NextResponse.json({ success: true, newPassword })
    }

    if (action === 'edit') {
      const { clinicName, contactInfo } = body
      
      if (!clinicName || clinicName.trim() === '') {
        return NextResponse.json({ error: 'Clinic name is required' }, { status: 400 })
      }

      await db.update(users).set({ 
        clinicName: clinicName.trim(),
        contactInfo: contactInfo?.trim() || null
      }).where(eq(users.id, parseInt(id)))
      
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating clinic:', error)
    return NextResponse.json({ error: 'Failed to update clinic' }, { status: 500 })
  }
}

