import { NextRequest, NextResponse } from 'next/server';
import { getMovies } from '@/lib/movies';
import { dailyMovie } from '@/lib/daily';

export const runtime = 'nodejs';
const normalize = (value: string) => value.trim().toLocaleLowerCase('es');

type TMDBSearchResult = { id: number; title?: string; original_title?: string; poster_path?: string | null };
type TMDBSearchResponse = { results?: TMDBSearchResult[] };

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim();
  if (q.length < 2) return NextResponse.json([]);
  const movies = getMovies();
  const secret = dailyMovie(movies);
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    const results = movies
      .filter((movie) => movie.id !== secret.id || normalize(q) === normalize(secret.title))
      .filter((movie) => normalize(movie.title).includes(normalize(q)))
      .slice(0, 10)
      .map(({ id, title, image_url }) => ({ id, title, poster_url: image_url ?? null }));
    return NextResponse.json(results, { headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    const url = new URL('https://api.themoviedb.org/3/search/movie');
    url.searchParams.set('query', q);
    url.searchParams.set('language', 'es-ES');
    url.searchParams.set('include_adult', 'false');
    url.searchParams.set('page', '1');
    url.searchParams.set('api_key', apiKey);
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) return NextResponse.json({ error: 'TMDB no está disponible ahora mismo.' }, { status: 502 });
    const data = (await response.json()) as TMDBSearchResponse;
    const results = (data.results ?? [])
      .filter((movie) => Number.isInteger(movie.id) && (movie.title || movie.original_title))
      .filter((movie) => movie.id !== secret.id || normalize(q) === normalize(secret.title))
      .slice(0, 10)
      .map((movie) => ({
        id: movie.id,
        title: movie.title || movie.original_title || 'Sin título',
        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : null,
      }));
    return NextResponse.json(results, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con TMDB.' }, { status: 502 });
  }
}
