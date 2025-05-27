// src/app/analytics/page.js
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Brain, ActivitySquare, Thermometer, Heart } from 'lucide-react';
import { AnalyzeButton } from '@/components/analytics/AnalyzeButton';
import { SleepQualityChart } from '@/components/analytics/SleepQualityChart';
import { MoodTracker } from '@/components/analytics/MoodTracker';
import { SymptomFrequency } from '@/components/analytics/SymptomFrequency';
import HealthInsights from '@/components/analytics/HealthInsights';
import EnhancedHealthInsights from '@/components/analytics/EnhancedHealthInsights';
import EnhancedMoodTracker from '@/components/analytics/EnhancedMoodTracker';
import EnhancedInsightsPanel from '@/components/analytics/EnhancedInsightsPanel';
import AnimatedHealthCard from '@/components/analytics/AnimatedHealthCard';
import { storageUtils } from '@/utils/storage';
import { MessageSquare, BarChart3 } from 'lucide-react';
import { fadeIn, slideUp, staggerContainer } from '@/utils/animations';

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

  return processedData;
};

export default function Analytics() {
  const [entriesCount, setEntriesCount] = useState(7);
  const [journalEntries, setJournalEntries] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [useEnhancedUI, setUseEnhancedUI] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    const loadEntries = () => {
      const savedEntries = storageUtils.getJournalEntries();
      setJournalEntries(savedEntries);
    };

    const loadStoredAnalysis = () => {
      try {
        console.log('Loading stored analysis data for current user');
        const savedAnalysis = storageUtils.getAnalysis();
        const savedHistory = storageUtils.getAnalysisHistory();
        
        if (savedAnalysis) {
          console.log('Found saved analysis:', savedAnalysis.timestamp);
          setAnalysis(savedAnalysis);
          setLastUpdateTime(savedAnalysis.timestamp);
        } else {
          console.log('No saved analysis found');
        }
        
        if (savedHistory && savedHistory.length > 0) {
          console.log(`Found ${savedHistory.length} saved analysis history items`);
          setAnalysisHistory(savedHistory);
        } else {
          console.log('No analysis history found');
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
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setError('Authentication required. Please log in again.');
        setIsAnalyzing(false);
        setLoading(false);
        return;
      }
      
      // Format entries properly for analysis
      const entriesToAnalyze = journalEntries.slice(0, entriesCount).map(entry => {
        // Ensure we have all the required fields
        return {
          content: entry.content || '',
          date: entry.date || entry.timestamp || new Date().toISOString(),
          mood: entry.mood || 'neutral',
          sleep: entry.sleep || { hours: 7, quality: 'average' },
          exercise: entry.exercise || { minutes: 0, type: 'none' },
          nutrition: entry.nutrition || { meals: [], water: 0 }
        };
      });
      
      console.log(`Analyzing ${entriesToAnalyze.length} journal entries with real data`);
      console.log('Sample entry:', JSON.stringify(entriesToAnalyze[0] || {}, null, 2));
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ entries: entriesToAnalyze }),
        credentials: 'include' // Include cookies in the request
      });

      if (!response.ok) {
        try {
          const data = await response.json();
          console.error('Analysis error:', data);
          setError(data.error || 'Failed to analyze entries. Please try again.');
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError);
          setError(`Server error: ${response.status} ${response.statusText}`);
        }
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
      
      // Store current analysis using the user-specific storage utility
      storageUtils.saveAnalysis(analysisWithTimestamp);
      
      // Get the updated history after saving
      const updatedHistory = storageUtils.getAnalysisHistory();
      setAnalysisHistory(updatedHistory);
      
      console.log(`Saved analysis for user and updated history (${updatedHistory.length} items)`);

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze entries. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen bg-gray-50"
    >
      <motion.div 
        variants={staggerContainer}
        className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
      >
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
            {/* Health Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {useEnhancedUI ? (
                        <>
                          <AnimatedHealthCard 
                            title="Mental Health Score"
                            value={analysis?.metrics?.mentalHealth?.averageScore || '0'}
                            unit="%"
                            icon={Heart}
                            trend={analysis?.metrics?.mentalHealth?.trend || 'stable'}
                            color="violet"
                            subtitle={`Mood: ${analysis?.metrics?.mentalHealth?.predominantMood || 'neutral'}`}
                            details="This score represents your overall mental wellbeing based on mood patterns and stress levels detected in your journal entries."
                          />
                          
                          <AnimatedHealthCard 
                            title="Physical Activity"
                            value={analysis?.metrics?.exercise?.average || '0'}
                            unit=" min"
                            icon={ActivitySquare}
                            trend={analysis?.metrics?.exercise?.trend || 'stable'}
                            color="sky"
                            details="This shows your average daily physical activity in minutes, based on exercise mentions in your journal entries."
                          />
                          
                          <AnimatedHealthCard 
                            title="Sleep Quality"
                            value={analysis?.metrics?.sleep?.average || '0'}
                            unit=" hrs"
                            icon={Thermometer}
                            trend={analysis?.metrics?.sleep?.trend || 'stable'}
                            color="emerald"
                            subtitle={`Quality: ${analysis?.metrics?.sleep?.quality || '0'}%`}
                            details="This tracks both your sleep duration and quality, helping you understand how your rest affects your overall wellbeing."
                          />
                        </>
                      ) : (
                        <>
                          <motion.div 
                            variants={slideUp}
                            className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-violet-100">Mental Health Score</p>
                                <h3 className="text-2xl font-bold">
                                  {analysis?.metrics?.mentalHealth?.averageScore || '0'}%
                                </h3>
                                <p className="text-sm text-violet-100 mt-1">
                                  Mood: {analysis?.metrics?.mentalHealth?.predominantMood || 'neutral'}
                                </p>
                              </div>
                              <Heart className="h-8 w-8 text-violet-200" />
                            </div>
                          </motion.div>

                          <motion.div 
                            variants={slideUp}
                            className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-6 text-white"
                          >
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
                          </motion.div>

                          <motion.div 
                            variants={slideUp}
                            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white"
                          >
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
                          </motion.div>
                        </>
                      )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {useEnhancedUI ? (
                  <EnhancedHealthInsights chartData={prepareChartData(analysisHistory)} />
                ) : (
                  <HealthInsights chartData={prepareChartData(analysisHistory)} />
                )}
                {useEnhancedUI ? (
                  <EnhancedMoodTracker moodData={prepareMoodData(analysisHistory)} />
                ) : (
                  <MoodTracker moodData={prepareMoodData(analysisHistory)} />
                )}
            </div>

            {/* Insights and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {useEnhancedUI ? (
                  <EnhancedInsightsPanel 
                    insights={analysis?.insights || []} 
                    recommendations={analysis?.recommendations || []}
                  />
                ) : (
                  <>
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
                  </>
                )}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <motion.svg 
                    animate={{ rotate: [0, 10, 0, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-5 w-5 text-red-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </motion.svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!analysis && !error && !isAnalyzing && journalEntries.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm p-8 text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="mx-auto mb-4"
              >
                <Brain className="h-12 w-12 text-violet-300 mx-auto" />
              </motion.div>
              <h2 className="text-lg font-semibold mb-2">Ready to Analyze</h2>
              <p className="text-gray-600">
                Click the Analyze button to generate insights from your journal entries.
              </p>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-sm p-8 text-center"
            >
              <motion.div 
                animate={{ 
                  rotate: 360,
                  borderColor: ['#8b5cf6', '#3b82f6', '#10b981', '#8b5cf6']
                }}
                transition={{ 
                  rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                  borderColor: { duration: 3, repeat: Infinity }
                }}
                className="h-12 w-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
              />
              <h2 className="text-lg font-semibold">Analyzing Your Entries</h2>
              <p className="text-gray-600 mt-2">This may take a moment...</p>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 15 }}
                className="h-1 bg-violet-200 mt-4 rounded-full overflow-hidden"
              >
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="h-full w-1/3 bg-violet-500 rounded-full"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}