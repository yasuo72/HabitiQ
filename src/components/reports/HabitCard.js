// src/components/reports/HabitCard.js
import { Trophy, Flame } from 'lucide-react';

export default function HabitCard({ habit, rank }) {
  return (
    <div className="bg-white rounded-xl border border-violet-100 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
          <span className="text-sm font-semibold text-violet-600">#{rank}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{habit.content}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Flame className="h-4 w-4 text-amber-500" />
            <p className="text-sm text-amber-600">
              {habit.streak || 0} day streak
            </p>
          </div>
        </div>
        {(habit.streak || 0) >= 7 && (
          <Trophy className="h-5 w-5 text-amber-400 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}
