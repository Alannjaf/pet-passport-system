import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Allow access from mobile devices and tunneling services
  allowedDevOrigins: [
    '192.168.0.105',
    // Allow localhost.run tunnels (*.lhr.life pattern)
    /.*\.lhr\.life$/,
  ],
}

export default withNextIntl(nextConfig)

