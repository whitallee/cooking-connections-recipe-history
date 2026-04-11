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
          {/* <Image
            src="/cookingconnectionslogo.png"
            alt="Cooking Connections logo"
            width={40}
            height={40}
            className="rounded-full"
            style={{ width: '40px', height: '40px' }}
          /> */}
          <div className='flex flex-col'>
            <span className="text-lg font-semibold text-zinc-900">
            Recipe History
            </span>
            <span className="text-sm font-semibold text-zinc-700">
            {/* Recipe History */}
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                aria-label="Dashboard"
                title="Dashboard"
                className="text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/>
                  <path d="M6 17h12"/>
                </svg>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              aria-label="Culinary Selling Partner Login"
              title="Culinary Selling Partner Login"
              className="text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/>
                <path d="M6 17h12"/>
              </svg>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
