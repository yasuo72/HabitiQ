'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const SymptomFrequency = ({ data }) => {
  // Ensure data is properly structured
  const symptoms = data?.data || [];
  const hasData = symptoms.length > 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            Frequency: {payload[0].value} times
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-2">Symptom Analysis</h3>
      {hasData ? (
        <>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={symptoms}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Frequency', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 12 }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Key Observations</h4>
            <ul className="space-y-2 text-sm">
              {data.insights?.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-red-500 mt-2" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No symptoms reported in the analyzed entries
        </div>
      )}
    </div>
  );
};