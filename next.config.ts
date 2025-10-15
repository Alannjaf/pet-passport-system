import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Allow access from mobile devices on the same network
  allowedDevOrigins: ['192.168.0.105'],
}

export default withNextIntl(nextConfig)

