'use client'

import { useState } from 'react'

export default function SavePhotoButton({
  url,
  filename,
  label = 'Save photo',
}: {
  url: string
  filename: string
  label?: string
}) {
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch(url)
      const blob = await response.blob()

      // Use Web Share API on mobile — gives native "Save to Photos" option
      if (navigator.canShare) {
        const file = new File([blob], filename, { type: blob.type })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] })
          setSaving(false)
          return
        }
      }

      // Fallback: trigger browser download
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      // User cancelled share sheet or fetch failed — fail silently
    }
    setSaving(false)
  }

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {saving ? 'Saving…' : label}
    </button>
  )
}
