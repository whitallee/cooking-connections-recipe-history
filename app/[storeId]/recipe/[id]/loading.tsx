export default function RecipeLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-8">
      {/* Store header */}
      <div className="mb-6">
        <div className="h-3 w-16 rounded bg-zinc-200" />
        <div className="mt-1 h-6 w-36 rounded bg-zinc-200" />
      </div>

      {/* Breadcrumb */}
      <div className="mb-6 h-4 w-28 rounded bg-zinc-200" />

      {/* Title block */}
      <div className="mb-6">
        <div className="h-8 w-3/4 rounded bg-zinc-200" />
        <div className="mt-2 h-4 w-24 rounded bg-zinc-200" />
      </div>

      {/* Photo */}
      <div className="mb-6 h-72 w-full rounded-xl bg-zinc-200 sm:h-96" />

      {/* Meta row */}
      <div className="mb-6 flex gap-4">
        <div className="h-4 w-20 rounded bg-zinc-200" />
        <div className="h-4 w-20 rounded bg-zinc-200" />
        <div className="h-4 w-20 rounded bg-zinc-200" />
      </div>

      {/* Ingredients + Instructions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-2">
          <div className="mb-1 h-5 w-28 rounded bg-zinc-200" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-zinc-200" />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div className="mb-1 h-5 w-28 rounded bg-zinc-200" />
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-zinc-200"
              style={{ width: i % 3 === 0 ? '65%' : i % 3 === 1 ? '90%' : '80%' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
