import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'
import RecipeFallbackIcon from '@/components/RecipeFallbackIcon'
import { featureRecipe, unfeatureRecipe } from './actions'

export default async function AdminRecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('store_id')
    .eq('id', user!.id)
    .single()

  const { data: recipes } = await admin
    .from('recipes')
    .select('id, title, recipe_date, served_dates, thumbnail_url, is_featured, featured_end_date, profiles!uploaded_by(full_name)')
    .eq('store_id', profile!.store_id)
    .order('recipe_date', { ascending: false })

  const today = new Date().toISOString().split('T')[0]

  const featured = recipes?.filter(
    (r) =>
      r.is_featured &&
      (!r.featured_end_date || r.featured_end_date >= today)
  ) ?? []

  const notFeatured = recipes?.filter(
    (r) =>
      !r.is_featured ||
      (r.featured_end_date && r.featured_end_date < today)
  ) ?? []

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Recipes</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage featured recipes shown to customers.
        </p>
      </div>

      {/* Currently featured */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Currently featured
          <span className="ml-2 font-normal normal-case text-zinc-400">
            ({featured.length})
          </span>
        </h2>

        {featured.length > 0 ? (
          <RecipeTable recipes={featured} today={today} />
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-zinc-500">No recipes are currently featured.</p>
          </div>
        )}
      </section>

      {/* All other recipes */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          All recipes
          <span className="ml-2 font-normal normal-case text-zinc-400">
            ({notFeatured.length})
          </span>
        </h2>

        {notFeatured.length > 0 ? (
          <RecipeTable recipes={notFeatured} today={today} />
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-zinc-500">All recipes are currently featured.</p>
          </div>
        )}
      </section>
    </div>
  )
}

type RecipeRow = {
  id: string
  title: string
  recipe_date: string
  served_dates: string[]
  thumbnail_url: string | null
  is_featured: boolean
  featured_end_date: string | null
  profiles: { full_name: string }[] | null
}

function RecipeTable({ recipes, today }: { recipes: RecipeRow[]; today: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
            <th className="px-4 py-3 font-medium text-zinc-600">Recipe</th>
            <th className="px-4 py-3 font-medium text-zinc-600">Served</th>
            <th className="px-4 py-3 font-medium text-zinc-600">Featured until</th>
            <th className="px-4 py-3 font-medium text-zinc-600" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {recipes.map((recipe) => {
            const isFeaturedActive =
              recipe.is_featured &&
              (!recipe.featured_end_date || recipe.featured_end_date >= today)

            return (
              <tr key={recipe.id} className="hover:bg-zinc-50">
                {/* Recipe info */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {recipe.thumbnail_url ? (
                      <Image
                        src={recipe.thumbnail_url}
                        alt={recipe.title}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <RecipeFallbackIcon className="h-10 w-10 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900">{recipe.title}</p>
                      <p className="text-xs text-zinc-400">
                        {recipe.recipe_date}
                        {recipe.profiles?.[0]?.full_name && (
                          <> · {recipe.profiles[0].full_name}</>
                        )}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Served count */}
                <td className="px-4 py-3 text-zinc-600">
                  {(recipe.served_dates as string[]).length}×
                </td>

                {/* Featured controls */}
                <td className="px-4 py-3">
                  {isFeaturedActive ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-zinc-500">
                        {recipe.featured_end_date ?? 'No end date'}
                      </span>
                      <form action={unfeatureRecipe}>
                        <input type="hidden" name="recipe_id" value={recipe.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-500 underline underline-offset-2 hover:text-red-700 transition-colors"
                        >
                          Remove featured
                        </button>
                      </form>
                    </div>
                  ) : (
                    <form action={featureRecipe} className="flex items-center gap-2">
                      <input type="hidden" name="recipe_id" value={recipe.id} />
                      <input
                        type="date"
                        name="featured_end_date"
                        min={today}
                        className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200 transition-colors"
                      >
                        Feature
                      </button>
                    </form>
                  )}
                </td>

                {/* View link */}
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/recipes/${recipe.id}`}
                    className="text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-900 transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
