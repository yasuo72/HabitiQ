// src/app/analytics/page.js
'use client';

import { useState, useEffect } from 'react';
import { LineChart, Brain, ActivitySquare, Thermometer, Heart } from 'lucide-react';
import { AnalyzeButton } from '@/components/analytics/AnalyzeButton';
import { SleepQualityChart } from '@/components/analytics/SleepQualityChart';
import { MoodTracker } from '@/components/analytics/MoodTracker';
import { SymptomFrequency } from '@/components/analytics/SymptomFrequency';
import HealthInsights from '@/components/analytics/HealthInsights';
import { storageUtils } from '@/utils/storage';
import { MessageSquare, BarChart3 } from 'lucide-react';

const determinePattern = (data) => {
  if (!data || data.length < 2) return 'Not enough data';
  
  const movingAvg = data.reduce((acc, val, i, arr) => {
    if (i < 2) return acc;
    const slice = arr.slice(i - 2, i + 1);
    const avg = slice.reduce((sum, num) => sum + num, 0) / 3;
    return [...acc, avg];
  }, []);
  
  const trend = movingAvg[movingAvg.length - 1] - movingAvg[0];
  if (Math.abs(trend) < 0.5) return 'Stable';
  return trend > 0 ? 'Improving' : 'Declining';
};

const calculateTrends = (history) => {
  if (!history || history.length < 2) return null;
  
  const latest = history[0];
  const previous = history[1];
  
  if (!latest || !previous) return null;
  
  const trends = {
    sleep: {
      change: ((latest.metrics.sleep - previous.metrics.sleep) / previous.metrics.sleep * 100).toFixed(1),
      direction: latest.metrics.sleep >= previous.metrics.sleep ? 'up' : 'down'
    },
    exercise: {
      change: ((latest.metrics.exercise - previous.metrics.exercise) / previous.metrics.exercise * 100).toFixed(1),
      direction: latest.metrics.exercise >= previous.metrics.exercise ? 'up' : 'down'
    },
    mood: {
      previous: previous.metrics.mood,
      current: latest.metrics.mood,
      improved: ['neutral', 'happy', 'very happy'].indexOf(latest.metrics.mood) > 
               ['neutral', 'happy', 'very happy'].indexOf(previous.metrics.mood)
    }
  };
  
  return trends;
};

const prepareChartData = (history) => {
  if (!history || history.length === 0) return [];
  
  // Ensure entries are sorted by date
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB - dateA;
  });
  
  return sortedHistory
    .slice(0, 7)  // Take the most recent 7 entries
    .map(entry => {
      const timestamp = entry.timestamp ? new Date(entry.timestamp) : new Date();
      const isValidDate = !isNaN(timestamp.getTime());
      
      return {
        date: isValidDate 
          ? timestamp.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })
          : 'Invalid Date',
        hours: entry.metrics?.sleep?.average || 0,
        quality: entry.metrics?.sleep?.quality || 0,
        mentalScore: entry.metrics?.mentalHealth?.averageScore || 0,
        exercise: entry.metrics?.exercise?.average || 0,
        rawTimestamp: isValidDate ? timestamp.getTime() : 0
      };
    })
    .sort((a, b) => a.rawTimestamp - b.rawTimestamp); // Ensure chronological order
};

const prepareMoodData = (history) => {
  if (!history || history.length === 0) return [];
  
  // Ensure entries are sorted by date
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB - dateA;
  });
  
  const processedData = sortedHistory
    .slice(0, 7)  // Take the most recent 7 entries
    .map(entry => {
      const timestamp = entry.timestamp ? new Date(entry.timestamp) : new Date();
      const isValidDate = !isNaN(timestamp.getTime());
      
      return {
        date: isValidDate 
          ? timestamp.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })
          : 'Invalid Date',
        mood: entry.metrics?.mentalHealth?.predominantMood || 'neutral',
        moodScore: entry.metrics?.mentalHealth?.averageScore || 50,
        stress: entry.metrics?.mentalHealth?.stressLevel || 'moderate',
        rawTimestamp: isValidDate ? timestamp.getTime() : 0
      };
    })
    .sort((a, b) => a.rawTimestamp - b.rawTimestamp); // Ensure chronological order

  const latestMetrics = history[0]?.metrics?.mentalHealth || {};
  
  return {
    data: processedData,
    predominantMood: latestMetrics.predominantMood || 'neutral',
    stressLevel: latestMetrics.stressLevel || 'moderate',
    trend: latestMetrics.trend || 'stable'
  };
};

// Helper function to calculate sleep score
const calculateSleepScore = (hours) => {
  if (!hours) return 0;
  const idealHours = 8;
  const deviation = Math.abs(hours - idealHours);
  return Math.max(0, Math.min(100, Math.round(100 - (deviation * 12.5))));
};

