'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getConsistentNow, formatDate } from '../../utils/dateUtils';

export const PatternAnalysis = ({ type, timeRange }) => {
  const data = Array.from({ length: 7 }, (_, i) => ({
    date: formatDate(new Date(getConsistentNow() - (i * 24 * 60 * 60 * 1000)), {
      month: 'short',
      day: 'numeric'
    }),
    value: 20 + Math.random() * 80
  })).reverse();

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2563eb" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};