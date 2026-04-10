import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold text-zinc-100">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
        This page got left on the back burner
      </h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        We searched every pot and pan but couldn&apos;t find what you&apos;re
        looking for. It may have been moved or the link might be a little off.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
      >
        Back to home
      </Link>
    </div>
  )
}
