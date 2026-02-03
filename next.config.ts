import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
experimental: {
    optimizePackageImports: ["qrcode", "react-datepicker", "react-easy-crop"],
  },
  // Allow access from mobile devices and tunneling services
  // Note: Add your specific localhost.run domain here when you get it
  allowedDevOrigins: [
    "192.168.0.105",
    "699aa605669b88.lhr.life", // Current localhost.run domain
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
};

export default withNextIntl(nextConfig);
