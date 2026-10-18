// One-time helper: gets a Spotify refresh token and saves it to .env.
// Run with: node scripts/get-spotify-refresh-token.mjs
// Make sure http://127.0.0.1:3001/callback is a Redirect URI in your Spotify app settings.

import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const ENV_FILE = ".env";
const REDIRECT_URI = "http://127.0.0.1:3001/callback";
const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-read-recently-played",
].join(" ");

process.loadEnvFile(ENV_FILE);
const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_CLIENT_SECRET: clientSecret } =
  process.env;

if (!clientId || !clientSecret) {
  console.error(
    `SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in ${ENV_FILE}.`,
  );
  process.exit(1);
}

const state = randomBytes(16).toString("hex");
const authorizeUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
  });

function saveRefreshToken(token) {
  const lines = readFileSync(ENV_FILE, "utf8")
    .split("\n")
    // Drop any existing (or misspelled) refresh token line.
    .filter((line) => !/^SPOTI?FY_REFRESH_TOKEN=/.test(line));
  while (lines.length && lines.at(-1) === "") lines.pop();
  lines.push(`SPOTIFY_REFRESH_TOKEN=${token}`, "");
  writeFileSync(ENV_FILE, lines.join("\n"));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }

  const finish = (message, ok) => {
    res.writeHead(ok ? 200 : 400, { "Content-Type": "text/plain" });
    res.end(message);
    console.log(message);
    server.close();
    process.exitCode = ok ? 0 : 1;
  };

  if (url.searchParams.get("error")) {
    return finish(`Spotify said: ${url.searchParams.get("error")}`, false);
  }
  if (url.searchParams.get("state") !== state) {
    return finish("State mismatch. Run the script again.", false);
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: url.searchParams.get("code"),
      redirect_uri: REDIRECT_URI,
    }),
  });
  const data = await response.json();

  if (!response.ok || !data.refresh_token) {
    return finish(`Token request failed: ${JSON.stringify(data)}`, false);
  }

  saveRefreshToken(data.refresh_token);
  finish(
    `Done! SPOTIFY_REFRESH_TOKEN saved to ${ENV_FILE}. You can close this tab.`,
    true,
  );
});

server.listen(3001, "127.0.0.1", () => {
  console.log("Open this link in your browser and click Agree:\n");
  console.log(authorizeUrl + "\n");
});
