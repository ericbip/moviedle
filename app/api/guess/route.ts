import { NextRequest,NextResponse } from 'next/server';
import { getMovies } from '@/lib/movies';
import { dailyMovie } from '@/lib/daily';
import { compareGuess } from '@/lib/compare';
export const runtime='nodejs';
export async function POST(request:NextRequest){let body:unknown;try{body=await request.json()}catch{return NextResponse.json({error:'JSON inválido.'},{status:400})}if(!body||typeof body!=='object'||!('id' in body)||!Number.isInteger((body as {id:unknown}).id))return NextResponse.json({error:'Debes enviar un id válido.'},{status:400});const movies=getMovies();const guess=movies.find(m=>m.id===(body as {id:number}).id);if(!guess)return NextResponse.json({error:'Película no encontrada.'},{status:404});return NextResponse.json(compareGuess(guess,dailyMovie(movies)),{headers:{'Cache-Control':'no-store'}})}
