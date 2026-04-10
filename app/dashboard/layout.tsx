import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('must_change_password, role')
    .eq('id', user.id)
    .single()

  if (profile?.must_change_password) redirect('/change-password')

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-8">
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
  )
}
