// src/components/reports/MetricCard.js
export default function MetricCard({ icon: Icon, label, value, bgColor, textColor, subtext }) {
  return (
    <div className={`${bgColor} rounded-xl p-4 h-full`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
            {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
          </div>
        </div>
        <Icon className={`h-6 w-6 ${textColor} opacity-80`} />
      </div>
    </div>
  );
}
