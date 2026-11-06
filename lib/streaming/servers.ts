// Single source of truth for every embed provider CineHub uses.
// Order = preference order. `id` is the provider key used by the health check
// (/api/streaming/health) and by the "remember my server" preference.

export type MediaKind = 'movie' | 'tv' | 'anime';

export interface MovieServer {
  id: string;
  name: string;
  native?: boolean;
  buildUrl: (tmdbId: number) => string;
}

export interface TVServer {
  id: string;
  name: string;
  native?: boolean;
  buildUrl: (tmdbId: number, season: number, episode: number) => string;
}

export interface AnimeTarget {
  anilistId: number;
  malId: number | null;
  episode: number;
  dub: boolean;
}

export interface AnimeServer {
  id: string;
  name: string;
  /** false when the server has no dub support (toggle is ignored) */
  supportsDub: boolean;
  /** Return null when this server can't play the title (e.g. no MAL id). */
  buildUrl: (t: AnimeTarget) => string | null;
}

const STREAMCORE_URL = process.env.NEXT_PUBLIC_STREAMCORE_URL;

export const MOVIE_SERVERS: MovieServer[] = [
  ...(STREAMCORE_URL
    ? [{ id: 'streamcore', name: 'StreamCore', native: true, buildUrl: (id: number) => `${STREAMCORE_URL}/movie/${id}` }]
    : []),
  { id: 'vidlink',    name: 'VidLink',    buildUrl: (id) => `https://vidlink.pro/movie/${id}?autoplay=true&title=false` },
  { id: 'videasy',    name: 'Videasy',    buildUrl: (id) => `https://player.videasy.net/movie/${id}` },
  { id: 'vidfast',    name: 'VidFast',    buildUrl: (id) => `https://vidfast.pro/movie/${id}?autoPlay=true` },
  { id: 'vidsrc',     name: 'VidSrc',     buildUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}` },
  { id: '2embed',     name: '2Embed',     buildUrl: (id) => `https://www.2embed.cc/embed/${id}` },
  { id: 'superembed', name: 'SuperEmbed', buildUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1` },
  { id: 'autoembed',  name: 'AutoEmbed',  buildUrl: (id) => `https://player.autoembed.me/embed/movie/${id}` },
  { id: 'vidzee',     name: 'VidZee',     buildUrl: (id) => `https://player.vidzee.wtf/embed/movie/${id}` },
];

export const TV_SERVERS: TVServer[] = [
  ...(STREAMCORE_URL
    ? [{ id: 'streamcore', name: 'StreamCore', native: true, buildUrl: (id: number, s: number, e: number) => `${STREAMCORE_URL}/tv/${id}/${s}/${e}` }]
    : []),
  { id: 'vidlink',    name: 'VidLink',    buildUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true&title=false` },
  { id: 'videasy',    name: 'Videasy',    buildUrl: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}` },
  { id: 'vidfast',    name: 'VidFast',    buildUrl: (id, s, e) => `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true` },
  { id: 'vidsrc',     name: 'VidSrc',     buildUrl: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
  { id: '2embed',     name: '2Embed',     buildUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
  { id: 'superembed', name: 'SuperEmbed', buildUrl: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
  { id: 'autoembed',  name: 'AutoEmbed',  buildUrl: (id, s, e) => `https://player.autoembed.me/embed/tv/${id}/${s}/${e}` },
  { id: 'vidzee',     name: 'VidZee',     buildUrl: (id, s, e) => `https://player.vidzee.wtf/embed/tv/${id}/${s}/${e}` },
];

export const ANIME_SERVERS: AnimeServer[] = [
  {
    id: 'vidlink',
    name: 'VidLink',
    supportsDub: true,
    buildUrl: ({ malId, episode, dub }) =>
      malId ? `https://vidlink.pro/anime/${malId}/${episode}/${dub ? 'dub' : 'sub'}?autoplay=true` : null,
  },
  {
    id: 'videasy',
    name: 'Videasy',
    supportsDub: true,
    buildUrl: ({ anilistId, episode, dub }) =>
      `https://player.videasy.net/anime/${anilistId}/${episode}${dub ? '?dub=true' : ''}`,
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed',
    supportsDub: false,
    buildUrl: ({ anilistId, episode }) => `https://player.autoembed.me/embed/anime/${anilistId}/${episode}`,
  },
];

/**
 * One cheap URL per provider that the health route fetches server-side.
 * Uses a well-known title (Fight Club, TMDB 550) so it should always exist.
 */
export const HEALTH_PROBES: Record<string, string> = {
  vidlink: 'https://vidlink.pro/movie/550',
  videasy: 'https://player.videasy.net/movie/550',
  vidfast: 'https://vidfast.pro/movie/550',
  vidsrc: 'https://vidsrc.me/embed/movie?tmdb=550',
  '2embed': 'https://www.2embed.cc/embed/550',
  superembed: 'https://multiembed.mov/?video_id=550&tmdb=1',
  autoembed: 'https://player.autoembed.me/embed/movie/550',
  vidzee: 'https://player.vidzee.wtf/embed/movie/550',
};

// ---------- remembered server preference (per device) ----------

const PREF_KEY = (kind: MediaKind) => `cinehub_server_pref_${kind}`;

export function getPreferredServer(kind: MediaKind): string | null {
  try {
    return localStorage.getItem(PREF_KEY(kind));
  } catch {
    return null;
  }
}

export function setPreferredServer(kind: MediaKind, serverId: string) {
  try {
    localStorage.setItem(PREF_KEY(kind), serverId);
  } catch {
    /* storage blocked — preference is a convenience only */
  }
}
