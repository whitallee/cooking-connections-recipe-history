'use client'

import { useState } from 'react'
import { deleteRecipe } from './actions'

export default function DeleteButton({ recipeId }: { recipeId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteRecipe(recipeId)
    if (result?.error) {
      setError(result.error)
      setDeleting(false)
      setConfirming(false)
    }
    // on success, deleteRecipe redirects — no need to handle it here
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <span className="text-sm text-zinc-500">Delete this recipe?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => { setConfirming(false); setError('') }}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="shrink-0 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
    >
      Delete
    </button>
  )
}
