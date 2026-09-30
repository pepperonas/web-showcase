import type { APIRoute } from 'astro';
import { isProduction } from '../config/site';

// Vorschau- und lokale Builds sperren Crawler vollständig aus.
export const GET: APIRoute = ({ site }) => {
  const body = isProduction
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
