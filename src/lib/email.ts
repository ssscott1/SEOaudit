import nodemailer from 'nodemailer'

function createTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS &&
      process.env.SMTP_HOST !== 'smtp.ethereal.email') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  // Ethereal fallback for development
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.SMTP_USER || 'ethereal@example.com',
      pass: process.env.SMTP_PASS || 'etherealpass',
    },
  })
}

export async function sendReportEmail(params: {
  to: string
  name: string
  url: string
  score: number
  reportId: string
  pdfBuffer?: Buffer
}): Promise<void> {
  const { to, name, url, score, reportId, pdfBuffer } = params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const reportUrl = `${baseUrl}/report/${reportId}`

  const transport = createTransport()

  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.FROM_EMAIL || 'reports@seoauditpro.com',
    to,
    subject: `Your SEO Audit Report — Score: ${score}/100`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your SEO Audit Report</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0d9488;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:bold;">SEO Audit Pro</h1>
              <p style="color:#ccfbf1;margin:8px 0 0;font-size:14px;">Your full audit report is ready</p>
            </td>
          </tr>
          <!-- Score -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:14px;margin:0 0 8px;">Overall SEO Score</p>
              <div style="display:inline-block;background-color:#0f172a;border-radius:50%;width:120px;height:120px;line-height:120px;text-align:center;border:4px solid ${score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'};">
                <span style="color:#f8fafc;font-size:36px;font-weight:bold;">${score}</span>
              </div>
              <p style="color:#94a3b8;font-size:14px;margin:8px 0 0;">out of 100</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="color:#f8fafc;font-size:16px;margin:0 0 16px;">Hi ${name || 'there'},</p>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Your SEO audit for <strong style="color:#f8fafc;">${url}</strong> is complete.
                Your site scored <strong style="color:${score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'};">${score}/100</strong>.
              </p>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Your full report includes prioritised fix recommendations, AI search optimisation analysis, competitor insights, and a 90-day action plan.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:8px 0;">
                    <a href="${reportUrl}" style="display:inline-block;background-color:#0d9488;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;">
                      View Full Report
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${pdfBuffer ? `
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="color:#94a3b8;font-size:14px;margin:0;">A PDF copy of your report is attached to this email.</p>
            </td>
          </tr>
          ` : ''}
          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a;padding:24px 40px;text-align:center;">
              <p style="color:#475569;font-size:13px;margin:0;">SEO Audit Pro · ${new Date().getFullYear()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }

  if (pdfBuffer) {
    mailOptions.attachments = [
      {
        filename: `seo-audit-report-${reportId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ]
  }

  try {
    const info = await transport.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    // Log preview URL for Ethereal
    if (info.messageId && process.env.SMTP_HOST === 'smtp.ethereal.email') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    }
  } catch (err) {
    console.error('Failed to send email:', err)
    // Don't throw — email failure should not break the webhook flow
  }
}
