import type { APIRoute } from 'astro';
import { fetchAllRegulations, buildRegulationIndex } from '../../utils/fetchRegulations';

export const prerender = true;

export const GET: APIRoute = async () => {
  const regulations = await fetchAllRegulations();
  const regIndex = buildRegulationIndex(regulations);
  return new Response(JSON.stringify(regIndex), {
    headers: { 'Content-Type': 'application/json' },
  });
};
