// Strava API service for production use

// For production, you (the app developer) provide these credentials
// Users don't need to provide any API keys - they just authenticate with Strava
const STRAVA_CONFIG = {
  clientId: import.meta.env.VITE_STRAVA_CLIENT_ID,
  clientSecret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
  redirectUri: `${window.location.origin}/auth/callback`,
  scope: 'read,activity:read_all,profile:read_all'
}

export class StravaApiService {
  private accessToken: string | null = null;

  constructor() {
    // Only get from localStorage, don't set userEmail here
    this.accessToken = localStorage.getItem('strava_access_token');
  }

  initiateStravaAuth(): void {
    // Add state parameter for security (optional but recommended)
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('strava_auth_state', state);

    const authUrl = new URL('https://www.strava.com/oauth/authorize');
    authUrl.searchParams.append('client_id', STRAVA_CONFIG.clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', STRAVA_CONFIG.redirectUri);
    authUrl.searchParams.append('approval_prompt', 'force');
    authUrl.searchParams.append('scope', STRAVA_CONFIG.scope);
    authUrl.searchParams.append('state', state);

    console.log('Redirecting to Strava auth:', authUrl.toString());
    console.log('Redirect URI:', STRAVA_CONFIG.redirectUri);

    window.location.href = authUrl.toString();
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    console.log('Exchanging code for token:', code);

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CONFIG.clientId,
        client_secret: STRAVA_CONFIG.clientSecret,
        code,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token exchange failed:', response.status, errorData);
      throw new Error(`Failed to exchange code for token: ${response.status} ${errorData}`);
    }

    const tokenData = await response.json();
    console.log('Token exchange successful:', tokenData);

    this.accessToken = tokenData.access_token;
    localStorage.setItem('strava_access_token', this.accessToken);
    localStorage.setItem('strava_refresh_token', tokenData.refresh_token);
    localStorage.setItem('strava_expires_at', tokenData.expires_at.toString());
    localStorage.setItem('strava_athlete', JSON.stringify(tokenData.athlete));

    // Clean up state
    localStorage.removeItem('strava_auth_state');

    return tokenData;
  }

  async refreshAccessToken(): Promise<void> {
    const refreshToken = localStorage.getItem('strava_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CONFIG.clientId,
        client_secret: STRAVA_CONFIG.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token refresh failed:', response.status, errorData);
      throw new Error(`Failed to refresh token: ${response.status}`);
    }

    const tokenData = await response.json();

    this.accessToken = tokenData.access_token;
    localStorage.setItem('strava_access_token', this.accessToken);
    localStorage.setItem('strava_refresh_token', tokenData.refresh_token);
    localStorage.setItem('strava_expires_at', tokenData.expires_at.toString());
  }

  private async ensureValidToken(): Promise<void> {
    const expiresAt = localStorage.getItem('strava_expires_at');
    if (expiresAt && Date.now() / 1000 > parseInt(expiresAt)) {
      console.log('Token expired, refreshing...');
      await this.refreshAccessToken();
    }
  }

  private async makeAuthenticatedRequest(url: string): Promise<any> {
    await this.ensureValidToken();

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (response.status === 401) {
      console.log('Got 401, trying to refresh token...');
      // Token might be invalid, try to refresh
      await this.refreshAccessToken();
      const retryResponse = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!retryResponse.ok) {
        throw new Error('Authentication failed after token refresh');
      }

      return retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  async getAthlete(): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    return this.makeAuthenticatedRequest('https://www.strava.com/api/v3/athlete');
  }

  async getActivities(page = 1, perPage = 30): Promise<any[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    return this.makeAuthenticatedRequest(
        `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`
    );
  }

  isAuthenticated(): boolean {
    const token = this.accessToken;
    const expiresAt = localStorage.getItem('strava_expires_at');

    if (!token || !expiresAt) {
      return false;
    }

    // Check if token is expired (with 5 minute buffer)
    return Date.now() / 1000 < (parseInt(expiresAt) - 300);
  }

  logout(): void {
    this.accessToken = null;
    localStorage.removeItem('strava_access_token');
    localStorage.removeItem('strava_refresh_token');
    localStorage.removeItem('strava_expires_at');
    localStorage.removeItem('strava_athlete');
    localStorage.removeItem('strava_auth_state');
  }


  async exchangeCodeForTokenMock(email: string, firstName?: string, lastName?: string): Promise<any> {
    // Mock token exchange for demo
    const mockToken = {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token',
      expires_at: Math.floor(Date.now() / 1000) + 21600, // 6 hours from now
      athlete: this.getMockAthlete(email, firstName, lastName)
    };

    this.accessToken = mockToken.access_token;
    localStorage.setItem('strava_access_token', this.accessToken);
    localStorage.setItem('strava_athlete', JSON.stringify(mockToken.athlete));

    return mockToken;
  }

