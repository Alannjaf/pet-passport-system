import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  // For now, default to English
  // In a production app, you could read from cookies or URL params
  const locale = 'en'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})

