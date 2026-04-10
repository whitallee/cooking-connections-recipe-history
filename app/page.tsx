import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import StoreSearch from './StoreSearch'

export default async function Home() {
  const admin = createAdminClient()
  const { data: stores } = await admin
    .from('stores')
    .select('id, name')
    .order('name')

  // Single store — skip the finder and go straight to it
  if (stores?.length === 1) {
    redirect(`/${stores[0].id}`)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Find your store</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Search by store name or number to browse recipes.
        </p>
      </div>
      <StoreSearch stores={stores ?? []} />
    </div>
  )
}
