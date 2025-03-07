// src/app/nutrition/page.js
'use client';
import { useState, useEffect } from 'react';
import { Apple, Plus, Search, ChevronDown, Calendar, BarChart3 } from 'lucide-react';
import { storageUtils } from '@/utils/storage';

export default function Nutrition() {
  const [meals, setMeals] = useState([]);
  const [newMeal, setNewMeal] = useState({
    type: 'breakfast',
    description: '',
    calories: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [waterIntake, setWaterIntake] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddMeal, setShowAddMeal] = useState(false);

  useEffect(() => {
    // Load nutrition data with timestamps
    const loadNutritionData = () => {
      const data = storageUtils.getNutritionData();
      setMeals(data.meals);
      setWaterIntake(data.waterIntake);
    };

    loadNutritionData();
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'nutritionData') {
        loadNutritionData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!newMeal.description.trim()) return;

    const mealEntry = {
      id: Date.now(),
      ...newMeal,
      calories: Number(newMeal.calories) || 0,
      createdAt: new Date().toISOString()
    };

    const updatedMeals = [...meals, mealEntry];
    setMeals(updatedMeals);
    storageUtils.saveNutritionData(updatedMeals, waterIntake);
    
    setNewMeal({
      type: 'breakfast',
      description: '',
      calories: '',
      date: selectedDate
    });
    setShowAddMeal(false);
  };

  const updateWaterIntake = (amount) => {
    const newAmount = Math.max(0, waterIntake + amount);
    setWaterIntake(newAmount);
    storageUtils.saveNutritionData(meals, newAmount);
  };

  const getMealsForDate = () => {
    return meals.filter(meal => meal.date === selectedDate);
  };

  const getTotalCalories = () => {
    return getMealsForDate().reduce((total, meal) => total + meal.calories, 0);
  };

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '🌞' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🍎' }
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Apple className="h-5 w-5 text-violet-600" />
              Nutrition Tracker
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track your meals and water intake
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 p-2"
              />
            </div>
            <button
              onClick={() => setShowAddMeal(true)}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Meal
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-600" />
                Daily Summary
              </h2>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-violet-100">Total Calories</p>
                      <h3 className="text-2xl font-bold">{getTotalCalories()}</h3>
                    </div>
                    <BarChart3 className="h-8 w-8 text-violet-200" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sky-100">Water Intake</p>
                      <h3 className="text-2xl font-bold">{waterIntake}ml</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => updateWaterIntake(250)}
                        className="px-3 py-1.5 bg-sky-400/20 text-white rounded-lg text-sm font-medium hover:bg-sky-400/30 transition-colors"
                      >
                        +250ml
                      </button>
                      <button
                        onClick={() => updateWaterIntake(-250)}
                        className="px-3 py-1.5 bg-sky-400/20 text-white rounded-lg text-sm font-medium hover:bg-sky-400/30 transition-colors"
                      >
                        -250ml
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meals List */}
              <div className="space-y-3">
                {getMealsForDate().length === 0 ? (
                  <div className="text-center py-8">
                    <Apple className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No meals logged for today</p>
                  </div>
                ) : (
                  getMealsForDate().map(meal => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-violet-100 hover:bg-violet-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center text-lg">
                          {mealTypes.find(t => t.value === meal.type)?.icon}
                        </div>
                        <div>
                          <p className="font-medium">{meal.description}</p>
                          <p className="text-sm text-gray-500">
                            {mealTypes.find(t => t.value === meal.type)?.label}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium px-3 py-1 bg-violet-100 text-violet-700 rounded-lg">
                          {meal.calories} cal
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Add Meal Form */}
          {showAddMeal && (
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-violet-600" />
                  Add Meal
                </h2>
                <form onSubmit={handleAddMeal} className="space-y-5">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1.5">Meal Type</label>
                    <select
                      value={newMeal.type}
                      onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })}
                      className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 p-2.5"
                    >
                      {mealTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 block mb-1.5">Description</label>
                    <input
                      type="text"
                      value={newMeal.description}
                      onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                      placeholder="What did you eat?"
                      className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 p-2.5"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 block mb-1.5">Calories</label>
                    <input
                      type="number"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                      placeholder="Estimated calories"
                      className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 p-2.5"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
                    >
                      Add Meal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}