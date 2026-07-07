# BookList

Track what you're reading and build a mood playlist for every book. Part reading tracker, part mixtape — inspired by Goodreads, Spotify, and Letterboxd.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **PostgreSQL** + **Prisma 7** (with the `prisma-client` generator and `@prisma/adapter-pg`)
- **NextAuth.js (Auth.js) v5** — email/password (Credentials provider), route protection via `proxy.ts`
- **Tailwind CSS v4** (CSS-first theme in `app/globals.css`) + Radix UI primitives + Framer Motion
- **Google Books API** for book search/metadata
- **iTunes Search API** for song search when building playlists (free, no auth/key required)

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
- `lib/data/people.ts` — read-side data for the People directory and public
  profile/playlist views.
- `lib/data/friends.ts` / `lib/actions/friends.ts` — mutual friend requests
  (send, accept, decline/unfriend) backed by the `FriendRequest` model.
- `components/` — UI components; anything interactive is a Client Component
  (`"use client"`), pages themselves stay server-rendered where possible.
- `prisma/schema.prisma` — data model: `User`, `Book` (cached from Google Books
  on first search/add), `UserBook` (a book's shelf status per user), `Playlist`, `Song`.
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
- AI-generated playlists (matching a book's mood automatically) are a natural
  v2 addition — `lib/actions/playlists.ts` is the place to hook that in.
- Song search uses the iTunes Search API rather than Spotify or Apple Music:
  Spotify requires the Developer app's owner account to have an active
  Premium subscription just to call its Search endpoint (even for app-level
  requests), and Apple Music API requires a paid Apple Developer Program
  membership ($99/year) with no free tier. iTunes Search is free, unauthenticated,
  and still returns rich metadata (artwork, 30-second preview, a link to open
  in Apple Music) — worth knowing if revisiting music providers later.
