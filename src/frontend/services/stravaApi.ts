/** StravaApiService – browser-side wrapper that talks only to our backend */
export class StravaApiService {
  private static BACKEND = '/api/strava';
  private static CLIENT_ID  = import.meta.env.VITE_STRAVA_CLIENT_ID;
  private static REDIRECT   = import.meta.env.VITE_STRAVA_REDIRECT_URI;
  private static SCOPE      = 'read,activity:read_all,profile:read_all';

  private accessToken: string | null;

  constructor() {
    this.accessToken = sessionStorage.getItem('strava_access_token');
  }

  /* ---------- auth flow ---------- */

  initiateStravaAuth() {
    const state = crypto.randomUUID();
    sessionStorage.setItem('strava_state', state);

    const url = new URL('https://www.strava.com/oauth/authorize');
    url.searchParams.set('client_id', StravaApiService.CLIENT_ID);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', StravaApiService.REDIRECT);
    url.searchParams.set('scope', StravaApiService.SCOPE);
    url.searchParams.set('state', state);

    window.location.href = url.toString();
  }

  async exchangeCodeForToken(code: string) {
    const res = await fetch(`${StravaApiService.BACKEND}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) throw new Error('Token exchange failed');
    const data = await res.json();

    this.accessToken = data.access_token;
    sessionStorage.setItem('strava_access_token', this.accessToken);
    return data;          // { access_token, refresh_token … athlete: {…} }
  }

  /* ---------- helpers ---------- */

  isAuthenticated() {
    return !!this.accessToken;
  }

  logout() {
    this.accessToken = null;
    sessionStorage.removeItem('strava_access_token');
  }

  /* ---------- data calls ---------- */

  private async authedFetch<T>(path: string): Promise<T> {
    if (!this.accessToken) throw new Error('Not authenticated');
    const res = await fetch(
        `${StravaApiService.BACKEND}${path}`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
    );
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json() as Promise<T>;
  }

  getAthlete() {
    return this.authedFetch<any>('/athlete');
  }

  getActivities(page = 1, perPage = 30) {
    return this.authedFetch<any[]>(`/activities?page=${page}&perPage=${perPage}`);
  }
}
