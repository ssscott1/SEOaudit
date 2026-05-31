import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, signAdminToken, COOKIE_OPTIONS } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    const valid = await verifyAdminPassword(password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = signAdminToken()

    const response = NextResponse.json({ success: true })
    response.cookies.set({
      ...COOKIE_OPTIONS,
      value: token,
    })

    return response
  } catch (err) {
    console.error('Admin login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
