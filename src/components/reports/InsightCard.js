// src/components/reports/ReportChart.js
'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const ReportChart = ({ data, type }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-sm font-medium">
            {type === 'sleep' ? (
              `${payload[0].value} hours`
            ) : type === 'exercise' ? (
              `${payload[0].value} minutes`
            ) : (
              payload[0].value
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  const getYAxisLabel = () => {
    switch(type) {
      case 'sleep': return 'Hours';
      case 'exercise': return 'Minutes';
      case 'mood': return 'Score';
      default: return '';
    }
  };

  const getChartColor = () => {
    switch(type) {
      case 'sleep': return '#2563eb';
      case 'exercise': return '#16a34a';
      case 'mood': return '#8b5cf6';
      default: return '#000000';
    }
  };

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ 
              value: getYAxisLabel(), 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 12 }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke={getChartColor()}
            strokeWidth={2}
            dot={{ r: 3 }}
            name={type.charAt(0).toUpperCase() + type.slice(1)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
