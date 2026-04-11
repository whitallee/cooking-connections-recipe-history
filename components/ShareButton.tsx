'use client'

import { useState } from 'react'

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href

    // Use native share sheet when available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled — do nothing
      }
      return
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable — fail silently
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v13"/>
        <path d="m16 6-4-4-4 4"/>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      </svg>
      {copied ? 'Link copied!' : 'Share recipe'}
    </button>
  )
}
