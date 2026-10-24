import { NextRequest,NextResponse } from 'next/server';
import { getMovies } from '@/lib/movies';
import { dailyMovie } from '@/lib/daily';
export const runtime='nodejs';
const normalize=(v:string)=>v.trim().toLocaleLowerCase('es');
export async function GET(request:NextRequest){const q=(request.nextUrl.searchParams.get('q')??'').trim();if(!q)return NextResponse.json([]);const movies=getMovies();const secret=dailyMovie(movies);const results=movies.filter(m=>m.id!==secret.id||normalize(q)===normalize(secret.title)).filter(m=>normalize(m.title).includes(normalize(q))).slice(0,10).map(({id,title})=>({id,title}));return NextResponse.json(results,{headers:{'Cache-Control':'no-store'}})}
