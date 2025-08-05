import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');    // same-origin, but harmless
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();                       // <-- early return
    }

    if (req.method !== 'POST') return res.status(405).end();

    const { code } = req.body;
    try {
        const stravaRes = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.STRAVA_CLIENT_ID,
                client_secret: process.env.STRAVA_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code'
            })
        });

        const data = await stravaRes.json();
        if (!stravaRes.ok) return res.status(stravaRes.status).json(data);

        res.json(data);              // { access_token, refresh_token, athlete… }
    } catch (err) {
        res.status(500).json({ msg: 'Server error', detail: (err as Error).message });
    }
}
