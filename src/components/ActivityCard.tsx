import React from 'react';
import { Calendar, Clock, MapPin, Zap, Heart, Gauge } from 'lucide-react';
import { StravaActivity } from '../types/strava';

interface ActivityCardProps {
  activity: StravaActivity;
  isSelected: boolean;
  onSelect: (activityId: number) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isSelected, onSelect }) => {
  const formatDistance = (distance: number) => {
    return (distance / 1000).toFixed(2) + ' km';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatSpeed = (speed: number) => {
    return (speed * 3.6).toFixed(1) + ' km/h';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Run':
        return '🏃‍♂️';
      case 'Ride':
        return '🚴‍♂️';
      case 'Swim':
        return '🏊‍♂️';
      case 'Hike':
        return '🥾';
      case 'Walk':
        return '🚶‍♂️';
      default:
        return '💪';
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 border-2 cursor-pointer ${
        isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'
      }`}
      onClick={() => onSelect(activity.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getActivityIcon(activity.type)}</div>
          <div>
            <h3 className="font-semibold text-gray-900 truncate max-w-48">{activity.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatDate(activity.start_date)}</span>
            </div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(activity.id);
          }}
          className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-orange-500" />
          <span>{formatDistance(activity.distance)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-orange-500" />
          <span>{formatDuration(activity.moving_time)}</span>
        </div>
        {activity.average_speed && (
          <div className="flex items-center text-sm text-gray-600">
            <Gauge className="w-4 h-4 mr-2 text-orange-500" />
            <span>{formatSpeed(activity.average_speed)}</span>
          </div>
        )}
        {activity.average_heartrate && (
          <div className="flex items-center text-sm text-gray-600">
            <Heart className="w-4 h-4 mr-2 text-red-500" />
            <span>{Math.round(activity.average_heartrate)} bpm</span>
          </div>
        )}
      </div>

      {(activity.total_elevation_gain > 0 || activity.average_watts) && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between text-sm">
            {activity.total_elevation_gain > 0 && (
              <div className="flex items-center text-gray-600">
                <span className="text-orange-500 mr-1">⬆</span>
                <span>{Math.round(activity.total_elevation_gain)}m elevation</span>
              </div>
            )}
            {activity.average_watts && (
              <div className="flex items-center text-gray-600">
                <Zap className="w-3 h-3 mr-1 text-yellow-500" />
                <span>{Math.round(activity.average_watts)}W avg</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
        <span>{activity.kudos_count} kudos</span>
        {activity.trainer && <span className="bg-gray-100 px-2 py-1 rounded">Indoor</span>}
      </div>
    </div>
  );
};