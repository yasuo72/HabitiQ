'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const SleepQualityChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  console.log('SleepQualityChart data:', data);

  useEffect(() => {
    if (data?.data && Array.isArray(data.data)) {
      setChartData(data.data);
    }
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-sm font-medium">Sleep: {payload[0].value} hrs</p>
          <p className="text-sm font-medium">Quality: {payload[1].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-2">Sleep Quality Analysis</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              yAxisId="sleep"
              domain={[0, 12]}
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Sleep (hrs)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <YAxis 
              yAxisId="quality"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Quality (%)', 
                angle: 90, 
                position: 'insideRight',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="sleep"
              type="monotone"
              dataKey="hours"
              stroke="#2563eb"
              name="Sleep"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="quality"
              type="monotone"
              dataKey="quality"
              stroke="#16a34a"
              name="Quality"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-600">Average Sleep</p>
          <p className="font-semibold">{data?.averageHours || '0'} hrs</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">Best Sleep</p>
          <p className="font-semibold">{data?.bestSleep || '0'} hrs</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">Pattern</p>
          <p className="font-semibold">{data?.pattern || 'No data'}</p>
        </div>
      </div>
    </div>
  );
};

export default SleepQualityChart;