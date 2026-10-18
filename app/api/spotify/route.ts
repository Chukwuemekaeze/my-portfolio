import { connection } from "next/server";
import { getNowPlaying } from "@/lib/spotify";

export async function GET() {
  // Always run at request time so the song is never stale.
  await connection();

  try {
    const nowPlaying = await getNowPlaying();
    return Response.json(nowPlaying, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Could not load Spotify data" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
