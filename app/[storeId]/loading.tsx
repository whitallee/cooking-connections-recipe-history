function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-100 bg-white">
      <div className="h-40 bg-zinc-200" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-4 w-full rounded bg-zinc-200" />
        <div className="h-3 w-1/2 rounded bg-zinc-200" />
      </div>
    </div>
  )
}

export default function StoreLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-8">
      {/* Store header */}
      <div className="mb-8">
        <div className="h-3 w-16 rounded bg-zinc-200" />
        <div className="mt-2 h-7 w-44 rounded bg-zinc-200" />
      </div>

      {/* Featured section */}
      <section className="mb-10">
        <div className="mb-4 h-7 w-36 rounded-full bg-zinc-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>

      {/* Search bar */}
      <div className="mb-6 h-10 rounded-lg bg-zinc-200" />

      {/* Section label */}
      <div className="mb-4 h-4 w-24 rounded bg-zinc-200" />

      {/* Recipe grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