const calculateSleepQuality = (metrics) => {
  if (!metrics || !metrics.sleep) return 0;
  
  // Calculate sleep quality based on various factors
  const targetSleep = 8; // ideal hours of sleep
  const sleepDeviation = Math.abs(metrics.sleep - targetSleep);
  const qualityScore = Math.max(0, 100 - (sleepDeviation * 15)); // Deduct 15 points per hour deviation
  
  return Math.round(qualityScore);
};

const processAnalysisResults = (results) => {
  if (!results || results.length === 0) return null;

  const validResults = results.filter(r => !r.error);
  
  // Calculate averages and aggregate metrics
  const metrics = validResults.reduce((acc, result) => {
    const metrics = result.metrics || {};
    return {
      sleep: acc.sleep + (metrics.sleep || 0),
      exercise: acc.exercise + (metrics.exercise || 0),
      symptoms: [...acc.symptoms, ...(metrics.symptoms || [])],
      moods: [...acc.moods, metrics.mood || 'neutral'],
      energy: [...acc.energy, metrics.energy || 'medium']
    };
  }, { sleep: 0, exercise: 0, symptoms: [], moods: [], energy: [] });

  // Calculate averages
  const totalEntries = validResults.length;
  const averageSleep = totalEntries > 0 ? metrics.sleep / totalEntries : 0;
  const averageExercise = totalEntries > 0 ? metrics.exercise / totalEntries : 0;

  // Find most common values
  const commonSymptoms = findMostCommon(metrics.symptoms);
  const predominantMood = findMostCommon(metrics.moods)[0];
  const predominantEnergy = findMostCommon(metrics.energy)[0];

  // Aggregate insights and recommendations
  const allInsights = validResults.reduce((acc, result) => {
    return [...acc, ...(result.insights || [])];
  }, []);

  const allRecommendations = validResults.reduce((acc, result) => {
    return [...acc, ...(result.recommendations || [])];
  }, []);

  // Remove duplicates and take top items
  const uniqueInsights = [...new Set(allInsights)].slice(0, 5);
  const uniqueRecommendations = [...new Set(allRecommendations)].slice(0, 5);

  return {
    metrics: {
      sleep: averageSleep,
      exercise: averageExercise,
      symptoms: commonSymptoms.slice(0, 5), // Top 5 symptoms
      mood: predominantMood,
      energy: predominantEnergy
    },
    insights: uniqueInsights,
    recommendations: uniqueRecommendations,
    analysisCount: totalEntries,
    successRate: (totalEntries / results.length) * 100
  };
};

// Helper function to find most common items in an array
const findMostCommon = (arr) => {
  if (!arr || arr.length === 0) return [];
  
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .map(([val]) => val);
};

