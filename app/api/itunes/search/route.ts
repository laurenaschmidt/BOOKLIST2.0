import { auth } from "@/lib/auth";
import { searchITunesTracks, ITunesApiError } from "@/lib/itunes";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  try {
    const tracks = await searchITunesTracks(q);
    return Response.json({ tracks });
  } catch (error) {
    const message = error instanceof ITunesApiError ? error.message : "iTunes search failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
