'use client'

import { useState } from 'react'
import Link from 'next/link'

export type NavItem = { label: string; href: string } | { divider: true }

export default function MobileNav({
  items,
  title,
}: {
  items: NavItem[]
  title: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-4 md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Menu
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white px-4 py-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900">{title}</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-1 text-sm">
              {items.map((item, i) =>
                'divider' in item ? (
                  <div key={i} className="my-2 border-t border-zinc-200" />
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
