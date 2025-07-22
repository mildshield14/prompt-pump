import React from 'react';
import { Activity, Zap } from 'lucide-react';
import { StravaApiService } from '../services/stravaApi';

interface StravaAuthProps {
  onAuthSuccess: (athlete: any) => void;
}

export const StravaAuth: React.FC<StravaAuthProps> = ({ onAuthSuccess }) => {
  const handleStravaAuth = () => {
    const stravaApi = new StravaApiService();
    stravaApi.initiateStravaAuth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full">
            <div className="w-8 h-8 text-white flex items-center justify-center font-bold text-lg">S</div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Strava Workout Analyzer
        </h1>
        
        <p className="text-gray-600 mb-4">
          Connect your Strava account to analyze your workouts with AI. Export your data and get personalized insights.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> Click "Connect with Strava" below and you'll be redirected to Strava to authorize this app!
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-orange-500" />
            <span>Export workouts in Strava API format</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-orange-500" />
            <span>Generate AI analysis prompts</span>
          </div>
          <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-orange-500" />
            <span>Select specific workouts to analyze</span>
          </div>
        </div>
        
        <button
          onClick={handleStravaAuth}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
        >
          <Activity className="w-5 h-5 mr-2" />
          Connect with Strava
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          Connect your Strava account to analyze your workouts. We only access your activity data and never modify anything.
        </p>
      </div>
    </div>
  );
};