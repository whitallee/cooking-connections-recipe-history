import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Use the admin client here so the role check bypasses RLS entirely.
  // The recursive profiles_admin_read RLS policy causes silent failures
  // when querying profiles from within a profiles policy.
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <MobileNav
        title="Admin"
        items={[
          { label: 'Partners', href: '/admin/users' },
          { label: 'Recipes', href: '/admin/recipes' },
          { divider: true },
          { label: 'My Dashboard', href: '/dashboard' },
        ]}
      />

      <div className="flex gap-8">
        <aside className="hidden w-48 shrink-0 flex-col gap-1 md:flex">
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Admin
          </p>
          <nav className="flex flex-col gap-1 text-sm">
            <Link
              href="/admin/users"
              className="rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              Partners
            </Link>
            <Link
              href="/admin/recipes"
              className="rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              Recipes
            </Link>
            <div className="my-2 border-t border-zinc-200" />
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              My Dashboard
            </Link>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
