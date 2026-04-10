import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
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
          <Image
            src="/cookingconnections.jpeg"
            alt="Cooking Connections logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className='flex flex-col'>
            <span className="text-lg font-semibold text-zinc-900">
            Cooking Connections
            </span>
            <span className="text-sm font-semibold text-zinc-700">
            Recipe History
            </span>
          </div>
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
