'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play, ChevronRight, ChevronLeft, Home, X, Lightbulb, ExternalLink, SkipForward, Calendar,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AdBlockDetector } from '@/components/ad-block-detector';
import ShareButton from '@/components/share-button';
import { LoadingScreen } from '@/components/loading-screen';
import { StreamingPlayer } from '@/components/streaming-player';
import { AnimeCard } from '@/components/anime/anime-card';
import { continueWatching } from '@/lib/continue-watching';
import { ANIME_SERVERS, type AnimeServer } from '@/lib/streaming/servers';
import { useServerSelection } from '@/hooks/use-server-selection';
import {
  anilistApi, animeTitle, availableEpisodes, plainDescription, FORMAT_LABEL, type Anime,
} from '@/lib/api/anilist';

const DUB_KEY = 'cinehub_anime_dub';
const EPISODES_PER_RANGE = 100;

function readDubPref(): boolean {
  try {
    return localStorage.getItem(DUB_KEY) === '1';
  } catch {
    return false;
  }
}

function track(event: string, data: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).umami) (window as any).umami.track(event, data);
}

export default function AnimeClientPage({ animeId }: { animeId: number }) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    anilistApi
      .getAnime(animeId)
      .then((a) => !cancelled && setAnime(a))
      .catch(() => !cancelled && setAnime(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [animeId]);

  if (loading) return <LoadingScreen message="Loading anime…" />;
  if (!anime) notFound();

  // Only offer servers that can actually play this title (e.g. VidLink needs a MAL id).
  return <AnimeWatch key={anime.id} anime={anime} />;
}

