// src/app/goals/page.js
'use client';
import { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle2, Trophy } from 'lucide-react';
import { storageUtils } from '@/utils/storage';
import { getConsistentNow, getConsistentISOString, getConsistentDate } from '../../utils/dateUtils';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [newHabit, setNewHabit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('health');

  useEffect(() => {
    // Load goals and habits data with timestamps
    const loadGoalsData = () => {
      const data = storageUtils.getGoalsData();
      setGoals(data.goals);
      setHabits(data.habits);
    };

    loadGoalsData();
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'goalsData') {
        loadGoalsData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveGoalsData = (updatedGoals, updatedHabits) => {
    storageUtils.saveGoalsData(updatedGoals, updatedHabits);
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    const newGoalItem = {
      id: getConsistentNow(),
      content: newGoal,
      category: selectedCategory,
      completed: false,
      createdAt: getConsistentISOString(),
      targetDate: null,
    };

    const updatedGoals = [...goals, newGoalItem];
    setGoals(updatedGoals);
    saveGoalsData(updatedGoals, habits);
    setNewGoal('');
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    const newHabitItem = {
      id: getConsistentNow(),
      content: newHabit,
      category: selectedCategory,
      streak: 0,
      lastChecked: null,
      createdAt: getConsistentISOString()
    };

    const updatedHabits = [...habits, newHabitItem];
    setHabits(updatedHabits);
    saveGoalsData(goals, updatedHabits);
    setNewHabit('');
  };

  const toggleGoalCompletion = (goalId) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, completed: !goal.completed };
      }
      return goal;
    });
    setGoals(updatedGoals);
    saveGoalsData(updatedGoals, habits);
  };

  const checkHabit = (habitId) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const today = getConsistentDate().toDateString();
        const lastChecked = habit.lastChecked ? new Date(habit.lastChecked).toDateString() : null;
        
        if (lastChecked !== today) {
          return {
            ...habit,
            streak: lastChecked === new Date(getConsistentNow() - 86400000).toDateString() 
              ? habit.streak + 1 
              : 1,
            lastChecked: getConsistentISOString()
          };
        }
      }
      return habit;
    });
    setHabits(updatedHabits);
    saveGoalsData(goals, updatedHabits);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100">Active Goals</p>
                <h3 className="text-2xl font-bold">
                  {goals.filter(g => !g.completed).length}
                </h3>
              </div>
              <Trophy className="h-8 w-8 text-violet-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-100">Habit Streaks</p>
                <h3 className="text-2xl font-bold">
                  {Math.max(...habits.map(h => h.streak || 0), 0)}
                </h3>
              </div>
              <CheckCircle2 className="h-8 w-8 text-sky-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goals Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-violet-600" />
                Health Goals
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Set and track your health goals
              </p>
            </div>

            <form onSubmit={handleAddGoal} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a new health goal..."
                  className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={!newGoal.trim()}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {goals.map(goal => (
                <div
                  key={goal.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    goal.completed 
                      ? 'bg-gray-50 border-gray-100' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => toggleGoalCompletion(goal.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors
                      ${goal.completed 
                        ? 'border-violet-500 bg-violet-500' 
                        : 'border-gray-300 hover:border-violet-500'
                      }`}
                  >
                    {goal.completed && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <span className={`flex-1 ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                    {goal.content}
                  </span>
                </div>
              ))}
              {goals.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Add your first health goal to get started
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Habits Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-violet-600" />
                Daily Habits
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Build and maintain healthy habits
              </p>
            </div>

            <form onSubmit={handleAddHabit} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  placeholder="Add a new daily habit..."
                  className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={!newHabit.trim()}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white"
                >
                  <span className="flex-1">{habit.content}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium px-2 py-1 bg-violet-50 text-violet-700 rounded-md">
                      {habit.streak} day streak
                    </span>
                    <button
                      onClick={() => checkHabit(habit.id)}
                      className={`p-2 rounded-lg transition-colors
                        ${habit.lastChecked === getConsistentDate().toDateString()
                          ? 'bg-violet-100 text-violet-700'
                          : 'hover:bg-violet-50 text-gray-500 hover:text-violet-700'
                        }`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              {habits.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Start tracking your daily habits
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}