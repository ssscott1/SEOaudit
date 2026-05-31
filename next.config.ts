import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow images from any domain for scraped OG images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Increase body size limit for webhook
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
