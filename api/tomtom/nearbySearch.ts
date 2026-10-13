import type { VercelRequest, VercelResponse } from '@vercel/node';

// Server-side proxy for TomTom EV-station search. Keeps the API key off the client and
// lets the CDN cache results for all users. Only EV charging stations (category 7309)
// with bounded radius/limit are allowed, so this cannot be used as a generic proxy.
const UPSTREAM = 'https://api.tomtom.com/search/2/nearbySearch/.json';
const EV_CHARGING_CATEGORY = '7309';

function num(value: unknown, min: number, max: number): number | null {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = process.env.TOMTOM_KEY;
  if (!key) {
    res.status(503).json({ error: 'TomTom proxy is not configured (TOMTOM_KEY missing).' });
    return;
  }

  const lat = num(req.query.lat, -90, 90);
  const lon = num(req.query.lon, -180, 180);
  const radius = num(req.query.radius, 100, 50_000);
  const limit = num(req.query.limit, 1, 100);
  if (lat === null || lon === null || radius === null || limit === null) {
    res.status(400).json({ error: 'lat, lon, radius (100–50000) and limit (1–100) are required.' });
    return;
  }

  const params = new URLSearchParams({
    lat: String(lat), lon: String(lon), radius: String(radius), limit: String(limit),
    categorySet: EV_CHARGING_CATEGORY, key,
  });

  try {
    const upstream = await fetch(`${UPSTREAM}?${params}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `TomTom API returned ${upstream.status}` });
      return;
    }
    const data = await upstream.json();
    // Station lists change rarely: cache at the edge for 5 min, serve stale for up to 1 h.
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    res.json(data);
  } catch (err: unknown) {
    res.status(504).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
