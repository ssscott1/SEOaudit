import { getAdminFromCookies } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/admin/Dashboard'

export default async function AdminDashboardPage() {
  const isAdmin = await getAdminFromCookies()

  if (!isAdmin) {
    redirect('/admin')
  }

  return <Dashboard />
}
