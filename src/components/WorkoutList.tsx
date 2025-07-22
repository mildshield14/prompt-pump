import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckSquare, Square, Download, FileText } from 'lucide-react';
import { StravaActivity } from '../types/strava';
import { StravaApiService } from '../services/stravaApi';
import { ActivityCard } from './ActivityCard';

interface WorkoutListProps {
  athlete: any;
  onExport: (activities: StravaActivity[], athlete: any) => void;
  onGeneratePrompt: (activities: StravaActivity[], athlete: any) => void;
}

export const WorkoutList: React.FC<WorkoutListProps> = ({ athlete, onExport, onGeneratePrompt }) => {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<StravaActivity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('All');
  const [page, setPage] = useState(1);

  const stravaApi = new StravaApiService();

  useEffect(() => {
    loadActivities();
  }, [page]);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, activityTypeFilter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const newActivities = await stravaApi.getActivities(page, 30);
      if (page === 1) {
        setActivities(newActivities);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activityTypeFilter !== 'All') {
      filtered = filtered.filter(activity => activity.type === activityTypeFilter);
    }

    setFilteredActivities(filtered);
  };

  const handleSelectActivity = (activityId: number) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activityId)) {
      newSelected.delete(activityId);
    } else {
      newSelected.add(activityId);
    }
    setSelectedActivities(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedActivities.size === filteredActivities.length) {
      setSelectedActivities(new Set());
    } else {
      setSelectedActivities(new Set(filteredActivities.map(a => a.id)));
    }
  };

  const handleExport = () => {
    const selectedActivityData = activities.filter(a => selectedActivities.has(a.id));
    onExport(selectedActivityData, athlete);
  };

  const handleGeneratePrompt = () => {
    const selectedActivityData = activities.filter(a => selectedActivities.has(a.id));
    onGeneratePrompt(selectedActivityData, athlete);
  };

  const activityTypes = ['All', ...new Set(activities.map(a => a.type))];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Workouts</h2>
        <p className="text-gray-600">Select workouts to export and analyze</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={activityTypeFilter}
                onChange={(e) => setActivityTypeFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                {activityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors"
            >
              {selectedActivities.size === filteredActivities.length ? (
                <CheckSquare className="w-4 h-4 mr-1" />
              ) : (
                <Square className="w-4 h-4 mr-1" />
              )}
              {selectedActivities.size === filteredActivities.length ? 'Deselect All' : 'Select All'}
            </button>

            <div className="text-sm text-gray-600">
              {selectedActivities.size} of {filteredActivities.length} selected
            </div>
          </div>
        </div>

        {selectedActivities.size > 0 && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data ({selectedActivities.size})
            </button>
            
            <button
              onClick={handleGeneratePrompt}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate AI Prompt
            </button>
          </div>
        )}
      </div>

      {/* Activities Grid */}
      {loading && page === 1 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isSelected={selectedActivities.has(activity.id)}
                onSelect={handleSelectActivity}
              />
            ))}
          </div>

          {filteredActivities.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No activities found matching your criteria.</p>
            </div>
          )}

          {activities.length >= 30 && (
            <div className="text-center">
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loading}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};