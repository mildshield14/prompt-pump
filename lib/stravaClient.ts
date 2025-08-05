import fetch from 'node-fetch';
import type { RequestInit } from 'node-fetch';

const STRAVA_BASE = 'https://www.strava.com/api/v3';

export async function stravaRequest<T>(
    path: string,
    accessToken: string,
    init: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${STRAVA_BASE}${path}`, {
        ...init,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            ...init.headers
        }
    });
    if (!res.ok) throw new Error(`Strava API error ${res.status}`);
    return res.json() as Promise<T>;
}
