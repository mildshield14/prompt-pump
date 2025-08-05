import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StravaApiService } from '../services/stravaApi.ts';

interface AuthCallbackProps {
  onAuthComplete: (athlete: any) => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthComplete }) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');

        // Check if user denied access
        if (errorParam === 'access_denied') {
          console.log('User denied access');
          setError('Access was denied. Please try again.');
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        // Check if we have the authorization code
        if (!code) {
          console.error('No authorization code received');
          setError('No authorization code received from Strava.');
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        console.log('Processing authorization code:', code);

        const stravaApi = new StravaApiService();
        const response = await stravaApi.exchangeCodeForToken(code);

        console.log('Token exchange successful:', response);

        // Call the parent callback with athlete data
        onAuthComplete(response.athlete);

        // Navigate to home page
        navigate('/', { replace: true });

      } catch (error) {
        console.error('Authentication error:', error);
        setError('Failed to connect to Strava. Please try again.');

        // Clear any partial auth data
        const stravaApi = new StravaApiService();
        stravaApi.logout();

        // Redirect back to auth page after delay
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuth();
  }, [onAuthComplete, navigate]);

  if (error) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting you back...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isProcessing ? 'Connecting to Strava...' : 'Authentication complete!'}
          </p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we set up your account.</p>
        </div>
      </div>
  );
};