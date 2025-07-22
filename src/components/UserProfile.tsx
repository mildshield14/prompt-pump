import React from 'react';
import { User, MapPin, Calendar, Award, LogOut } from 'lucide-react';
import { StravaApiService } from '../services/stravaApi';

interface UserProfileProps {
  athlete: any;
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ athlete, onLogout }) => {
  const handleLogout = () => {
    const stravaApi = new StravaApiService();
    stravaApi.logout();
    onLogout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={athlete.profile_medium || athlete.profile}
            alt={`${athlete.firstname} ${athlete.lastname}`}
            className="w-16 h-16 rounded-full border-4 border-orange-200"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {athlete.firstname} {athlete.lastname}
            </h2>
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span>
                {athlete.city && athlete.state 
                  ? `${athlete.city}, ${athlete.state}` 
                  : 'Location not set'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="flex items-center text-gray-600 mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm">Member since {formatDate(athlete.created_at)}</span>
            </div>
            {athlete.premium && (
              <div className="flex items-center text-orange-600">
                <Award className="w-4 h-4 mr-1" />
                <span className="text-sm font-semibold">Premium</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};