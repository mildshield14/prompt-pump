import type { VercelRequest, VercelResponse } from '@vercel/node';

const STRAVA_BASE = 'https://www.strava.com/api/v3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ msg: 'Method Not Allowed' });
    }

    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ msg: 'Missing Authorization header' });

    try {
        const stravaRes = await fetch(`${STRAVA_BASE}/athlete`, {
            headers: { Authorization: auth },
        });
        const data = await stravaRes.json();
        return res.status(stravaRes.status).json(data);
    } catch (err) {
        return res.status(500).json({ msg: 'Server error', detail: (err as Error).message });
    }
}
