// src/components/reports/TrendAnalysis.js
'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TrendAnalysis = ({ data, type }) => {
  const [view, setView] = useState('week'); // week, month, quarter

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium">{label}</p>
          <div className="mt-1 space-y-1">
            {payload.map((item, index) => (
              <p key={index} className="text-sm flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: {item.value}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-700">Trend Analysis</h3>
        <div className="flex gap-2">
          {['week', 'month', 'quarter'].map((period) => (
            <button
              key={period}
              onClick={() => setView(period)}
              className={`px-3 py-1 text-sm rounded-md ${
                view === period
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// src/utils/reportHelpers.js
export const reportHelpers = {
  calculateStreak: (data, targetValue) => {
    let currentStreak = 0;
    let maxStreak = 0;

    data.forEach(item => {
      if (item.value >= targetValue) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return maxStreak;
  },

  generateSleepInsights: (sleepData) => {
    const avgSleep = sleepData.reduce((acc, curr) => acc + curr.value, 0) / sleepData.length;
    const insights = [];

    if (avgSleep < 7) {
      insights.push("You're getting less than recommended sleep. Aim for 7-9 hours.");
    } else if (avgSleep > 9) {
      insights.push("You might be oversleeping. Try maintaining a more consistent schedule.");
    }

    const consistency = calculateSleepConsistency(sleepData);
    if (consistency < 0.8) {
      insights.push("Your sleep schedule shows some irregularity. Try to maintain consistent sleep/wake times.");
    }

    return insights;
  },

  calculateHealthScore: (metrics) => {
    const weights = {
      sleep: 0.3,
      exercise: 0.3,
      nutrition: 0.2,
      mood: 0.2
    };

    let score = 0;
    
    // Sleep score (0-100)
    const sleepScore = metrics.avgSleep >= 7 && metrics.avgSleep <= 9 
      ? 100 
      : (100 - Math.abs(metrics.avgSleep - 8) * 10);

    // Exercise score
    const exerciseScore = (metrics.exerciseMinutes / 30) * 100;

    // Other scores...
    score = (
      sleepScore * weights.sleep +
      exerciseScore * weights.exercise +
      metrics.nutritionScore * weights.nutrition +
      metrics.moodScore * weights.mood
    );

    return Math.round(score);
  },

  generateRecommendations: (metrics) => {
    const recommendations = [];

    if (metrics.avgSleep < 7) {
      recommendations.push({
        type: 'sleep',
        priority: 'high',
        title: 'Improve Sleep Duration',
        description: 'You\'re averaging less than 7 hours of sleep. Try going to bed 30 minutes earlier.',
        actionItems: [
          'Set a consistent bedtime alarm',
          'Create a relaxing bedtime routine',
          'Avoid screens 1 hour before bed'
        ]
      });
    }

    // Add more recommendation logic...

    return recommendations;
  }
};