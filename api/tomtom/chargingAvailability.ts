import type { VercelRequest, VercelResponse } from '@vercel/node';

// Server-side proxy for TomTom live charging availability (see nearbySearch.ts).
const UPSTREAM = 'https://api.tomtom.com/search/2/chargingAvailability.json';
const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = process.env.TOMTOM_KEY;
  if (!key) {
    res.status(503).json({ error: 'TomTom proxy is not configured (TOMTOM_KEY missing).' });
    return;
  }

  const raw = req.query.chargingAvailability;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || !ID_PATTERN.test(id)) {
    res.status(400).json({ error: 'A valid chargingAvailability id is required.' });
    return;
  }

  const params = new URLSearchParams({ chargingAvailability: id, key });

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
    // Availability is live: short edge cache, matching the client's 30 s polling.
    res.setHeader('Cache-Control', 'public, s-maxage=25, stale-while-revalidate=60');
    res.json(data);
  } catch (err: unknown) {
    res.status(504).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
