import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        <span className="rounded-full bg-sage/20 px-4 py-1.5 text-sm font-medium text-sage">
          Every book has a soundtrack
        </span>
        <h1 className="font-display max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
          Track what you&apos;re reading. Build the mood for every story.
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
          BookList is a cozy home for your library and the playlists that capture
          each book&apos;s atmosphere — part reading tracker, part mixtape.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {session ? (
            <Link
              href="/library"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
            >
              Go to your library
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent-hover"
              >
                Start your library
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-3">
        {[
          {
            title: "Your shelves",
            body: "Sort every book into Want to Read, Currently Reading, or Finished.",
          },
          {
            title: "A playlist per book",
            body: "Pair songs to a story's mood and atmosphere, track by track.",
          },
          {
            title: "Your reading story",
            body: "See your stats, genres, and taste take shape over time.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-surface p-6 text-left shadow-sm"
          >
            <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
