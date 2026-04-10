'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Store {
  id: string
  name: string
}

export default function StoreSearch({ stores }: { stores: Store[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? stores.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.id.includes(query.trim())
      )
    : stores

  return (
    <div className="flex flex-col gap-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by store name or number…"
        autoFocus
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />

      {filtered.length > 0 ? (
        <div className="flex flex-col divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {filtered.map((store) => (
            <Link
              key={store.id}
              href={`/${store.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors"
            >
              <div>
                <p className="font-medium text-zinc-900">{store.name}</p>
                <p className="text-xs text-zinc-400">Store #{store.id}</p>
              </div>
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-zinc-400">
          No stores found matching &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  )
}