  async getAthleteMock(): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    // Return mock athlete data
    return this.getMockAthlete(this.userEmail || 'demo@example.com');
  }

  async getActivitiesMock(page = 1, perPage = 30): Promise<any[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    // Return mock activities
    return this.getMockActivities(page, perPage);
  }

  isAuthenticatedMock(): boolean {
    return this.accessToken !== null;
  }

  logoutMock(): void {
    this.accessToken = null;
    this.userEmail = null;
    localStorage.removeItem('strava_access_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('strava_athlete');
  }

  private getMockAthlete(email: string, firstName?: string, lastName?: string) {
    const emailParts = email.split('@')[0].split('.');
    const fName = firstName || (emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1));
    const lName = lastName || (emailParts[1] ? emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1) : 'Athlete');

    return {
      id: Math.floor(Math.random() * 1000000) + 10000,
      username: email.split('@')[0],
      firstname: fName,
      lastname: lName,
      city: this.getRandomCity(),
      state: this.getRandomState(),
      country: 'United States',
      sex: Math.random() > 0.5 ? 'M' : 'F',
      premium: Math.random() > 0.3,
      created_at: this.getRandomJoinDate(),
      updated_at: '2024-01-01T00:00:00Z',
      badge_type_id: 1,
      profile_medium: this.getRandomProfileImage(),
      profile: this.getRandomProfileImage(),
      weight: null,
      ftp: null
    };
  }

  private getRandomCity() {
    const cities = ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas'];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  private getRandomState() {
    const states = ['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'];
    return states[Math.floor(Math.random() * states.length)];
  }

  private getRandomJoinDate() {
    const start = new Date(2015, 0, 1);
    const end = new Date(2023, 11, 31);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString();
  }

  private getRandomProfileImage() {
    const images = [
      'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400'
    ];
    return images[Math.floor(Math.random() * images.length)];
  }

  private getMockActivities(page: number, perPage: number) {
    const activities = [];
    const activityTypes = ['Run', 'Ride', 'Swim', 'Hike', 'Walk'];

    for (let i = 0; i < perPage; i++) {
      const id = (page - 1) * perPage + i + 1;
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));

      activities.push({
        id,
        name: `${type} ${id}`,
        distance: Math.floor(Math.random() * 20000) + 1000,
        moving_time: Math.floor(Math.random() * 7200) + 1800,
        elapsed_time: Math.floor(Math.random() * 7200) + 1800,
        total_elevation_gain: Math.floor(Math.random() * 500),
        type,
        sport_type: type,
        start_date: date.toISOString(),
        start_date_local: date.toISOString(),
        timezone: '(GMT-08:00) America/Los_Angeles',
        utc_offset: -28800.0,
        location_city: 'San Francisco',
        location_state: 'California',
        location_country: 'United States',
        achievement_count: Math.floor(Math.random() * 5),
        kudos_count: Math.floor(Math.random() * 20),
        comment_count: Math.floor(Math.random() * 5),
        athlete_count: 1,
        photo_count: Math.floor(Math.random() * 3),
        map: {
          id: `map_${id}`,
          summary_polyline: 'mock_polyline_data',
          resource_state: 2
        },
        trainer: Math.random() > 0.8,
        commute: Math.random() > 0.9,
        manual: false,
        private: false,
        flagged: false,
        average_speed: Math.random() * 10 + 2,
        max_speed: Math.random() * 15 + 5,
        average_cadence: Math.random() * 90 + 60,
        average_watts: type === 'Ride' ? Math.random() * 200 + 100 : undefined,
        weighted_average_watts: type === 'Ride' ? Math.random() * 220 + 110 : undefined,
        kilojoules: type === 'Ride' ? Math.random() * 2000 + 500 : undefined,
        device_watts: type === 'Ride',
        has_heartrate: Math.random() > 0.3,
        average_heartrate: Math.random() > 0.3 ? Math.random() * 60 + 120 : undefined,
        max_heartrate: Math.random() > 0.3 ? Math.random() * 80 + 160 : undefined,
        calories: Math.floor(Math.random() * 800) + 200,
        workout_type: Math.floor(Math.random() * 5),
        suffer_score: Math.floor(Math.random() * 200) + 50,
        description: Math.random() > 0.7 ? 'Great workout session!' : undefined
      });
    }

    return activities;
  }
}