# BookList

Track what you're reading and build a mood playlist for every book. Part reading tracker, part mixtape — inspired by Goodreads, Spotify, and Letterboxd.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **PostgreSQL** + **Prisma 7** (with the `prisma-client` generator and `@prisma/adapter-pg`)
- **NextAuth.js (Auth.js) v5** — email/password (Credentials provider), route protection via `proxy.ts`
- **Tailwind CSS v4** (CSS-first theme in `app/globals.css`) + Radix UI primitives + Framer Motion
- **Google Books API** for book search/metadata
- **iTunes Search API** for song search when building playlists (free, no auth/key required)
- **Gemini API** (`gemini-2.5-flash`, structured JSON output) for AI-generated mood playlists and song suggestions — free tier, no billing required

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start PostgreSQL.** If you don't already have it running locally:

   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   createdb booklist_dev
   ```

3. **Configure environment variables.** Copy `.env.example` to `.env` and fill in:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — point it at your local `booklist_dev` database.
   - `AUTH_SECRET` — generate one with `openssl rand -base64 32`.
   - `GOOGLE_BOOKS_API_KEY` — optional. Search works without it, but a free key
     (from the [Google Cloud Console](https://console.cloud.google.com/), enabling the
     Books API) raises the rate limit well above the shared anonymous quota.
   - `GEMINI_API_KEY` — required for AI playlist generation ("Generate with AI"
     and the "AI song recommendations" panel while editing a playlist). Get a
     free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
     (no credit card needed). Without it, those two features show an error but
     manual playlist creation is unaffected.

4. **Run migrations and seed demo data**

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

   This creates a demo account: `demo@booklist.app` / `password123`, with a few
   books across all three shelves and two sample playlists.

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `app/` — routes (App Router). Most pages are async Server Components that read
  data directly via `lib/data/*` and `lib/prisma.ts`.
- `lib/actions/` — Server Actions for mutations (auth, library, playlists, profile).
- `lib/data/` — read-side data access (library grouping, reading stats, book lookups).
- `lib/google-books.ts` — Google Books API client, normalizes results into the
  shape stored on `Book`.
- `lib/itunes.ts` — iTunes Search API client for song search (title, artist,
  album art, 30-second preview) when building playlists.
- `lib/gemini.ts` — Gemini API client; generates a full playlist (title,
  description, 10-15 songs with reasons) or a small batch of song suggestions
  from a book's title/authors/genres/description, using structured JSON output
  (`responseJsonSchema` generated from a Zod schema) so responses parse reliably.
- `lib/ai-playlist.ts` — cross-references each AI-suggested song against the
  iTunes Search client to attach real album art/preview/link before it reaches
  the UI. `lib/actions/ai-playlist.ts` has the corresponding Server Actions.
- `lib/data/people.ts` — read-side data for the People directory and public
  profile/playlist views.
- `lib/data/friends.ts` / `lib/actions/friends.ts` — mutual friend requests
  (send, accept, decline/unfriend) backed by the `FriendRequest` model.
- `components/` — UI components; anything interactive is a Client Component
  (`"use client"`), pages themselves stay server-rendered where possible.
- `prisma/schema.prisma` — data model: `User`, `Book` (cached from Google Books
  on first search/add), `UserBook` (a book's shelf status per user), `Playlist`
  (optionally labeled `Instrumental` / `Has Lyrics` / `Mixed` via `lyricsType`), `Song`
  (optional `reason` field, set when a song came from an AI suggestion).
- `proxy.ts` — Next.js 16's replacement for `middleware.ts`; protects all routes
  except the landing page, login, and signup.

## Notes

- Every account is publicly visible to other logged-in users via the "People"
  directory (`/people`) — there's no private/public toggle yet. A person's
  public page (`/people/[userId]`) shows their bio, library shelves,
  playlists (not reading stats), and friends list; both the library and
  playlist views there are read-only. Your own friends list is also shown
  on `/profile`.
- Friending is a mutual request/accept relationship (like Goodreads, not a
  one-way follow) and is purely a social layer — it doesn't change what's
  visible, since profiles are already public to everyone. `/people` shows
  incoming requests, your friends, and everyone else in separate sections.
- Book covers are proxied through `next/image`; `next.config.ts` allow-lists
  `books.google.com` as a remote image source.
- Profile pictures are stored on the local filesystem under `public/uploads/`
  for now — swap `app/api/upload/route.ts` for a cloud bucket (S3, Cloudinary,
  Supabase Storage) before deploying anywhere without a persistent disk.
- AI playlist generation ("Generate with AI" on a book page, and the "AI song
  recommendations" panel inside the manual playlist editor) never auto-saves
  anything. Both flows show the AI's suggestions — title, description, and
  each song with a 1-2 sentence reason it fits — and require an explicit
  action (checking songs off + "Create playlist", or "Add" per song) before
  anything is written. Manual playlist creation and the iTunes song search are
  entirely unchanged by this. Song matches against real tracks (album art,
  preview, link) are best-effort iTunes lookups by title + artist; if nothing
  matches, the song is still addable with just the AI's title/artist/reason.
- `lib/gemini.ts` uses `gemini-2.5-flash`, not the newer `gemini-3.5-flash` —
  the newer model returned frequent `503 UNAVAILABLE` ("high demand") errors
  during testing, while 2.5-flash was fast (~1-20s) and reliable. Worth
  revisiting if that availability improves. `httpOptions` on each call caps
  retries/timeout so a slow or overloaded model surfaces the app's own
  friendly error message within ~30-60s instead of hanging for minutes on the
  SDK's default 5-attempt backoff.
- Song search uses the iTunes Search API rather than Spotify or Apple Music:
  Spotify requires the Developer app's owner account to have an active
  Premium subscription just to call its Search endpoint (even for app-level
  requests), and Apple Music API requires a paid Apple Developer Program
  membership ($99/year) with no free tier. iTunes Search is free, unauthenticated,
  and still returns rich metadata (artwork, 30-second preview, a link to open
  in Apple Music) — worth knowing if revisiting music providers later.