export default function Analytics() {
  const [entriesCount, setEntriesCount] = useState(7);
  const [journalEntries, setJournalEntries] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEntries = () => {
      const savedEntries = storageUtils.getJournalEntries();
      setJournalEntries(savedEntries);
    };

    // Load stored analysis data and history if available
    const loadStoredAnalysis = () => {
      try {
        // Load current analysis
        const storedAnalysis = localStorage.getItem('journalAnalysis');
        if (storedAnalysis) {
          try {
            const parsedAnalysis = JSON.parse(storedAnalysis);
            setAnalysis(parsedAnalysis);
            setLastUpdateTime(new Date().toISOString());
          } catch (e) {
            console.error('Error parsing current analysis:', e);
            localStorage.removeItem('journalAnalysis'); // Clear invalid data
          }
        }

        // Load and validate history
        const storedHistory = localStorage.getItem('journalAnalysisHistory');
        if (storedHistory) {
          try {
            const history = JSON.parse(storedHistory);
            if (Array.isArray(history)) {
              setAnalysisHistory(history);
            } else {
              console.error('Invalid history format');
              localStorage.removeItem('journalAnalysisHistory');
              setAnalysisHistory([]);
            }
          } catch (e) {
            console.error('Error parsing analysis history:', e);
            localStorage.removeItem('journalAnalysisHistory');
            setAnalysisHistory([]);
          }
        } else {
          setAnalysisHistory([]);
        }
      } catch (error) {
        console.error('Error loading stored analysis:', error);
        setAnalysisHistory([]);
      }
    };

    loadEntries();
    loadStoredAnalysis();
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'journalAnalysis' || e.key === 'journalAnalysisHistory') {
        loadStoredAnalysis();
      } else if (e.key === 'journalEntries') {
        loadEntries();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAnalyze = async () => {
    if (!journalEntries.length) return;

    setIsAnalyzing(true);
    setError(null);
    setLoading(true);

    try {
      const entriesToAnalyze = journalEntries.slice(0, entriesCount);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: entriesToAnalyze })
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Analysis error:', data);
        setError(data.error || 'Failed to analyze entries. Please try again.');
        return;
      }

      const analysisData = await response.json();
      
      if (!analysisData.metrics) {
        setError('No valid analysis results obtained. Please try again.');
        return;
      }

      // Add timestamp to analysis data
      const timestamp = new Date().toISOString();
      const analysisWithTimestamp = {
        ...analysisData,
        timestamp
      };

      // Update current analysis
      setAnalysis(analysisWithTimestamp);
      setLastUpdateTime(timestamp);
      
      // Store current analysis
      localStorage.setItem('journalAnalysis', JSON.stringify(analysisWithTimestamp));

      // Initialize or update history
      const storedHistory = localStorage.getItem('journalAnalysisHistory');
      const currentHistory = storedHistory && storedHistory !== 'undefined' 
        ? JSON.parse(storedHistory) 
        : [];

      // Ensure currentHistory is an array
      const historyArray = Array.isArray(currentHistory) ? currentHistory : [];
      
      // Add new analysis to history
      const updatedHistory = [analysisWithTimestamp, ...historyArray].slice(0, 30);
      
      // Store updated history
      localStorage.setItem('journalAnalysisHistory', JSON.stringify(updatedHistory));
      setAnalysisHistory(updatedHistory);

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze entries. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <LineChart className="h-5 w-5 text-violet-600" />
              Health Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {journalEntries.length === 0 && 'Start by adding entries in your journal'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={entriesCount}
              onChange={(e) => setEntriesCount(Number(e.target.value))}
              className="text-sm border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 p-2"
              disabled={isAnalyzing || journalEntries.length === 0}
            >
              <option value={3}>Last 3 entries</option>
              <option value={7}>Last 7 entries</option>
              <option value={14}>Last 14 entries</option>
              <option value={30}>Last 30 entries</option>
            </select>

            <AnalyzeButton 
              onClick={handleAnalyze}
              isAnalyzing={isAnalyzing}
              disabled={journalEntries.length === 0}
              lastUpdateTime={lastUpdateTime}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <p>{error}</p>
          </div>
        )}

        {analysis && !isAnalyzing && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100">Mental Well-being</p>
                    <h3 className="text-2xl font-bold capitalize">
                      {analysis?.metrics?.mentalHealth?.predominantMood || 'Neutral'}
                    </h3>
                    <p className="text-sm text-violet-100 mt-1">
                      Score: {analysis?.metrics?.mentalHealth?.averageScore || '0'}%
                    </p>
                    <p className="text-xs text-violet-100 mt-0.5">
                      Stress: {analysis?.metrics?.mentalHealth?.stressLevel || 'moderate'}
                    </p>
                    <p className="text-xs text-violet-100 mt-0.5">
                      Trend: {analysis?.metrics?.mentalHealth?.trend || 'stable'}
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-violet-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sky-100">Physical Activity Score</p>
                    <h3 className="text-2xl font-bold">
                      {analysis?.metrics?.exercise?.average || '0'}
                    </h3>
                    <p className="text-sm text-sky-100 mt-1">
                      Trend: {analysis?.metrics?.exercise?.trend || 'stable'}
                    </p>
                  </div>
                  <ActivitySquare className="h-8 w-8 text-sky-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Sleep Quality</p>
                    <h3 className="text-2xl font-bold">
                      {analysis?.metrics?.sleep?.average || '0'} hrs
                    </h3>
                    <p className="text-sm text-emerald-100 mt-1">
                      Quality: {analysis?.metrics?.sleep?.quality || '0'}%
                    </p>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      Trend: {analysis?.metrics?.sleep?.trend || 'stable'}
                    </p>
                  </div>
                  <Thermometer className="h-8 w-8 text-emerald-200" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HealthInsights chartData={prepareChartData(analysisHistory)} />
              <MoodTracker moodData={prepareMoodData(analysisHistory)} />
            </div>

            {/* Insights and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                <ul className="space-y-2">
                  {analysis?.insights?.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-violet-500">•</span>
                      <span>{insight}</span>
                    </li>
                  )) || <li>No insights available</li>}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                <ul className="space-y-2">
                  {analysis?.recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-emerald-500">•</span>
                      <span>{rec}</span>
                    </li>
                  )) || <li>No recommendations available</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {!analysis && !error && !isAnalyzing && journalEntries.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Ready to Analyze</h2>
            <p className="text-gray-600">
              Click the Analyze button to generate insights from your journal entries.
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold">Analyzing Your Entries</h2>
            <p className="text-gray-600 mt-2">This may take a moment...</p>
          </div>
        )}
      </div>
    </div>
  );
}