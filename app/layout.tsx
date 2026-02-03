import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import './globals.css'

const rabar = localFont({
  src: '../public/fonts/Rabar.ttf',
  variable: '--font-rabar',
  display: 'swap',
})

const notoNaskhArabic = localFont({
  src: '../public/fonts/NotoNaskhArabic.ttf',
  variable: '--font-noto-naskh',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Veterinarians Syndicate in Kurdistan Region of Iraq',
  description: 'Healthy Animals. Safe Food. Stronger Communities - Complete pet health management and digital passport solution',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <html lang="en">
      <body className={`${rabar.variable} ${notoNaskhArabic.variable}`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

