// AniList GraphQL client — free, no API key. https://docs.anilist.co
// Rate limit is ~30-90 req/min per IP, which is fine for client-side browsing.

const ENDPOINT = 'https://graphql.anilist.co';

export interface Anime {
  id: number;
  idMal: number | null;
  title: { romaji: string | null; english: string | null; native: string | null };
  coverImage: { extraLarge: string | null; large: string | null; color: string | null };
  bannerImage: string | null;
  description: string | null;
  episodes: number | null;
  duration: number | null;
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS' | null;
  format: 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC' | null;
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null;
  seasonYear: number | null;
  averageScore: number | null;
  genres: string[];
  nextAiringEpisode: { episode: number; airingAt: number } | null;
  studios?: { nodes: { name: string }[] };
  recommendations?: { nodes: { mediaRecommendation: Anime | null }[] };
}

export interface AnimePage {
  media: Anime[];
  pageInfo: { currentPage: number; lastPage: number; hasNextPage: boolean };
}

export type AnimeSort = 'TRENDING_DESC' | 'POPULARITY_DESC' | 'SCORE_DESC' | 'START_DATE_DESC';

const CARD_FIELDS = `
  id idMal
  title { romaji english native }
  coverImage { extraLarge large color }
  bannerImage
  episodes status format season seasonYear averageScore genres
  nextAiringEpisode { episode airingAt }
`;

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(json.errors?.[0]?.message ?? `AniList error ${res.status}`);
  }
  return json.data as T;
}

function currentSeason(): { season: Anime['season']; year: number } {
  const d = new Date();
  const m = d.getMonth();
  const season = m < 3 ? 'WINTER' : m < 6 ? 'SPRING' : m < 9 ? 'SUMMER' : 'FALL';
  return { season, year: d.getFullYear() };
}

export const anilistApi = {
  async browse(opts: {
    sort?: AnimeSort;
    page?: number;
    perPage?: number;
    genre?: string;
    search?: string;
    thisSeason?: boolean;
  }): Promise<AnimePage> {
    const { season, year } = currentSeason();
    const query = `
      query ($page: Int, $perPage: Int, $sort: [MediaSort], $genre: String, $search: String, $season: MediaSeason, $year: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { currentPage lastPage hasNextPage }
          media(type: ANIME, isAdult: false, sort: $sort, genre: $genre, search: $search, season: $season, seasonYear: $year) {
            ${CARD_FIELDS}
          }
        }
      }`;
    const data = await gql<{ Page: AnimePage }>(query, {
      page: opts.page ?? 1,
      perPage: opts.perPage ?? 30,
      // Search results are best sorted by relevance
      sort: opts.search ? ['SEARCH_MATCH', 'POPULARITY_DESC'] : [opts.sort ?? 'TRENDING_DESC'],
      genre: opts.genre || undefined,
      search: opts.search || undefined,
      season: opts.thisSeason ? season : undefined,
      year: opts.thisSeason ? year : undefined,
    });
    return data.Page;
  },

  async getAnime(id: number): Promise<Anime> {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          ${CARD_FIELDS}
          description(asHtml: false)
          duration
          studios(isMain: true) { nodes { name } }
          recommendations(perPage: 12, sort: RATING_DESC) {
            nodes { mediaRecommendation { ${CARD_FIELDS} } }
          }
        }
      }`;
    const data = await gql<{ Media: Anime }>(query, { id });
    return data.Media;
  },
};

export const ANIME_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mecha', 'Music',
  'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
];

export function animeTitle(a: Pick<Anime, 'title'>): string {
  return a.title.english || a.title.romaji || a.title.native || 'Untitled';
}

/** Number of episodes that can be watched right now. */
export function availableEpisodes(a: Anime): number {
  if (a.nextAiringEpisode) return Math.max(a.nextAiringEpisode.episode - 1, 1);
  if (a.episodes) return a.episodes;
  return 1;
}

/** AniList descriptions contain light HTML (<br>, <i>). Strip to plain text. */
export function plainDescription(html: string | null): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const FORMAT_LABEL: Record<string, string> = {
  TV: 'TV', TV_SHORT: 'TV Short', MOVIE: 'Movie', SPECIAL: 'Special', OVA: 'OVA', ONA: 'ONA', MUSIC: 'Music',
};
