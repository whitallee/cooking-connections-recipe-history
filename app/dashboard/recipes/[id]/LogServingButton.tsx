'use client'

import { useActionState } from 'react'
import { logServing } from './actions'

type State = { error?: string } | null

export default function LogServingButton({ recipeId }: { recipeId: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async () => logServing(recipeId),
    null
  )

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <form action={formAction}>
      {state?.error && (
        <p className="mb-2 text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
      >
        {pending ? 'Logging…' : `Log serving for today (${today})`}
      </button>
    </form>
  )
}
