'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const HealthInsights = ({ chartData }) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Health Trends</h3>
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-gray-500">No health data available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm">
              <span className="font-medium" style={{ color: item.color }}>
                {item.name}:
              </span>{' '}
              {item.name === 'Sleep' 
                ? `${item.value} hrs`
                : item.name === 'Exercise'
                  ? `${item.value} min`
                  : `${item.value}%`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Health Trends</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickMargin={8}
            />
            <YAxis 
              yAxisId="hours"
              tick={{ fontSize: 12 }}
              tickMargin={8}
              domain={[0, 12]}
              label={{ 
                value: 'Hours / Minutes', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: '12px' }
              }}
            />
            <YAxis 
              yAxisId="score"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickMargin={8}
              label={{ 
                value: 'Score %', 
                angle: 90, 
                position: 'insideRight',
                style: { fontSize: '12px' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              yAxisId="hours"
              type="monotone" 
              dataKey="hours" 
              name="Sleep"
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line 
              yAxisId="score"
              type="monotone" 
              dataKey="quality" 
              name="Sleep Quality"
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line 
              yAxisId="score"
              type="monotone" 
              dataKey="mentalScore" 
              name="Mental Health"
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
            <Line 
              yAxisId="hours"
              type="monotone" 
              dataKey="exercise" 
              name="Exercise"
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HealthInsights;