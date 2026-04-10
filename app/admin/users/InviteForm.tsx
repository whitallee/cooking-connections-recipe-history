'use client'

import { useActionState } from 'react'
import { invitePartner } from './actions'
import type { Store } from '@/lib/supabase/types'

type InviteState =
  | { error: string }
  | { success: true; email: string; tempPassword: string }
  | null

export default function InviteForm({ stores }: { stores: Store[] }) {
  const [state, formAction, isPending] = useActionState<InviteState, FormData>(
    invitePartner,
    null
  )

  if (state && 'success' in state) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-5">
        <p className="font-medium text-green-800">Account created!</p>
        <p className="mt-1 text-sm text-green-700">
          Share these credentials with the new partner:
        </p>
        <div className="mt-3 rounded-md bg-white p-4 font-mono text-sm text-zinc-800 border border-green-200">
          <p>
            <span className="text-zinc-500">Email: </span>
            {state.email}
          </p>
          <p className="mt-1">
            <span className="text-zinc-500">Temp password: </span>
            {state.tempPassword}
          </p>
        </div>
        <p className="mt-3 text-xs text-green-700">
          They will be required to change their password on first login.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
        >
          Invite another
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="full_name" className="text-sm font-medium text-zinc-700">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Jane Smith"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="jane@example.com"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="store_id" className="text-sm font-medium text-zinc-700">
            Store
          </label>
          <select
            id="store_id"
            name="store_id"
            required
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Select a store…</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} ({store.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-zinc-700">
            Temporary password
          </label>
          <input
            id="password"
            name="password"
            type="text"
            required
            minLength={8}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Min. 8 characters"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="confirm_password"
            className="text-sm font-medium text-zinc-700"
          >
            Confirm password
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="text"
            required
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Repeat password"
          />
        </div>
      </div>

      {state && 'error' in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Creating account…' : 'Create account'}
        </button>
      </div>
    </form>
  )
}
