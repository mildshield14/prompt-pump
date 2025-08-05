import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');  
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ msg: 'Method Not Allowed' });
    }

    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ msg: 'Missing Authorization header' });

    const page = req.query.page ?? '1';
    const perPage = req.query.perPage ?? '30';

    try {
        const stravaRes = await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`, {
            headers: { Authorization: auth },
        });

        const data = await stravaRes.json();
        return res.status(stravaRes.status).json(data);
    } catch (err) {
        return res.status(500).json({ msg: 'Server error', detail: (err as Error).message });
    }
}
