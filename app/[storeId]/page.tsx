import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Recipe } from '@/lib/supabase/types'
import RecipeFallbackIcon from '@/components/RecipeFallbackIcon'

function RecipeCard({ recipe, storeId }: { recipe: Partial<Recipe> & { id: string; title: string; recipe_date: string }; storeId: string }) {
  return (
    <Link
      href={`/${storeId}/recipe/${recipe.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all"
    >
      {recipe.thumbnail_url ? (
        <div className="relative h-40 w-full">
          <Image
            src={recipe.thumbnail_url}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      ) : (
        <RecipeFallbackIcon className="h-40 w-full" />
      )}
      <div className="flex flex-col gap-1 p-3">
        <p className="font-medium text-zinc-900 group-hover:text-zinc-700 transition-colors line-clamp-2">
          {recipe.title}
        </p>
        <p className="text-xs text-zinc-400">{recipe.recipe_date}</p>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {(recipe.tags as string[]).slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ storeId: string }>
  searchParams: Promise<{ q?: string; from?: string; to?: string }>
}) {
  const { storeId } = await params
  const { q, from, to } = await searchParams

  const admin = createAdminClient()

  const { data: store } = await admin
    .from('stores')
    .select('id, name')
    .eq('id', storeId)
    .single()

  if (!store) notFound()

  const today = new Date().toISOString().split('T')[0]

  // Featured recipes (active only)
  const { data: featured } = await admin
    .from('recipes')
    .select('id, title, recipe_date, thumbnail_url, tags')
    .eq('store_id', storeId)
    .eq('is_featured', true)
    .or(`featured_end_date.is.null,featured_end_date.gte.${today}`)
    .order('recipe_date', { ascending: false })

  // Archive query — filtered by search params, checks served_dates array for date range
  const { data: recipesRaw } = await admin.rpc('search_store_recipes', {
    p_store_id: storeId,
    p_q: q?.trim() || null,
    p_from: from || null,
    p_to: to || null,
  })
  const recipes = recipesRaw as Array<{ id: string; title: string; recipe_date: string; thumbnail_url: string | null; tags: string[] }> | null

  const hasFilter = !!(q || from || to)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">

      {/* Store header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {store.name}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">Recipe History</h1>
      </div>

      {/* Featured Section */}
      {featured && featured.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
              ★ Currently Featured
            </span>
            <p className="text-sm text-zinc-500">This week&apos;s promoted recipes</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} storeId={storeId} />
            ))}
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <section className="mb-6">
        <form method="GET" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Search input + action buttons */}
          <div className="flex flex-1 gap-2">
            <input
              name="q"
              type="search"
              defaultValue={q ?? ''}
              placeholder="Search recipes…"
              className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              Search
            </button>
            {hasFilter && (
              <Link
                href={`/${storeId}`}
                className="shrink-0 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Clear
              </Link>
            )}
          </div>

          {/* Date filters — own row on mobile, inline on sm+ */}
          <div className="flex items-center gap-2">
            <input
              name="from"
              type="date"
              defaultValue={from ?? ''}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <span className="text-sm text-zinc-400">to</span>
            <input
              name="to"
              type="date"
              defaultValue={to ?? ''}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </form>
      </section>

      {/* Recipe Archive */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {hasFilter ? 'Results' : 'All Recipes'}
          {recipes && (
            <span className="ml-2 font-normal normal-case text-zinc-400">
              ({recipes.length})
            </span>
          )}
        </h2>

        {recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} storeId={storeId} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">
              {hasFilter
                ? 'No recipes found. Try a different search.'
                : 'No recipes yet — check back soon!'}
            </p>
            {hasFilter && (
              <Link
                href={`/${storeId}`}
                className="mt-3 inline-block text-sm font-medium text-zinc-900 underline underline-offset-2"
              >
                Clear search
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
