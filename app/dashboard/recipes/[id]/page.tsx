import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Ingredient } from '@/lib/supabase/types'

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

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (!recipe) notFound()

  const isOwner = recipe.uploaded_by === user?.id

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{recipe.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{recipe.recipe_date}</p>
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

          {recipe.description && (
            <p className="text-sm text-zinc-600">{recipe.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-sm text-zinc-600">
            {recipe.servings && <span>Serves: {recipe.servings}</span>}
            {recipe.prep_time && <span>Prep: {recipe.prep_time}</span>}
            {recipe.cook_time && <span>Cook: {recipe.cook_time}</span>}
          </div>

          {recipe.promo_products?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Featured products
              </p>
              <div className="flex flex-wrap gap-1">
                {recipe.promo_products.map((p: string) => (
                  <span
                    key={p}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
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
                    <span className="shrink-0 text-zinc-400">
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

          {recipe.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
