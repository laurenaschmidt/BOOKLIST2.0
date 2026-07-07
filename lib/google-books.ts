export type GoogleBookResult = {
  googleBooksId: string;
  title: string;
  authors: string[];
  description: string | null;
  coverUrl: string | null;
  genres: string[];
  pageCount: number | null;
  publishedDate: string | null;
};

type VolumeInfo = {
  title?: string;
  authors?: string[];
  description?: string;
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  categories?: string[];
  pageCount?: number;
  publishedDate?: string;
};

type Volume = { id: string; volumeInfo?: VolumeInfo };

function normalizeCoverUrl(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//, "https://");
}

function toGoogleBookResult(volume: Volume): GoogleBookResult {
  const info = volume.volumeInfo ?? {};
  return {
    googleBooksId: volume.id,
    title: info.title ?? "Untitled",
    authors: info.authors ?? [],
    description: info.description ?? null,
    coverUrl: normalizeCoverUrl(info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail),
    genres: info.categories ?? [],
    pageCount: info.pageCount ?? null,
    publishedDate: info.publishedDate ?? null,
  };
}

function apiKeyParam() {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  return key ? `&key=${key}` : "";
}

export class GoogleBooksApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "GoogleBooksApiError";
  }
}

const MAX_ATTEMPTS = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Google's Books API occasionally returns transient 5xx errors even on a
// healthy connection; retry those a couple of times before giving up. A 429
// (quota) is not transient in the same way, so it fails immediately.
async function fetchWithRetry(url: string): Promise<Response> {
  let lastResponse: Response | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok || res.status === 429 || attempt === MAX_ATTEMPTS) {
      return res;
    }
    lastResponse = res;
    await sleep(300 * attempt);
  }

  return lastResponse!;
}

async function throwForFailedResponse(res: Response): Promise<never> {
  const body = await res.text().catch(() => "");
  throw new GoogleBooksApiError(
    res.status,
    res.status === 429
      ? "Google Books API rate limit reached. Add a GOOGLE_BOOKS_API_KEY to your .env to raise the limit."
      : `Google Books API request failed (${res.status}): ${body.slice(0, 200)}`
  );
}

export async function searchBooks(query: string): Promise<GoogleBookResult[]> {
  if (!query.trim()) return [];

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query
  )}&maxResults=24${apiKeyParam()}`;

  const res = await fetchWithRetry(url);
  if (!res.ok) await throwForFailedResponse(res);

  const data = await res.json();
  const items: Volume[] = data.items ?? [];
  return items.filter((item) => item.volumeInfo?.title).map(toGoogleBookResult);
}

export async function getGoogleBook(googleBooksId: string): Promise<GoogleBookResult | null> {
  const url = `https://www.googleapis.com/books/v1/volumes/${googleBooksId}?${apiKeyParam().replace(
    /^&/,
    ""
  )}`;

  const res = await fetchWithRetry(url);
  if (!res.ok) return null;

  const volume: Volume = await res.json();
  if (!volume.volumeInfo) return null;
  return toGoogleBookResult(volume);
}
