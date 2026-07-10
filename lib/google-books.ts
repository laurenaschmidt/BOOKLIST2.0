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

const MAX_ATTEMPTS = 8;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Google's Books API returns transient 503s at a surprisingly high, fluctuating
// rate (measured 35-80% per-request failure in testing) even on a healthy
// connection and a valid key, so retries are essential here. Each attempt
// passes its own AbortController signal: Next.js memoizes repeated `fetch`
// calls with identical url+options within a single server render, so without
// a distinct signal every "retry" would just replay the same failed response
// instead of hitting the network again. A 429 (quota) is a different,
// non-transient failure, so it fails immediately instead of retrying.
async function fetchWithRetry(url: string): Promise<Response> {
  let lastResponse: Response | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, { cache: "no-store", signal: new AbortController().signal });
    if (res.ok || res.status === 429 || attempt === MAX_ATTEMPTS) {
      return res;
    }
    lastResponse = res;
    await sleep(150);
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
