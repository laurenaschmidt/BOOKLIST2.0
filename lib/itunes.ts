export type ITunesTrackResult = {
  trackId: number;
  title: string;
  artist: string;
  albumArtUrl: string | null;
  previewUrl: string | null;
  externalUrl: string | null;
};

export class ITunesApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ITunesApiError";
  }
}

type ITunesTrack = {
  trackId: number;
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl?: string;
};

function upscaleArtwork(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace(/\/\d+x\d+bb\.(jpg|png)$/, "/300x300bb.$1");
}

function toTrackResult(track: ITunesTrack): ITunesTrackResult {
  return {
    trackId: track.trackId,
    title: track.trackName ?? "Untitled",
    artist: track.artistName ?? "Unknown artist",
    albumArtUrl: upscaleArtwork(track.artworkUrl100),
    previewUrl: track.previewUrl ?? null,
    externalUrl: track.trackViewUrl ?? null,
  };
}

const MAX_ATTEMPTS = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastResponse: Response | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok || attempt === MAX_ATTEMPTS) return res;
    lastResponse = res;
    await sleep(300 * attempt);
  }

  return lastResponse!;
}

export async function searchITunesTracks(query: string): Promise<ITunesTrackResult[]> {
  if (!query.trim()) return [];

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    query
  )}&media=music&entity=song&limit=12`;

  const res = await fetchWithRetry(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ITunesApiError(`iTunes search failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const results: ITunesTrack[] = data.results ?? [];
  return results.filter((track) => track.trackName).map(toTrackResult);
}
