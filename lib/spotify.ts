import "server-only";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";

export type NowPlaying =
  | { isPlaying: false }
  | {
      isPlaying: boolean;
      title: string;
      artist: string;
      album: string;
      albumImageUrl: string | null;
      songUrl: string;
    };

// Access tokens last an hour, so reuse one until shortly before it expires.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error("Missing Spotify environment variables");
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
          "base64",
        ),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed: ${response.status}`);
  }

  const data: { access_token: string; expires_in: number } =
    await response.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export async function getNowPlaying(): Promise<NowPlaying> {
  const accessToken = await getAccessToken();

  const response = await fetch(NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  // 204 means nothing is playing (or Spotify is closed).
  if (response.status === 204) {
    return { isPlaying: false };
  }
  if (!response.ok) {
    throw new Error(`Spotify now-playing request failed: ${response.status}`);
  }

  const data = await response.json();
  const track = data.item;

  // Podcasts and ads have no track details, so treat them as "not playing".
  if (!track || data.currently_playing_type !== "track") {
    return { isPlaying: false };
  }

  return {
    isPlaying: data.is_playing,
    title: track.name,
    artist: track.artists
      .map((artist: { name: string }) => artist.name)
      .join(", "),
    album: track.album.name,
    albumImageUrl: track.album.images[0]?.url ?? null,
    songUrl: track.external_urls.spotify,
  };
}
