import { NextResponse } from 'next/server';
import { getMovies } from '@/lib/movies';
import { dailyMovie } from '@/lib/daily';

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
  const person = (data.results ?? []).find((item) => item.name?.toLocaleLowerCase('es') === name.toLocaleLowerCase('es'))
    ?? data.results?.[0];
  return person?.profile_path ? `https://image.tmdb.org/t/p/w342${person.profile_path}` : null;
}

export async function GET() {
  try {
    const secret = dailyMovie(getMovies());
    const actor = secret.leadActor || 'Desconocido';
    const image_url = await actorPortrait(actor);
    return NextResponse.json(
      { hint: actor !== 'Desconocido' ? `El actor principal es: ${actor}` : 'No hay información del actor principal para esta película.', actor, image_url },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'No se pudo generar una pista.' }, { status: 500 });
  }
}
