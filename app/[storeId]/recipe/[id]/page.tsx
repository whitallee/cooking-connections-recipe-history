import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import SavePhotoButton from '@/components/SavePhotoButton'
import ShareButton from '@/components/ShareButton'
import type { Ingredient } from '@/lib/supabase/types'

export default async function CustomerRecipePage({
  params,
}: {
  params: Promise<{ storeId: string; id: string }>
}) {
  const { storeId, id } = await params
  const admin = createAdminClient()

  const [{ data: recipe }, { data: store }] = await Promise.all([
    admin.from('recipes').select('*').eq('id', id).eq('store_id', storeId).single(),
    admin.from('stores').select('name').eq('id', storeId).single(),
  ])

  if (!recipe) notFound()

  const slug = recipe.title.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Store header */}
      {store && (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            {store.name}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900">Recipe History</h2>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href={`/${storeId}`} className="hover:text-zinc-900 transition-colors">
          ← Back to recipes
        </Link>
      </nav>

      {/* Title */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold text-zinc-900">{recipe.title}</h1>
          <ShareButton title={recipe.title} />
        </div>
        <p className="mt-1 text-sm text-zinc-500">{recipe.recipe_date}</p>
        {recipe.description && (
          <p className="mt-3 text-zinc-600">{recipe.description}</p>
        )}
      </div>

      {/* Food photo */}
      {recipe.thumbnail_url && (
        <Image
          src={recipe.thumbnail_url}
          alt={recipe.title}
          width={900}
          height={600}
          className="mb-6 w-full rounded-xl object-cover max-h-96"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      )}

      {/* Meta row */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm text-zinc-600">
        {recipe.servings && (
          <span className="flex items-center gap-1">
            <span className="text-zinc-400">Serves</span> {recipe.servings}
          </span>
        )}
        {recipe.prep_time && (
          <span className="flex items-center gap-1">
            <span className="text-zinc-400">Prep</span> {recipe.prep_time}
          </span>
        )}
        {recipe.cook_time && (
          <span className="flex items-center gap-1">
            <span className="text-zinc-400">Cook</span> {recipe.cook_time}
          </span>
        )}
      </div>

      {/* Tags */}
      {recipe.tags?.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1">
          {(recipe.tags as string[]).map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Ingredients + Instructions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        {recipe.ingredients?.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">Ingredients</h2>
            <ul className="flex flex-col gap-2">
              {(recipe.ingredients as Ingredient[]).map((ing, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="w-24 shrink-0 text-zinc-400">
                    {ing.quantity} {ing.unit}
                  </span>
                  <span className="text-zinc-700">{ing.item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe.instructions && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">Instructions</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
              {recipe.instructions}
            </p>
          </div>
        )}
      </div>

      {/* Recipe card + save buttons */}
      {(recipe.image_url || recipe.thumbnail_url) && (
        <div className="mt-10 border-t border-zinc-200 pt-8">
          {recipe.image_url && (
            <div className="mb-6">
              <h2 className="mb-3 text-base font-semibold text-zinc-900">
                Recipe card
              </h2>
              <Image
                src={recipe.image_url}
                alt="Recipe card"
                width={800}
                height={1050}
                className="w-full rounded-lg border border-zinc-200"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {recipe.image_url && (
              <SavePhotoButton
                url={recipe.image_url}
                filename={`${slug}-recipe-card.jpg`}
                label="Save recipe card"
              />
            )}
            {recipe.thumbnail_url && (
              <SavePhotoButton
                url={recipe.thumbnail_url}
                filename={`${slug}-photo.jpg`}
                label="Save food photo"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
