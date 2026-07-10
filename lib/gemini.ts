import { GoogleGenAI, ApiError } from "@google/genai";
import { z } from "zod";
import type { LyricsType } from "@/app/generated/prisma/enums";

const client = new GoogleGenAI({});

const MODEL = "gemini-2.5-flash";

export class GeminiPlaylistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiPlaylistError";
  }
}

const SongSuggestionSchema = z.object({
  title: z.string(),
  artist: z.string(),
  reason: z.string(),
});

const FullPlaylistSchema = z.object({
  title: z.string(),
  description: z.string(),
  songs: z.array(SongSuggestionSchema),
});

const SongSuggestionsSchema = z.object({
  songs: z.array(SongSuggestionSchema),
});

export type SongSuggestion = z.infer<typeof SongSuggestionSchema>;
export type GeneratedPlaylist = z.infer<typeof FullPlaylistSchema>;

type BookContext = {
  title: string;
  authors: string[];
  description: string | null;
  genres: string[];
};

export type UserTaste = {
  favoriteArtists: string[];
  previousSongs: { title: string; artist: string }[];
};

function describeBook(book: BookContext): string {
  const lines = [
    `Title: ${book.title}`,
    book.authors.length > 0 ? `Author(s): ${book.authors.join(", ")}` : null,
    book.genres.length > 0 ? `Genres: ${book.genres.join(", ")}` : null,
    book.description ? `Description: ${book.description}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

function tasteInstruction(taste?: UserTaste): string {
  if (!taste) return "";

  const parts: string[] = [];
  if (taste.favoriteArtists.length > 0) {
    parts.push(`Their favorite artists include: ${taste.favoriteArtists.join(", ")}.`);
  }
  if (taste.previousSongs.length > 0) {
    const list = taste.previousSongs.map((s) => `"${s.title}" by ${s.artist}`).join(", ");
    parts.push(`They have previously added these songs to other playlists: ${list}.`);
  }
  if (parts.length === 0) return "";

  return (
    "\n\nFor a personal touch, here is some context on this listener's taste: " +
    parts.join(" ") +
    " Let this inform your choices only where it naturally fits — lean toward similar artists, genres, " +
    "or styles when appropriate. The book's mood and themes always come first: do not force in a " +
    "favorite artist or repeat a previous song if it does not genuinely fit."
  );
}

function lyricsInstruction(preference?: LyricsType | null): string {
  switch (preference) {
    case "INSTRUMENTAL":
      return "\n\nOnly include instrumental tracks with no vocals or lyrics.";
    case "LYRICAL":
      return "\n\nOnly include songs that have vocals and lyrics — no instrumental tracks.";
    case "MIXED":
      return "\n\nInclude a mix of both instrumental tracks and songs with vocals/lyrics.";
    default:
      return "";
  }
}

const SYSTEM_PROMPT =
  "You are a thoughtful reading companion who builds mood-based music playlists for books. " +
  "You have wide-ranging knowledge of music across genres, eras, and languages, and you are " +
  "skilled at translating a book's themes, setting, mood, and emotional tone into song choices " +
  "that genuinely evoke its atmosphere, not just songs that share a title or keyword with the book.";

async function callGemini<T>(schema: z.ZodType<T>, userContent: string): Promise<T> {
  let response;
  try {
    response = await client.models.generateContent({
      model: MODEL,
      contents: userContent,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(schema),
        httpOptions: { timeout: 30000, retryOptions: { attempts: 2 } },
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 403) {
        throw new GeminiPlaylistError(
          "Gemini API key is missing or invalid. Add GEMINI_API_KEY to your .env."
        );
      }
      if (error.status === 429) {
        throw new GeminiPlaylistError("Gemini API rate limit reached. Try again in a moment.");
      }
      throw new GeminiPlaylistError(`Gemini API request failed: ${error.message}`);
    }
    throw error;
  }

  const text = response.text;
  if (!text) {
    throw new GeminiPlaylistError("Gemini did not return a response.");
  }

  const parsed = schema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new GeminiPlaylistError("Gemini returned a response that didn't match the expected shape.");
  }
  return parsed.data;
}

export async function generateFullPlaylist(
  book: BookContext,
  lyricsPreference?: LyricsType | null,
  taste?: UserTaste
): Promise<GeneratedPlaylist> {
  const userContent =
    `Create a mood playlist for this book:\n\n${describeBook(book)}\n\n` +
    "Analyze the book's themes, setting, mood, character dynamics, and emotional tone. " +
    "Then generate:\n" +
    "- A creative, evocative playlist title (do not just reuse the book's title)\n" +
    "- A short description (2-3 sentences) of the playlist's overall vibe\n" +
    "- Between 10 and 15 real, existing songs, each with the song title, the artist, and a " +
    "1-2 sentence explanation of why it fits the book's mood, themes, or atmosphere\n\n" +
    "Choose songs across a range of genres and eras. Favor atmosphere and emotional resonance " +
    "over literal title matches." +
    lyricsInstruction(lyricsPreference) +
    tasteInstruction(taste);

  return callGemini(FullPlaylistSchema, userContent);
}

export async function generateSongSuggestions(
  book: BookContext,
  options: {
    count?: number;
    exclude?: string[];
    playlistTitle?: string;
    playlistDescription?: string;
    lyricsPreference?: LyricsType | null;
    taste?: UserTaste;
  } = {}
): Promise<SongSuggestion[]> {
  const count = options.count ?? 6;

  const exclusions =
    options.exclude && options.exclude.length > 0
      ? `\n\nDo not suggest any of these songs, which are already in the playlist: ${options.exclude.join(", ")}.`
      : "";

  const playlistContext =
    options.playlistTitle || options.playlistDescription
      ? `\n\nThe playlist so far is titled "${options.playlistTitle ?? ""}"${
          options.playlistDescription ? ` and is described as: ${options.playlistDescription}` : ""
        }. Suggest songs that fit alongside it.`
      : "";

  const userContent =
    `Suggest ${count} songs that would fit a mood playlist for this book:\n\n${describeBook(book)}` +
    playlistContext +
    exclusions +
    "\n\nFor each song, give the song title, the artist, and a 1-2 sentence explanation of why it fits " +
    "the book's mood, themes, or atmosphere. Choose real, existing songs across a range of genres and eras." +
    lyricsInstruction(options.lyricsPreference) +
    tasteInstruction(options.taste);

  const result = await callGemini(SongSuggestionsSchema, userContent);
  return result.songs;
}
