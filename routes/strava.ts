import { Router } from 'express';
import fetch from 'node-fetch';
import { stravaRequest } from '../lib/stravaClient';

const router = Router();
const {
    STRAVA_CLIENT_ID,
    STRAVA_CLIENT_SECRET,
    STRAVA_REDIRECT_URI
} = process.env;

router.post('/auth/token', async (req, res, next) => {
    try {
        const { code } = req.body;

        const resp = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: STRAVA_CLIENT_ID,
                client_secret: STRAVA_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code'
            })
        });

        const data = await resp.text();          // read as text first
        if (!resp.ok) {
            console.error('Strava token error', resp.status, data);
            return res.status(500).json({ msg: 'Strava error', status: resp.status, data });
        }

        const json = JSON.parse(data);
        res.json(json);
    } catch (err) { next(err); }
});


// 2️⃣  Proxy any Strava GET you need (example: /me/activities)
router.get('/activities', async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) return res.status(401).end();
        const page     = req.query.page ?? '1';
        const per_page = req.query.perPage ?? '30';
        const result = await stravaRequest(
            `/athlete/activities?page=${page}&per_page=${per_page}`,
            accessToken
        );
        res.json(result);
    } catch (err) { next(err); }
});

router.get('/ping', (_, res) => res.json({ ok: true }));

export default router;
