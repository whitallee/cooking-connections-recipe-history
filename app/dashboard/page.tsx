import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RecipeFallbackIcon from '@/components/RecipeFallbackIcon'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, store_id, role')
    .eq('id', user!.id)
    .single()

  const { data: recentRecipes } = await supabase
    .from('recipes')
    .select('id, title, recipe_date, thumbnail_url')
    .eq('uploaded_by', user!.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Welcome back, {profile?.full_name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Store {profile?.store_id}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/upload"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Upload Recipe Card
        </Link>
        <Link
          href="/dashboard/recipes"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          My Recipes
        </Link>
        <Link
          href={`/${profile?.store_id}`}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          View Store Page
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Recent Uploads
        </h2>

        {recentRecipes && recentRecipes.length > 0 ? (
          <div className="flex flex-col divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
            {recentRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/dashboard/recipes/${recipe.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-50 transition-colors"
              >
                {recipe.thumbnail_url ? (
                  <img
                    src={recipe.thumbnail_url}
                    alt={recipe.title}
                    className="h-12 w-12 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <RecipeFallbackIcon className="h-12 w-12 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {recipe.title}
                  </p>
                  <p className="text-xs text-zinc-500">{recipe.recipe_date}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-zinc-500">No recipes uploaded yet.</p>
            <Link
              href="/dashboard/upload"
              className="mt-3 inline-block text-sm font-medium text-zinc-900 underline underline-offset-2"
            >
              Upload your first recipe
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
