import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SignOutButton from './SignOutButton'

export default async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          {/* Logo placeholder — replace with <Image src="/logo.png" ... /> once you have the asset */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-[10px] font-semibold text-zinc-400">
            LOGO
          </div>
          <span className="text-lg font-semibold text-zinc-900">
            Cooking Connections
          </span>
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Partner Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
