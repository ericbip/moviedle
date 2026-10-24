import { NextRequest, NextResponse } from 'next/server';
import { getMovies, type Movie } from '@/lib/movies';
import { dailyMovie } from '@/lib/daily';
import { compareGuess } from '@/lib/compare';

export const runtime = 'nodejs';

type PersonSearch = { results?: { name?: string; profile_path?: string | null }[] };

async function actorPortrait(name: string): Promise<string | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || !name || name === 'Desconocido') return null;
  const url = new URL('https://api.themoviedb.org/3/search/person');
  url.searchParams.set('query', name);
  url.searchParams.set('language', 'es-ES');
  url.searchParams.set('api_key', apiKey);
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return null;
  const data = (await response.json()) as PersonSearch;
  const person = (data.results ?? []).find((item) => item.name?.toLocaleLowerCase('es') === name.toLocaleLowerCase('es')) ?? data.results?.[0];
  return person?.profile_path ? `https://image.tmdb.org/t/p/w342${person.profile_path}` : null;
}

type TMDBMovieDetails = {
  id: number;
  title?: string;
  original_title?: string;
  release_date?: string;
  genres?: { name: string }[];
  runtime?: number | null;
  vote_average?: number;
  poster_path?: string | null;
  production_countries?: { name: string }[];
  origin_country?: string[];
  belongs_to_collection?: { name: string } | null;
  credits?: {
    crew?: { job: string; name: string }[];
    cast?: { name: string }[];
  };
};

async function fetchTMDBMovie(id: number): Promise<Movie | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;
  const url = new URL(`https://api.themoviedb.org/3/movie/${id}`);
  url.searchParams.set('language', 'es-ES');
  url.searchParams.set('append_to_response', 'credits');
  url.searchParams.set('api_key', apiKey);
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return null;
  const details = (await response.json()) as TMDBMovieDetails;
  const year = Number(details.release_date?.slice(0, 4));
  const director = details.credits?.crew?.find((person) => person.job === 'Director')?.name ?? 'Desconocido';
  const leadActor = details.credits?.cast?.[0]?.name ?? 'Desconocido';
  const country = details.production_countries?.[0]?.name ?? details.origin_country?.[0] ?? 'Desconocido';
  return {
    id: details.id,
    title: details.title || details.original_title || 'Sin título',
    year: Number.isFinite(year) && year > 1800 ? year : 0,
    genres: (details.genres ?? []).map((genre) => genre.name),
    director,
    country,
    runtime: details.runtime ?? 0,
    rating: Number(details.vote_average ?? 0),
    leadActor,
    saga: details.belongs_to_collection?.name ?? null,
    image_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || !('id' in body) || !Number.isInteger((body as { id: unknown }).id)) {
    return NextResponse.json({ error: 'Debes enviar un id válido.' }, { status: 400 });
  }

  const id = (body as { id: number }).id;
  const movies = getMovies();
  let guess = movies.find((movie) => movie.id === id);
  if (!guess) {
    try {
      guess = (await fetchTMDBMovie(id)) ?? undefined;
    } catch {
      return NextResponse.json({ error: 'No se pudo consultar la película en TMDB.' }, { status: 502 });
    }
  }
  if (!guess) return NextResponse.json({ error: 'Película no encontrada. Comprueba la conexión con TMDB.' }, { status: 404 });

  const result = compareGuess(guess, dailyMovie(movies));
  let actor_image_url: string | null = null;
  try { actor_image_url = await actorPortrait(guess.leadActor); } catch { /* Portraits are optional; keep the guess working. */ }
  return NextResponse.json({ ...result, actor_image_url }, { headers: { 'Cache-Control': 'no-store' } });
}
