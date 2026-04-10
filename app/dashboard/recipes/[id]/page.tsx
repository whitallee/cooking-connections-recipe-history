import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Ingredient } from '@/lib/supabase/types'
import LogServingButton from './LogServingButton'

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const [{ data: recipe }, { data: profile }] = await Promise.all([
    supabase.from('recipes').select('*').eq('id', id).single(),
    user ? admin.from('profiles').select('store_id').eq('id', user.id).single() : Promise.resolve({ data: null }),
  ])

  if (!recipe) notFound()

  const isOwner = recipe.uploaded_by === user?.id
  const isSameStore = profile?.store_id === recipe.store_id
  const today = new Date().toISOString().split('T')[0]
  const servedDates: string[] = (recipe.served_dates ?? []).slice().sort().reverse()
  const alreadyServedToday = servedDates.includes(today)

  const featuredActive =
    recipe.is_featured &&
    (!recipe.featured_end_date || new Date(recipe.featured_end_date) >= new Date())

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/dashboard/recipes"
        className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        ← My Recipes
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-zinc-900">{recipe.title}</h1>
            {featuredActive && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Featured
              </span>
            )}
          </div>
          {recipe.description && (
            <p className="text-sm text-zinc-500">{recipe.description}</p>
          )}
        </div>
        {isOwner && (
          <Link
            href={`/dashboard/recipes/${id}/edit`}
            className="shrink-0 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Edit
          </Link>
        )}
      </div>

      {/* Served dates */}
      <div className="rounded-lg border border-zinc-200 bg-white px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Served on ({servedDates.length})
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {servedDates.length > 0 ? (
                servedDates.map((d) => (
                  <span
                    key={d}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                  >
                    {d}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-400">No dates logged yet.</span>
              )}
            </div>
          </div>
          {isSameStore && (
            alreadyServedToday ? (
              <p className="shrink-0 text-sm text-zinc-400">Already logged today</p>
            ) : (
              <LogServingButton recipeId={id} />
            )
          )}
        </div>
      </div>

      {/* Recipe content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {recipe.thumbnail_url && (
            <img
              src={recipe.thumbnail_url}
              alt={recipe.title}
              className="w-full rounded-lg object-cover"
            />
          )}

          <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
            {recipe.servings && <span>Serves: {recipe.servings}</span>}
            {recipe.prep_time && <span>Prep: {recipe.prep_time}</span>}
            {recipe.cook_time && <span>Cook: {recipe.cook_time}</span>}
          </div>

          {recipe.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(recipe.tags as string[]).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {recipe.promo_products?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Featured products
              </p>
              <div className="flex flex-wrap gap-1">
                {(recipe.promo_products as string[]).map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recipe.image_url && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Recipe card
              </p>
              <img
                src={recipe.image_url}
                alt="Recipe card"
                className="w-full rounded-lg border border-zinc-200"
              />
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {recipe.ingredients?.length > 0 && (
            <div>
              <h2 className="mb-3 font-semibold text-zinc-900">Ingredients</h2>
              <ul className="flex flex-col gap-1">
                {(recipe.ingredients as Ingredient[]).map((ing, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-700">
                    <span className="w-24 shrink-0 text-zinc-400">
                      {ing.quantity} {ing.unit}
                    </span>
                    <span>{ing.item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipe.instructions && (
            <div>
              <h2 className="mb-3 font-semibold text-zinc-900">Instructions</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                {recipe.instructions}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
