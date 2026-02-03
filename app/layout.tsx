import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import './globals.css'

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
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

