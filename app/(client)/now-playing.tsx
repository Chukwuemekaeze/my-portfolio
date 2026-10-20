"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NowPlaying as NowPlayingData } from "@/app/api/lib/spotify";

const REFRESH_MS = 15_000;

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: NowPlayingData };

export default function NowPlaying() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    async function load() {
      // Skip checks while the tab is in the background.
      if (document.hidden) return;
      try {
        const response = await fetch("/api/spotify");
        if (!response.ok) throw new Error();
        setState({ status: "ready", data: await response.json() });
      } catch {
        setState({ status: "error" });
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  const track =
    state.status === "ready" && "title" in state.data ? state.data : null;

  let label = "Now Playing";
  if (state.status === "loading") label = "Loading";
  else if (state.status === "error") label = "Spotify unavailable";
  else if (!track) label = "Not playing";
  else if (!track.isPlaying) label = "Paused";

  return (
    <div className="flex aspect-square w-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
        {label}
      </p>

      {track && (
        <a
          href={track.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex min-h-0 flex-1 flex-col gap-4"
        >
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-white/5">
            {track.albumImageUrl && (
              <Image
                src={track.albumImageUrl}
                alt={`${track.album} cover`}
                fill
                sizes="(min-width: 768px) 35vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-zinc-200">
              {track.title}
            </p>
            <p className="truncate text-sm text-zinc-400">{track.artist}</p>
          </div>
        </a>
      )}
    </div>
  );
}
