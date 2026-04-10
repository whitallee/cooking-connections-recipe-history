import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MobileNav, { type NavItem } from '@/components/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('must_change_password, role')
    .eq('id', user.id)
    .single()

  if (profile?.must_change_password) redirect('/change-password')

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <MobileNav
        title="Dashboard"
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Upload Recipe', href: '/dashboard/upload' },
          { label: 'My Recipes', href: '/dashboard/recipes' },
          ...(profile?.role === 'admin'
            ? [{ divider: true } as NavItem, { label: 'Admin Panel', href: '/admin' }]
            : []),
        ]}
      />

      <div className="flex gap-8">
        <aside className="hidden w-48 shrink-0 flex-col gap-1 md:flex">
          <nav className="flex flex-col gap-1 text-sm">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard/upload"
              className="rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              Upload Recipe
            </Link>
            <Link
              href="/dashboard/recipes"
              className="rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              My Recipes
            </Link>
            {profile?.role === 'admin' && (
              <>
                <div className="my-2 border-t border-zinc-200" />
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                >
                  Admin Panel
                </Link>
              </>
            )}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
