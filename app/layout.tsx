import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'Moviedle — Adivina la película del día', description:'Adivina la película diaria con pistas de atributos.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="es"><body>{children}</body></html>; }
