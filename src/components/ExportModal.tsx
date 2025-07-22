import React from 'react';
import { X, Download, Copy, CheckCircle, Lightbulb } from 'lucide-react';
import { StravaActivity, WorkoutExportData } from '../types/strava';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: StravaActivity[];
  athlete: any;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, activities, athlete }) => {
  const [copied, setCopied] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<'json' | 'tcx' | 'gpx'>('tcx');

  if (!isOpen) return null;

  const exportData: WorkoutExportData = {
    athlete,
    activities,
    exportDate: new Date().toISOString(),
    totalActivities: activities.length
  };

  const generateExportData = () => {
    switch (exportFormat) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      case 'tcx':
        return generateTCX(exportData);
      case 'gpx':
        return generateGPX(exportData);
      default:
        return JSON.stringify(exportData, null, 2);
    }
  };

  const generateTCX = (data: WorkoutExportData) => {
    const tcxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>`;
    
    const tcxActivities = data.activities.map(activity => `
    <Activity Sport="${activity.type}">
      <Id>${activity.start_date}</Id>
      <Lap StartTime="${activity.start_date}">
        <TotalTimeSeconds>${activity.moving_time}</TotalTimeSeconds>
        <DistanceMeters>${activity.distance}</DistanceMeters>
        <Calories>${activity.calories || 0}</Calories>
        <AverageHeartRateBpm>${activity.average_heartrate ? `<Value>${activity.average_heartrate}</Value>` : ''}</AverageHeartRateBpm>
        <MaximumHeartRateBpm>${activity.max_heartrate ? `<Value>${activity.max_heartrate}</Value>` : ''}</MaximumHeartRateBpm>
        <Intensity>Active</Intensity>
        <TriggerMethod>Manual</TriggerMethod>
      </Lap>
      <Notes>${activity.name}</Notes>
    </Activity>`).join('');
    
    const tcxFooter = `
  </Activities>
  <Author>
    <Name>Strava Workout Analyzer</Name>
  </Author>
</TrainingCenterDatabase>`;
    
    return tcxHeader + tcxActivities + tcxFooter;
  };

  const generateGPX = (data: WorkoutExportData) => {
    const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Strava Workout Analyzer">
  <metadata>
    <name>Workout Export</name>
    <time>${data.exportDate}</time>
  </metadata>`;
    
    const gpxTracks = data.activities.map(activity => `
  <trk>
    <name>${activity.name}</name>
    <type>${activity.type}</type>
    <trkseg>
      <!-- Track points would be here if GPS data was available -->
    </trkseg>
  </trk>`).join('');
    
    const gpxFooter = `
</gpx>`;
    
    return gpxHeader + gpxTracks + gpxFooter;
  };

  const exportData_formatted = generateExportData();

  const handleDownload = () => {
    const mimeTypes = {
      json: 'application/json',
      tcx: 'application/vnd.garmin.tcx+xml',
      gpx: 'application/gpx+xml'
    };
    
    const blob = new Blob([exportData_formatted], { type: mimeTypes[exportFormat] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strava_workouts_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData_formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Export Workout Data</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Export Format</h4>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => setExportFormat('json')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  exportFormat === 'json'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">JSON</div>
                <div className="text-xs text-gray-500">Raw data format</div>
              </button>
              
              <button
                onClick={() => setExportFormat('tcx')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  exportFormat === 'tcx'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">TCX</div>
                <div className="text-xs text-gray-500">Training format</div>
              </button>
              
              <button
                onClick={() => setExportFormat('gpx')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  exportFormat === 'gpx'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">GPX</div>
                <div className="text-xs text-gray-500">GPS format</div>
              </button>
            </div>
            
            {exportFormat === 'tcx' && (
              <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Lightbulb className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>Recommended for AI Analysis:</strong> TCX format provides structured workout data that LLMs can easily parse and analyze for training insights.
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              Exporting {activities.length} workout{activities.length !== 1 ? 's' : ''} in {exportFormat.toUpperCase()} format.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download {exportFormat.toUpperCase()}
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600 font-mono">{exportFormat.toUpperCase()} Preview</span>
            </div>
            <pre className="p-4 text-sm text-gray-800 overflow-auto max-h-96 bg-gray-50">
              <code>{exportData_formatted}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};