'use client';
import { useState, useEffect } from 'react';
import {
  Clock,
  Brain,
  BarChart3,
  MessageSquare,
  PlusCircle,
  Search,
  ChevronDown
} from 'lucide-react';
import { storageUtils } from '@/utils/storage';
import { getConsistentNow, getConsistentISOString } from '../../utils/dateUtils';

export default function Dashboard() {
  const [journalEntry, setJournalEntry] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [goalsData, setGoalsData] = useState({ goals: [], habits: [] });
  const [nutritionData, setNutritionData] = useState({ meals: [], waterIntake: 0 });
  const [showAllEntries, setShowAllEntries] = useState(false);

  useEffect(() => {
    // Fetch data from storage
    const savedEntries = storageUtils.getJournalEntries();
    const savedGoalsData = storageUtils.getGoalsData();
    const savedNutritionData = storageUtils.getNutritionData();
    const savedAnalysis = localStorage.getItem('journalAnalysis');
    const parsedAnalysis = savedAnalysis ? JSON.parse(savedAnalysis) : null;

    // Set state
    setJournalEntries(savedEntries);
    setGoalsData(savedGoalsData);
    setNutritionData(savedNutritionData);

    if (parsedAnalysis) {
      setAnalysis(parsedAnalysis);
      setLastUpdateTime(parsedAnalysis.timestamp);
    }

    // Calculate health score
    const calculateHealthScore = () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Calculate active habits
      const activeHabits = savedGoalsData.habits.filter(habit => {
        const lastChecked = habit.lastChecked ? new Date(habit.lastChecked) : null;
        return lastChecked &&
               (lastChecked.toDateString() === today.toDateString() ||
                lastChecked.toDateString() === yesterday.toDateString());
      }).length;

      // Get latest analysis metrics
      const metrics = parsedAnalysis?.metrics || {};

      // Calculate weighted health score
      const weights = {
        sleep: 0.35,
        exercise: 0.25,
        mentalHealth: 0.4
      };

      let totalScore = 0;
      let validMetrics = 0;

      // Sleep score
      if (metrics.sleep?.quality) {
        totalScore += metrics.sleep.quality * weights.sleep;
        validMetrics++;
      }

      // Exercise score
      if (metrics.exercise?.average) {
        const exerciseScore = Math.min(100, (metrics.exercise.average / 30) * 100);
        totalScore += exerciseScore * weights.exercise;
        validMetrics++;
      }

      // Mental health score
      if (metrics.mentalHealth?.averageScore) {
        totalScore += metrics.mentalHealth.averageScore * weights.mentalHealth;
        validMetrics++;
      }

      const overallScore = validMetrics > 0 ? Math.round(totalScore / validMetrics) : 0;

      const score = {
        score: overallScore,
        timestamp: new Date().toISOString(),
        details: {
          sleep: metrics.sleep?.quality || 0,
          exercise: metrics.exercise?.average ? Math.min(100, (metrics.exercise.average / 30) * 100) : 0,
          habits: activeHabits,
          mood: metrics.mentalHealth?.predominantMood || 'neutral',
          nutrition: savedNutritionData.meals.length > 0 ?
            Math.min(100, (savedNutritionData.meals.filter(m =>
              new Date(m.date).toDateString() === today.toDateString()
            ).length / 3) * 100) : 0
        }
      };

      setHealthScore(score);
      localStorage.setItem('healthScore', JSON.stringify(score));
    };

    calculateHealthScore();

    const handleStorageChange = (e) => {
      if (e.key === 'goalsData') {
        const newGoalsData = e.newValue ? JSON.parse(e.newValue) : { goals: [], habits: [] };
        setGoalsData(newGoalsData);
        calculateHealthScore();
      } else if (e.key === 'nutritionData') {
        const newNutritionData = e.newValue ? JSON.parse(e.newValue) : { meals: [], waterIntake: 0 };
        setNutritionData(newNutritionData);
        calculateHealthScore();
      } else if (e.key === 'journalAnalysis') {
        calculateHealthScore();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array to run only once

  const handleJournalSubmit = (e) => {
    e.preventDefault();

    const newEntry = {
      id: getConsistentNow(),
      date: getConsistentISOString(),
      content: journalEntry
    };

    const updatedEntries = storageUtils.addJournalEntry(newEntry);
    if (updatedEntries) {
      setJournalEntries(updatedEntries);
      setJournalEntry('');
    }
  };

  const handleAnalyzeReport = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: journalEntries,
          type: 'batch'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze journal entries');
      }

      const analysisData = await response.json();
      const timestamp = new Date().toISOString();

      localStorage.setItem('journalAnalysis', JSON.stringify({
        ...analysisData,
        timestamp
      }));

      setAnalysis(analysisData);
      setLastUpdateTime(timestamp);

    } catch (error) {
      console.error('Error analyzing journal entries:', error);
      alert('Failed to analyze journal entries. Please try again.');
    }
  };

  const filteredEntries = journalEntries.filter(entry =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedEntries = showAllEntries ? filteredEntries : filteredEntries.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Health Score</p>
                <h3 className="text-2xl font-bold">
                  {healthScore ? `${healthScore.score}%` : 'N/A'}
                </h3>
                {healthScore && (
                  <p className="text-sm text-emerald-100 mt-1">
                    Last updated: {new Date(healthScore.timestamp).toLocaleDateString()}
                  </p>
                )}
              </div>
              <BarChart3 className="h-8 w-8 text-emerald-200" />
            </div>
            {healthScore?.details && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-emerald-100">Sleep Quality</p>
                  <p className="font-medium">{healthScore.details.sleep}%</p>
                </div>
                <div>
                  <p className="text-emerald-100">Exercise</p>
                  <p className="font-medium">{healthScore.details.exercise}%</p>
                </div>
                <div>
                  <p className="text-emerald-100">Active Habits</p>
                  <p className="font-medium">{healthScore.details.habits}</p>
                </div>
                <div>
                  <p className="text-emerald-100">Mood</p>
                  <p className="font-medium capitalize">{healthScore.details.mood}</p>
                </div>
                <div>
                  <p className="text-emerald-100">Nutrition</p>
                  <p className="font-medium">{healthScore.details.nutrition}%</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100">Goals Progress</p>
                <h3 className="text-2xl font-bold">
                  {goalsData.goals.filter(g => g.completed).length}/{goalsData.goals.length}
                </h3>
              </div>
              <Brain className="h-8 w-8 text-violet-200" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-violet-100">Active Goals</p>
                <p className="font-medium">{goalsData.goals.filter(g => !g.completed).length}</p>
              </div>
              <div>
                <p className="text-violet-100">Active Habits</p>
                <p className="font-medium">{healthScore?.details?.habits || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-100">Nutrition</p>
                <h3 className="text-2xl font-bold">
                  {nutritionData.meals.length} meals
                </h3>
              </div>
              <MessageSquare className="h-8 w-8 text-sky-200" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-sky-100">Water Intake</p>
                <p className="font-medium">{nutritionData.waterIntake}ml</p>
              </div>
              <div>
                <p className="text-sky-100">Today&apos;s Meals</p>
                <p className="font-medium">
                  {nutritionData.meals.filter(m =>
                    new Date(m.date).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-violet-600" />
                Today&apos;s Journal
              </h2>
              <p className="text-sm text-gray-500 mt-1">Write freely about your day, feelings, and experiences.</p>
            </div>
            <form onSubmit={handleJournalSubmit} className="space-y-4">
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="How are you feeling today? Pour your thoughts here..."
                className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm resize-none transition-all"
              />
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={!journalEntry.trim()}
                  className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-colors"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Save Entry
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleAnalyzeReport}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {lastUpdateTime && new Date(lastUpdateTime).toDateString() === new Date().toDateString() ? (
                      `Updated ${new Date(lastUpdateTime).toLocaleString('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })}`
                    ) : 'Analyze Report'}
                  </button>
                  <a
                    href="/analytics"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Health Insights
                  </a>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Journal Timeline</h2>
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[500px] pr-2 -mr-2">
              {filteredEntries.length > 0 ? (
                <div className="space-y-4">
                  {displayedEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="border-l-2 border-violet-500 pl-4 py-2 hover:bg-gray-50 rounded-r-lg transition-colors"
                    >
                      <p className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="mt-2 text-gray-700">{entry.content}</p>
                    </div>
                  ))}
                  {filteredEntries.length > 3 && (
                    <button
                      onClick={() => setShowAllEntries(!showAllEntries)}
                      className="w-full py-2 px-4 text-sm text-violet-600 hover:bg-violet-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {showAllEntries ? 'Show Less' : 'Show More'}
                      <ChevronDown className={`h-4 w-4 transition-transform ${showAllEntries ? 'transform rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? 'No entries match your search.' : 'Your journal entries will appear here. Start writing to create your first entry!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
