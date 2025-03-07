// src/components/reports/ReportContent.js
'use client';
import { Heart, Brain, Activity, Sun, FileText } from 'lucide-react';
import ReportChart from './ReportChart';

const ReportContent = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="h-5 w-5 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 rounded mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No data available for the selected period</p>
        <p className="text-sm text-gray-400 mt-2">Try selecting a different time range or add more entries</p>
      </div>
    );
  }

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatMetric = (value, type) => {
    if (type === 'percentage') return `${value}%`;
    if (type === 'time') return `${value} min`;
    return value;
  };

  return (
    <div className="space-y-4">
      {/* Date Range */}
      {data.dateRange && (
        <p className="text-sm text-gray-500 text-center">
          Showing data from {new Date(data.dateRange.start).toLocaleDateString()} to {new Date(data.dateRange.end).toLocaleDateString()}
        </p>
      )}
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">Health Score</p>
              <p className={`text-2xl font-bold ${getHealthScoreColor(data.healthScore)}`}>
                {data.healthScore}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Active Habits</p>
              <p className="text-2xl font-bold">{data.overview.activeHabits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Goals Achieved</p>
              <p className="text-2xl font-bold">{data.overview.completedGoals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Avg. Daily Calories</p>
              <p className="text-2xl font-bold">{data.overview.avgCalories}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals and Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Goals */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">Goals Progress</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-xl font-bold">{data.goals?.active || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-xl font-bold">{data.goals?.completed || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">{data.goals?.total || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Habits */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">Habits Overview</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Active Habits</p>
                <p className="text-xl font-bold">{data.habits?.active || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Habits</p>
                <p className="text-xl font-bold">{data.habits?.total || 0}</p>
              </div>
            </div>
            {data.habits?.streaks && data.habits.streaks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Current Streaks</h4>
                <div className="space-y-2">
                  {data.habits.streaks
                    .filter(h => h.active)
                    .map((habit, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">{habit.name}</p>
                        <p className="text-sm font-medium">
                          {habit.streak} {habit.streak === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nutrition Overview */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">Nutrition Overview</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Average Calories</p>
              <p className="text-xl font-bold">{data.nutrition?.avgCalories || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Meals Logged</p>
              <p className="text-xl font-bold">{data.nutrition?.mealCount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Period</p>
              <p className="text-xl font-bold capitalize">{data.dateRange ? `${new Date(data.dateRange.start).toLocaleDateString()} - ${new Date(data.dateRange.end).toLocaleDateString()}` : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep & Exercise Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Sleep Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">Sleep Analysis</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Average</p>
                <p className="text-xl font-bold">{data.sleep.average}h</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quality</p>
                <p className="text-xl font-bold">{data.sleep.qualityScore}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Consistency</p>
                <p className="text-xl font-bold">{data.sleep.consistency}%</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Sleep Trends</h4>
              <ReportChart 
                data={data.sleep.data} 
                dataKey="value"
                nameKey="date"
                color="#10b981"
                type="sleep"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Insights</h4>
              <ul className="space-y-1">
                {data.sleep.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-gray-600">{insight}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Exercise Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">Exercise Analysis</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Average</p>
                <p className="text-xl font-bold">{data.exercise.average}m</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Intensity</p>
                <p className="text-xl font-bold">{data.exercise.intensity}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Consistency</p>
                <p className="text-xl font-bold">{data.exercise.consistency}%</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Exercise Trends</h4>
              <ReportChart 
                data={data.exercise.data} 
                dataKey="value"
                nameKey="date"
                color="#3b82f6"
                type="exercise"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Insights</h4>
              <ul className="space-y-1">
                {data.exercise.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-gray-600">{insight}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mental Health Analysis */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">Mental Health Analysis</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="text-xl font-bold">{data.mentalHealth?.averageScore || 0}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mood</p>
              <p className="text-xl font-bold capitalize">{data.mentalHealth?.predominantMood || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stress Level</p>
              <p className="text-xl font-bold capitalize">{data.mentalHealth?.stressLevel || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trend</p>
              <p className="text-xl font-bold capitalize">{data.mentalHealth?.trend || 'stable'}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Insights</h4>
            <ul className="space-y-1">
              {data.mentalHealth?.insights?.map((insight, i) => (
                <li key={i} className="text-sm text-gray-600">{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-3">Health Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.sleepAnalysis.insights && data.sleepAnalysis.insights.map((insight, index) => (
            <div key={`sleep-${index}`} className="flex items-start gap-2">
              <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500 mt-2" />
              <span className="text-sm">{insight}</span>
            </div>
          ))}
          {data.exerciseAnalysis.insights && data.exerciseAnalysis.insights.map((insight, index) => (
            <div key={`exercise-${index}`} className="flex items-start gap-2">
              <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-green-500 mt-2" />
              <span className="text-sm">{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportContent;