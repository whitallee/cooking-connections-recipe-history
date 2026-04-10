import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RecipeFallbackIcon from '@/components/RecipeFallbackIcon'

export default async function MyRecipesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, recipe_date, thumbnail_url, image_url, is_featured, featured_end_date')
    .eq('uploaded_by', user!.id)
    .order('recipe_date', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">My Recipes</h1>
        <Link
          href="/dashboard/upload"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Upload new
        </Link>
      </div>

      {recipes && recipes.length > 0 ? (
        <div className="flex flex-col divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
          {recipes.map((recipe) => {
            const featuredActive =
              recipe.is_featured &&
              (!recipe.featured_end_date ||
                new Date(recipe.featured_end_date) >= new Date())

            return (
              <Link
                key={recipe.id}
                href={`/dashboard/recipes/${recipe.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-50 transition-colors"
              >
                {recipe.thumbnail_url ? (
                  <img
                    src={recipe.thumbnail_url}
                    alt={recipe.title}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <RecipeFallbackIcon className="h-14 w-14 shrink-0" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900">
                    {recipe.title}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">{recipe.recipe_date}</p>
                </div>

                {featuredActive && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    Featured
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
          <p className="text-sm text-zinc-500">You haven't uploaded any recipes yet.</p>
          <Link
            href="/dashboard/upload"
            className="mt-3 inline-block text-sm font-medium text-zinc-900 underline underline-offset-2"
          >
            Upload your first recipe
          </Link>
        </div>
      )}
    </div>
  )
}
