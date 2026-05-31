import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'fallback-secret-change-in-production'
const COOKIE_NAME = 'admin_token'

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  // If password looks like a bcrypt hash, compare directly
  if (adminPassword.startsWith('$2')) {
    return bcrypt.compare(password, adminPassword)
  }
  // Otherwise plain text comparison (dev mode)
  return password === adminPassword
}

export function signAdminToken(): string {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string }
    return decoded.role === 'admin'
  } catch {
    return false
  }
}

export function getAdminTokenFromCookies(): string | null {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)
  return token?.value || null
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminTokenFromCookies()
  if (!token) return false
  return verifyAdminToken(token)
}

export const COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24, // 24 hours
  path: '/',
}
