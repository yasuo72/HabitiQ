'use client';

export const InsightsPanel = ({ analysis }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4">AI Health Insights</h3>
      
      {/* Sleep Insights */}
      <div className="mb-4">
        <h4 className="font-medium text-sm text-gray-600">Sleep Patterns</h4>
        <ul className="mt-2 space-y-2">
          {analysis?.sleep?.insights?.map((insight, index) => (
            <li key={`sleep-${index}`} className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500 mt-2" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Exercise & Activity */}
      <div className="mb-4">
        <h4 className="font-medium text-sm text-gray-600">Exercise & Activity</h4>
        <ul className="mt-2 space-y-2">
          {analysis?.activity?.insights?.map((insight, index) => (
            <li key={`activity-${index}`} className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-green-500 mt-2" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="font-medium text-sm text-gray-600">Recommendations</h4>
        <ul className="mt-2 space-y-2">
          {analysis?.recommendations?.map((rec, index) => (
            <li key={`rec-${index}`} className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-purple-500 mt-2" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InsightsPanel;