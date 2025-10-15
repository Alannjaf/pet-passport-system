import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Allow access from mobile devices and tunneling services
  // Note: Add your specific localhost.run domain here when you get it
  allowedDevOrigins: [
    "192.168.0.105",
    "2f47ede227acd2.lhr.life", // Add your specific localhost.run domain
  ],
};

export default withNextIntl(nextConfig);
