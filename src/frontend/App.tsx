import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StravaAuth } from './components/StravaAuth.tsx';
import { AuthCallback } from './components/AuthCallback.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { WorkoutList } from './components/WorkoutList.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { PromptModal } from './components/PromptModal.tsx';
import { StravaActivity } from '../types/strava.ts';
import { StravaApiService } from './services/stravaApi.ts';

function App() {
  const [athlete, setAthlete] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [selectedActivitiesForExport, setSelectedActivitiesForExport] = useState<StravaActivity[]>([]);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkExistingAuth = async () => {
      try {
        const stravaApi = new StravaApiService();

        if (stravaApi.isAuthenticated()) {
          console.log('User is already authenticated, loading athlete data...');
          const athleteData = await stravaApi.getAthlete();
          setAthlete(athleteData);
        } else {
          console.log('User is not authenticated');
        }
      } catch (error) {
        console.error('Error checking existing authentication:', error);
        // If we can't load athlete data, clear any stale tokens
        const stravaApi = new StravaApiService();
        stravaApi.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingAuth();
  }, []);

  const handleAuthSuccess = (athleteData: any) => {
    console.log('Authentication successful, setting athlete:', athleteData);
    setAthlete(athleteData);
  };

  const handleLogout = () => {
    const stravaApi = new StravaApiService();
    stravaApi.logout();
    setAthlete(null);
  };

  const handleExport = (activities: StravaActivity[], athleteData: any) => {
    setSelectedActivitiesForExport(activities);
    setExportModalOpen(true);
  };

  const handleGeneratePrompt = (activities: StravaActivity[], athleteData: any) => {
    setSelectedActivitiesForExport(activities);
    setPromptModalOpen(true);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
    );
  }

  return (
      <Routes>
        <Route
            path="/auth/callback"
            element={<AuthCallback onAuthComplete={handleAuthSuccess} />}
        />

        <Route
            path="/"
            element={
              athlete ? (
                  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
                    <div className="max-w-7xl mx-auto p-6">
                      <UserProfile athlete={athlete} onLogout={handleLogout} />

                      <WorkoutList
                          athlete={athlete}
                          onExport={handleExport}
                          onGeneratePrompt={handleGeneratePrompt}
                      />

                      <ExportModal
                          isOpen={exportModalOpen}
                          onClose={() => setExportModalOpen(false)}
                          activities={selectedActivitiesForExport}
                          athlete={athlete}
                      />

                      <PromptModal
                          isOpen={promptModalOpen}
                          onClose={() => setPromptModalOpen(false)}
                          activities={selectedActivitiesForExport}
                          athlete={athlete}
                      />
                    </div>
                  </div>
              ) : (
                  <StravaAuth onAuthSuccess={handleAuthSuccess} />
              )
            }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;