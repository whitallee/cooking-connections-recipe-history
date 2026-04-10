'use client'

import { useActionState } from 'react'
import { changePassword } from './actions'

export default function ChangePasswordPage() {
  const [state, formAction, isPending] = useActionState(changePassword, null)

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold text-zinc-900">
          Set your password
        </h1>
        <p className="mb-6 text-sm text-zinc-500">
          Your account was created with a temporary password. Please set a new
          one before continuing.
        </p>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700"
            >
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="At least 8 characters"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirm"
              className="text-sm font-medium text-zinc-700"
            >
              Confirm password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              autoComplete="new-password"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Set password'}
          </button>
        </form>
      </div>
    </div>
  )
}
