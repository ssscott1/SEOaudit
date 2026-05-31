import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'

export const analyses = pgTable('Analysis', {
  id:               text('id').primaryKey(),
  url:              text('url').notNull(),
  email:            text('email'),
  name:             text('name'),
  score:            integer('score').notNull(),
  freeIssues:       text('freeIssues').notNull(),   // JSON string
  fullReport:       text('fullReport'),              // JSON string, null until paid
  reportType:       text('reportType'),              // 'one-time' | 'subscription'
  stripeSessionId:  text('stripeSessionId'),
  stripeCustomerId: text('stripeCustomerId'),
  paid:             boolean('paid').notNull().default(false),
  paidAt:           timestamp('paidAt', { withTimezone: true }),
  pdfSent:          boolean('pdfSent').notNull().default(false),
  createdAt:        timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
})

export type Analysis = typeof analyses.$inferSelect
export type NewAnalysis = typeof analyses.$inferInsert
