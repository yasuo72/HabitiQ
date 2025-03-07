'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Brain, Sparkles } from 'lucide-react';

export const MoodTracker = ({ moodData }) => {
  if (!moodData || !moodData.data || moodData.data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Mental Well-being</h3>
            <p className="text-sm text-gray-500">7-day mood and stress tracking</p>
          </div>
          <Brain className="h-5 w-5 text-violet-500" />
        </div>
        <div className="h-[250px] flex items-center justify-center">
          <p className="text-gray-500">No mood data available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className="text-sm">
            <span className="font-medium text-violet-600">Mood:</span>{' '}
            {payload[0]?.payload.mood}
          </p>
          <p className="text-sm">
            <span className="font-medium text-rose-600">Stress:</span>{' '}
            {payload[0]?.payload.stress}
          </p>
          <p className="text-sm">
            <span className="font-medium text-emerald-600">Score:</span>{' '}
            {payload[0]?.payload.moodScore}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Mental Well-being</h3>
          <p className="text-sm text-gray-500">7-day mood and stress tracking</p>
        </div>
        <Brain className="h-5 w-5 text-violet-500" />
      </div>

      {/* Mood Score Chart */}
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={moodData.data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickMargin={8}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickMargin={8}
              label={{ 
                value: 'Score', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: '12px' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="moodScore" 
              name="Mood Score"
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-violet-50 p-3 rounded-lg">
          <p className="text-sm text-violet-600 font-medium">Predominant Mood</p>
          <p className="text-lg font-semibold capitalize">{moodData.predominantMood}</p>
        </div>
        <div className="bg-rose-50 p-3 rounded-lg">
          <p className="text-sm text-rose-600 font-medium">Stress Level</p>
          <p className="text-lg font-semibold capitalize">{moodData.stressLevel}</p>
        </div>
      </div>

      {/* Patterns */}
      {moodData.patterns && moodData.patterns.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Observed Patterns</h4>
          <ul className="space-y-1">
            {moodData.patterns.map((pattern, index) => (
              <li key={index} className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;