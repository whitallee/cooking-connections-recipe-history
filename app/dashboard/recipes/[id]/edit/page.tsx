import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import EditForm from './EditForm'
import type { Ingredient } from '@/lib/supabase/types'

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const admin = createAdminClient()
  const [{ data: recipe }, { data: profile }] = await Promise.all([
    admin.from('recipes').select('*').eq('id', id).single(),
    admin.from('profiles').select('store_id, role').eq('id', user.id).single(),
  ])

  if (!recipe) notFound()

  const canEdit =
    recipe.uploaded_by === user.id ||
    (profile?.role === 'admin' && profile?.store_id === recipe.store_id)

  if (!canEdit) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/dashboard/recipes/${id}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          ← Back to recipe
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">Edit recipe</h1>
      </div>

      <EditForm
        recipeId={id}
        initial={{
          title: recipe.title,
          description: recipe.description ?? '',
          servings: recipe.servings ?? '',
          prepTime: recipe.prep_time ?? '',
          cookTime: recipe.cook_time ?? '',
          instructions: recipe.instructions ?? '',
          ingredients: (recipe.ingredients as Ingredient[]) ?? [],
          tags: (recipe.tags as string[]).join(', '),
          promoProducts: (recipe.promo_products as string[]).join(', '),
          thumbnailUrl: recipe.thumbnail_url ?? '',
          imageUrl: recipe.image_url ?? '',
        }}
      />
    </div>
  )
}
