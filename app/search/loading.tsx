export default function SearchLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-surface-hover" />
      <div className="mt-2 h-5 w-72 animate-pulse rounded-lg bg-surface-hover" />
      <div className="mt-6 h-12 w-full max-w-xl animate-pulse rounded-full bg-surface-hover" />

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-surface-hover" />
            <div className="h-4 w-full animate-pulse rounded bg-surface-hover" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-surface-hover" />
          </div>
        ))}
      </div>
    </div>
  );
}
