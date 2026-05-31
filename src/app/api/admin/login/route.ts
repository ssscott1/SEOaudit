import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAdminPassword,
  generateAdminToken,
  getAdminCookieOptions,
} from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    const isValid = await verifyAdminPassword(password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = generateAdminToken()
    const cookieOptions = getAdminCookieOptions()

    const response = NextResponse.json({ success: true })
    response.cookies.set({
      ...cookieOptions,
      value: token,
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
