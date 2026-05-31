import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getAdminFromCookies } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const isAdmin = await getAdminFromCookies()

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const paidFilter = searchParams.get('paid')
  const search = searchParams.get('search') || ''

  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (paidFilter === 'true') {
    where.paid = true
  } else if (paidFilter === 'false') {
    where.paid = false
  }

  if (search) {
    where.OR = [
      { url: { contains: search } },
      { email: { contains: search } },
      { name: { contains: search } },
    ]
  }

  const [analyses, total] = await Promise.all([
    prisma.analysis.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        url: true,
        email: true,
        name: true,
        score: true,
        paid: true,
        paidAt: true,
        reportType: true,
        pdfSent: true,
        createdAt: true,
      },
    }),
    prisma.analysis.count({ where }),
  ])

  // Stats
  const stats = await prisma.analysis.aggregate({
    _count: { id: true },
    where: {},
  })

  const paidCount = await prisma.analysis.count({ where: { paid: true } })

  const oneTimeRevenue = await prisma.analysis.count({
    where: { paid: true, reportType: 'one-time' },
  })

  const subscriptionRevenue = await prisma.analysis.count({
    where: { paid: true, reportType: 'subscription' },
  })

  const totalRevenue = oneTimeRevenue * 199 + subscriptionRevenue * 49
  const conversionRate = stats._count.id > 0
    ? ((paidCount / stats._count.id) * 100).toFixed(1)
    : '0'

  return NextResponse.json({
    analyses,
    total,
    page,
    pages: Math.ceil(total / limit),
    stats: {
      total: stats._count.id,
      paid: paidCount,
      conversionRate,
      totalRevenue,
    },
  })
}

export async function GET_DETAIL(request: NextRequest) {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  const analysis = await prisma.analysis.findUnique({ where: { id } })
  if (!analysis) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(analysis)
}
