'use client'

import { useState, useRef, useEffect } from 'react'

export default function FilterPanel({ from, to }: { from?: string; to?: string }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasDateFilter = !!(from || to)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Filter toggle button — replace the <span> with your SVG */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle date filter"
        className={`relative flex h-[42px] w-[42px] items-center justify-center rounded-lg border transition-colors ${
          hasDateFilter
            ? 'border-zinc-900 bg-zinc-900 text-white'
            : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
        }`}
      >
        {/* ── SVG placeholder ── */}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5h20"/><path d="M6 12h12"/><path d="M9 19h6"/></svg>
        {/* ─────────────────── */}
        {hasDateFilter && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-400 ring-1 ring-white" />
        )}
      </button>

      {/* Dropdown panel — inputs inside a hidden container still submit with the form */}
      <div
        className={`absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg ${
          open ? '' : 'hidden'
        }`}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Filter by date served
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500">From</label>
            <input
              name="from"
              type="date"
              defaultValue={from ?? ''}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500">To</label>
            <input
              name="to"
              type="date"
              defaultValue={to ?? ''}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>
        <button
          type="submit"
          onClick={() => setOpen(false)}
          className="mt-4 w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
