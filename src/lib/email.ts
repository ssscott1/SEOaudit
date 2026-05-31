import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

async function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (host && user && pass && host !== 'smtp.ethereal.email') {
    // Use configured SMTP
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: { user, pass },
    })
  } else {
    // Use Ethereal for development
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
    console.log('Using Ethereal email. Preview URL will be logged.')
  }

  return transporter
}

export async function sendReportEmail({
  to,
  name,
  url,
  reportId,
  pdfBuffer,
}: {
  to: string
  name: string
  url: string
  reportId: string
  pdfBuffer: Buffer
}) {
  const transport = await getTransporter()
  const fromEmail = process.env.FROM_EMAIL || 'reports@seoauditpro.com'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const info = await transport.sendMail({
    from: `"SEO Audit Pro" <${fromEmail}>`,
    to,
    subject: `Your SEO Audit Report for ${url}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0F172A;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F172A;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1E293B;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#0D9488;padding:30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">SEO Audit Pro</h1>
              <p style="margin:8px 0 0;color:#99f6e4;font-size:16px;">Your Full Report is Ready</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#F8FAFC;font-size:18px;margin:0 0 16px;">Hi ${name || 'there'},</p>
              <p style="color:#94A3B8;font-size:16px;line-height:1.6;margin:0 0 24px;">
                Your comprehensive SEO audit for <strong style="color:#0D9488;">${url}</strong> is ready.
                We've analyzed over 50 SEO signals and run a full AI search optimization review.
              </p>

              <div style="background:#0F172A;border-radius:8px;padding:24px;margin-bottom:24px;border:1px solid #334155;">
                <h2 style="color:#F8FAFC;font-size:18px;margin:0 0 16px;">What's included in your report:</h2>
                <ul style="color:#94A3B8;margin:0;padding-left:20px;line-height:2;">
                  <li>Complete SEO score breakdown</li>
                  <li>Full prioritized issue list with exact fixes</li>
                  <li>AI search optimization analysis (ChatGPT, Perplexity, Claude)</li>
                  <li>3 competitor analysis suggestions</li>
                  <li>90-day step-by-step action plan</li>
                </ul>
              </div>

              <div style="text-align:center;margin-bottom:32px;">
                <a href="${baseUrl}/report/${reportId}"
                   style="display:inline-block;background:#0D9488;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:18px;font-weight:bold;">
                  View Full Report Online
                </a>
              </div>

              <p style="color:#94A3B8;font-size:14px;margin:0 0 8px;">
                Your PDF report is also attached to this email for offline reference.
              </p>

              <hr style="border:none;border-top:1px solid #334155;margin:24px 0;">

              <p style="color:#475569;font-size:13px;margin:0;text-align:center;">
                SEO Audit Pro | Professional SEO Analysis<br>
                <a href="${baseUrl}" style="color:#0D9488;">seoauditpro.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    attachments: [
      {
        filename: `seo-audit-report-${reportId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  })

  // Log preview URL for Ethereal
  const previewUrl = nodemailer.getTestMessageUrl(info)
  if (previewUrl) {
    console.log('Email preview URL:', previewUrl)
  }

  return info
}
