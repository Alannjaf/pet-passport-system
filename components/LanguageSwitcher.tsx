'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LanguageSwitcher() {
  const router = useRouter()
  const [currentLocale, setCurrentLocale] = useState('en')

  const changeLanguage = (newLocale: string) => {
    setCurrentLocale(newLocale)
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
      router.refresh()
    }
  }

  return (
    <div className="flex gap-2 items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded transition ${
          currentLocale === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        className={`px-3 py-1 rounded transition ${
          currentLocale === 'ar'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        AR
      </button>
      <button
        onClick={() => changeLanguage('ckb')}
        className={`px-3 py-1 rounded transition ${
          currentLocale === 'ckb'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        CKB
      </button>
    </div>
  )
}

