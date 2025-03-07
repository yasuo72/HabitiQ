// src/components/reports/ProgressBar.js
export default function ProgressBar({ value, max, label, color }) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${color}`}>
          {value} / {max}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${color.replace('text', 'bg')}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