function AnimeWatch({ anime }: { anime: Anime }) {
  const servers = useMemo<AnimeServer[]>(
    () => ANIME_SERVERS.filter((s) => s.buildUrl({ anilistId: anime.id, malId: anime.idMal, episode: 1, dub: false }) !== null),
    [anime.id, anime.idMal],
  );
  const { index: serverIdx, choose, next, confirmWorking, isDown } = useServerSelection('anime', servers);

  const title = animeTitle(anime);
  const totalEps = availableEpisodes(anime);
  const isMovie = anime.format === 'MOVIE';

  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [episode, setEpisode] = useState(1);
  const [dub, setDub] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const [range, setRange] = useState(0);
  const episodesRef = useRef<HTMLDivElement>(null);

  // Restore dub preference + resume point; honour ?autoplay=true&episode=N from Continue Watching
  useEffect(() => {
    setDub(readDubPref());
    const params = new URLSearchParams(window.location.search);
    const urlEp = parseInt(params.get('episode') || '');
    const saved = continueWatching.get(anime.id.toString(), 'anime');
    const ep = Math.min(Math.max(urlEp || saved?.episode || 1, 1), totalEps);
    setEpisode(ep);
    setRange(Math.floor((ep - 1) / EPISODES_PER_RANGE));
    if (params.get('autoplay') === 'true') setIsPlayerOpen(true);
  }, [anime.id, totalEps]);

  // Remember episode whenever the player is showing it
  useEffect(() => {
    if (!isPlayerOpen) return;
    continueWatching.add({
      id: anime.id.toString(),
      type: 'anime',
      title,
      poster: anime.coverImage.large || anime.coverImage.extraLarge || '',
      episode,
    });
  }, [isPlayerOpen, episode, anime, title]);

  // After a minute on a server, treat it as the user's working server
  useEffect(() => {
    if (!isPlayerOpen) return;
    const t = setInterval(() => {
      confirmWorking();
      track('watching', { type: 'anime', animeId: anime.id, episode, server: servers[serverIdx]?.name });
    }, 60000);
    return () => clearInterval(t);
  }, [isPlayerOpen, confirmWorking, anime.id, episode, servers, serverIdx]);

  const server = servers[serverIdx];
  const embedUrl = server?.buildUrl({ anilistId: anime.id, malId: anime.idMal, episode, dub }) ?? '';

  const play = (ep: number) => {
    setEpisode(ep);
    setIsPlayerOpen(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    track('anime_play', { anime: title, animeId: anime.id, episode: ep, dub, server: server?.name });
  };

  const toggleDub = (value: boolean) => {
    setDub(value);
    try {
      localStorage.setItem(DUB_KEY, value ? '1' : '0');
    } catch {
      /* ignore */
    }
  };

  const ranges = Math.ceil(totalEps / EPISODES_PER_RANGE);
  const rangeStart = range * EPISODES_PER_RANGE + 1;
  const rangeEnd = Math.min(totalEps, rangeStart + EPISODES_PER_RANGE - 1);
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const description = plainDescription(anime.description);
  const recommendations = (anime.recommendations?.nodes ?? [])
    .map((n) => n.mediaRecommendation)
    .filter((a): a is Anime => !!a);
  const banner = anime.bannerImage || anime.coverImage.extraLarge || '/placeholder.png';
  const dim = lightsOff ? 'brightness-[0.2] pointer-events-none transition-all duration-300' : 'transition-all duration-300';

  const breadcrumb = (
    <div className="flex items-center text-xs sm:text-sm text-gray-300">
      <Link href="/" className="hover:text-white flex items-center transition-colors">
        <Home className="w-4 h-4 mr-1" />
        Home
      </Link>
      <ChevronRight className="w-4 h-4 mx-2" />
      <Link href="/anime" className="hover:text-white transition-colors">Anime</Link>
      <ChevronRight className="w-4 h-4 mx-2" />
      <span className="text-white truncate">{title}</span>
    </div>
  );

  const subDubToggle = (
    <div className="inline-flex rounded-lg border border-border p-0.5 text-sm" role="group" aria-label="Audio">
      {(['Sub', 'Dub'] as const).map((label) => {
        const active = (label === 'Dub') === dub;
        return (
          <button
            key={label}
            type="button"
            onClick={() => toggleDub(label === 'Dub')}
            className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
              active ? 'bg-red-600 text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        {!isPlayerOpen ? (
          <div className="relative h-[340px] sm:h-[440px] lg:h-[520px] overflow-hidden">
            <Image src={banner} alt={title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
            <div className="absolute top-4 left-0 right-0 z-10">
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">{breadcrumb}</div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() => play(episode)}
                aria-label={`Play episode ${episode}`}
                className="bg-red-600/90 hover:bg-red-600 text-white rounded-full p-4 sm:p-6 lg:p-8 shadow-2xl transition-all duration-300 hover:scale-110"
              >
                <Play className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" fill="white" />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full">
            <div className={dim}>
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3">{breadcrumb}</div>
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
                <AdBlockDetector />
                <p className="text-gray-500 text-xs">Stuck? Turn off adblock or pick another server.</p>
              </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-md overflow-hidden border border-border bg-card">
                <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {title}
                      {!isMovie && ` · EP ${episode}`}
                      <span className="text-muted-foreground font-normal"> · {dub ? 'Dub' : 'Sub'}</span>
                    </span>
                    <a
                      href={embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:flex text-xs text-muted-foreground hover:text-foreground items-center gap-1 shrink-0 px-2 py-1 rounded transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in new tab
                    </a>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => next()}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1.5 rounded transition-colors"
                      title="Switch to the next working server"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Not working?</span> Next server
                    </button>
                    {lightsOff && (
                      <button
                        type="button"
                        onClick={() => setLightsOff(false)}
                        className="text-amber-500/90 hover:text-amber-400 text-xs flex items-center gap-1 px-2 py-1.5"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        Lights on
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsPlayerOpen(false)}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                      aria-label="Close player"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-1.5">
                  {embedUrl ? (
                    <StreamingPlayer
                      key={embedUrl}
                      url={embedUrl}
                      title={`${title} episode ${episode}`}
                      onError={() => next()}
                    />
                  ) : (
                    <div className="aspect-video flex items-center justify-center text-muted-foreground text-sm">
                      No server available for this title.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={dim}>
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Episode nav + audio */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    {!isMovie && (
                      <>
                        <button
                          type="button"
                          onClick={() => play(Math.max(1, episode - 1))}
                          disabled={episode <= 1}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <ChevronLeft className="w-4 h-4" /> Prev
                        </button>
                        <button
                          type="button"
                          onClick={() => play(Math.min(totalEps, episode + 1))}
                          disabled={episode >= totalEps}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-40 disabled:pointer-events-none"
                        >
                          Next episode <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setLightsOff(!lightsOff)}
                      className="flex items-center gap-1.5 px-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Lightbulb className={`w-3.5 h-3.5 ${lightsOff ? 'text-amber-500/90' : ''}`} />
                      {lightsOff ? 'Lights on' : 'Lights off'}
                    </button>
                  </div>
                  {subDubToggle}
                </div>

                <p className="text-center text-muted-foreground text-sm mt-6 mb-2">
                  If the current server doesn&apos;t work, try another below.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {servers.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        choose(idx);
                        track('anime_server_change', { anime: title, animeId: anime.id, episode, server: s.name });
                      }}
                      className={`flex flex-col items-center min-w-[100px] px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                        serverIdx === idx
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground hover:bg-muted'
                      } ${isDown(idx) && serverIdx !== idx ? 'opacity-50' : ''}`}
                    >
                      <span className="text-[10px] uppercase tracking-wide opacity-80">
                        {isDown(idx) ? 'Offline' : dub && !s.supportsDub ? 'Sub only' : 'Server'}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium mt-0.5">
                        <Play className="w-3.5 h-3.5" fill="currentColor" />
                        {s.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {lightsOff && (
              <button
                type="button"
                onClick={() => setLightsOff(false)}
                className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                Turn on light
              </button>
            )}
          </div>
        )}

        {/* Details */}
        <div className={`${!isPlayerOpen ? 'relative -mt-16 sm:-mt-24 z-10' : 'mt-8'} ${dim}`}>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 lg:gap-8 mb-10">
              <div className="hidden sm:block w-40 lg:w-48 aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl flex-shrink-0">
                <Image
                  src={anime.coverImage.extraLarge || anime.coverImage.large || '/placeholder.png'}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 text-foreground">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">{title}</h1>
                {anime.title.romaji && anime.title.romaji !== title && (
                  <p className="text-muted-foreground text-sm mb-3">{anime.title.romaji}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                  {score && <span className="bg-yellow-500 text-black px-2 py-1 rounded font-bold">⭐ {score}</span>}
                  {anime.seasonYear && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {anime.season ? `${anime.season[0]}${anime.season.slice(1).toLowerCase()} ` : ''}{anime.seasonYear}
                    </span>
                  )}
                  <span className="text-muted-foreground">{FORMAT_LABEL[anime.format ?? ''] ?? 'Anime'}</span>
                  {!isMovie && (
                    <span className="text-muted-foreground">
                      {totalEps}{anime.episodes && anime.episodes !== totalEps ? ` / ${anime.episodes}` : ''} Episodes
                    </span>
                  )}
                  {anime.status === 'RELEASING' && (
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">Airing</span>
                  )}
                  <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">HD</span>
                </div>

                {anime.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {anime.genres.map((g) => (
                      <span key={g} className="bg-muted px-3 py-1 rounded text-sm">{g}</span>
                    ))}
                  </div>
                )}

                {description && (
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 whitespace-pre-line line-clamp-6">{description}</p>
                )}

                {anime.studios?.nodes?.[0] && (
                  <p className="text-sm mb-6">
                    <span className="text-muted-foreground">Studio: </span>
                    {anime.studios.nodes.map((s) => s.name).join(', ')}
                  </p>
                )}

                {!isPlayerOpen && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => play(episode)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" fill="white" />
                      {isMovie ? 'Watch Now' : episode > 1 ? `Continue EP ${episode}` : 'Watch EP 1'}
                    </button>
                    {subDubToggle}
                    <ShareButton title={title} />
                  </div>
                )}
              </div>
            </div>

            {/* Episodes */}
            {!isMovie && (
              <div ref={episodesRef} className="mb-12 scroll-mt-20">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">Episodes</h2>
                  {ranges > 1 && (
                    <select
                      value={range}
                      onChange={(e) => setRange(parseInt(e.target.value))}
                      aria-label="Episode range"
                      className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {Array.from({ length: ranges }, (_, r) => {
                        const a = r * EPISODES_PER_RANGE + 1;
                        const b = Math.min(totalEps, a + EPISODES_PER_RANGE - 1);
                        return (
                          <option key={r} value={r}>
                            EP {a}–{b}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-[repeat(16,minmax(0,1fr))] gap-1.5">
                  {Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => rangeStart + i).map((ep) => (
                    <button
                      key={ep}
                      type="button"
                      onClick={() => play(ep)}
                      aria-current={ep === episode ? 'true' : undefined}
                      className={`h-10 rounded-md text-sm font-medium border transition-colors ${
                        ep === episode
                          ? 'bg-red-600 border-red-600 text-white'
                          : ep < episode
                          ? 'border-border bg-muted/60 text-muted-foreground hover:text-foreground'
                          : 'border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {ep}
                    </button>
                  ))}
                </div>
                {anime.nextAiringEpisode && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Episode {anime.nextAiringEpisode.episode} airs{' '}
                    {new Date(anime.nextAiringEpisode.airingAt * 1000).toLocaleString(undefined, {
                      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="mb-12">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">You might also like</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-1.5 md:gap-2">
                  {recommendations.slice(0, 12).map((a) => (
                    <AnimeCard key={a.id} anime={a} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
