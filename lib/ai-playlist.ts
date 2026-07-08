import { searchITunesTracks } from "@/lib/itunes";
import type { SongSuggestion } from "@/lib/gemini";

export type EnrichedSongSuggestion = SongSuggestion & {
  albumArtUrl: string | null;
  previewUrl: string | null;
  externalUrl: string | null;
};

async function enrichSuggestion(suggestion: SongSuggestion): Promise<EnrichedSongSuggestion> {
  try {
    const results = await searchITunesTracks(`${suggestion.title} ${suggestion.artist}`);
    const match = results[0];
    return {
      ...suggestion,
      albumArtUrl: match?.albumArtUrl ?? null,
      previewUrl: match?.previewUrl ?? null,
      externalUrl: match?.externalUrl ?? null,
    };
  } catch {
    return { ...suggestion, albumArtUrl: null, previewUrl: null, externalUrl: null };
  }
}

export async function enrichSuggestions(suggestions: SongSuggestion[]): Promise<EnrichedSongSuggestion[]> {
  return Promise.all(suggestions.map(enrichSuggestion));
}
