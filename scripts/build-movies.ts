import fs from 'node:fs/promises';
import path from 'node:path';
import type { Movie } from '../lib/movies';
const apiKey=process.env.TMDB_API_KEY;
if(!apiKey){console.error('Falta TMDB_API_KEY.');process.exit(1);}
const movies:Movie[]=[];
const base='https://api.themoviedb.org/3';
async function tmdb<T>(endpoint:string,params:Record<string,string>={}){const url=new URL(`${base}${endpoint}`);url.searchParams.set('api_key',apiKey!);url.searchParams.set('language','es-ES');for(const [k,v] of Object.entries(params))url.searchParams.set(k,v);const r=await fetch(url);if(!r.ok)throw new Error(`TMDB ${r.status} en ${endpoint}`);return r.json() as Promise<T>}
type Popular={results:{id:number;title:string}[]};
type Details={id:number;title:string;release_date:string;runtime:number|null;vote_average:number;genres:{id:number;name:string}[];production_countries:{iso_3166_1:string;name:string}[];belongs_to_collection:{name:string}|null;poster_path:string|null;credits?:{crew:{job:string;name:string}[];cast:{order:number;name:string}[]}};
for(let page=1;page<=25&&movies.length<500;page++){const popular=await tmdb<Popular>('/movie/top_rated',{page:String(page)});for(const item of popular.results){if(movies.length>=500)break;try{const d=await tmdb<Details>(`/movie/${item.id}`,{append_to_response:'credits'});const director=d.credits?.crew.find(x=>x.job==='Director')?.name;const actor=[...(d.credits?.cast??[])].sort((a,b)=>a.order-b.order)[0]?.name;const year=Number(d.release_date?.slice(0,4));const country=d.production_countries[0]?.name;if(!year||!d.runtime||!director||!actor||!country||!d.genres.length)continue;movies.push({id:d.id,title:d.title,year,genres:d.genres.map(g=>g.name),director,country,runtime:d.runtime,rating:Number(d.vote_average.toFixed(1)),leadActor:actor,saga:d.belongs_to_collection?.name??null,image_url:d.poster_path?`https://image.tmdb.org/t/p/w500${d.poster_path}`:null})}catch(e){console.warn(`Se omite ${item.title}:`,e instanceof Error?e.message:e)}await new Promise(r=>setTimeout(r,35))}}
if(movies.length<20)throw new Error(`Solo se obtuvieron ${movies.length} películas completas; no se sobrescribe el dataset.`);
await fs.mkdir(path.join(process.cwd(),'data'),{recursive:true});await fs.writeFile(path.join(process.cwd(),'data','movies.json'),JSON.stringify(movies.slice(0,500),null,2)+'\n');console.log(`Generadas ${Math.min(movies.length,500)} películas en data/movies.json`);
