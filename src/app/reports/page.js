// src/app/reports/page.js
'use client';
import { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, Calendar, Brain, Heart } from 'lucide-react';
import ReportContent from '@/components/reports/ReportContent';
import { getConsistentDate } from '../../utils/dateUtils';

// Analysis helper functions
const calculateConsistencyScore = (data, targetValue = null) => {
  if (!data || data.length < 2) return 0;
  
  const daysInRange = data.length;
  let score = 100;
  
  // Calculate variance based on target value or day-to-day consistency
  if (targetValue !== null) {
    // Calculate deviation from target value
    const deviations = data.map(item => Math.abs(item.value - targetValue));
    const avgDeviation = deviations.reduce((acc, dev) => acc + dev, 0) / daysInRange;
    score -= (avgDeviation * 10); // Reduce score based on average deviation
  } else {
    // Calculate day-to-day consistency
    const variance = data.reduce((acc, curr, i) => {
      if (i === 0) return acc;
      const diff = Math.abs(curr.value - data[i - 1].value);
      return acc + (diff * 10); // Penalize big variations more heavily
    }, 0) / daysInRange;
    score -= variance;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

const analyzeSleepPatterns = (entries) => {
  if (!entries || entries.length === 0) return {
    data: [],
    average: "0.0",
    consistency: 0,
    insights: [],
    qualityScore: 0
  };

  const sleepData = entries.map(entry => ({
    date: new Date(entry.timestamp).toLocaleDateString(),
    value: entry.metrics?.sleep?.average || 0,
    quality: entry.metrics?.sleep?.quality || 0
  }));

  const avgSleep = sleepData.reduce((acc, curr) => acc + curr.value, 0) / sleepData.length;
  const consistencyScore = calculateConsistencyScore(sleepData, 8); // Target 8 hours of sleep
  
  // Calculate average quality score
  const qualityScore = Math.round(
    sleepData.reduce((acc, curr) => acc + curr.quality, 0) / sleepData.length
  );

  const insights = [];

  // Sleep duration insights
  if (avgSleep < 6) {
    insights.push("Critical: You're significantly under-sleeping. Aim for 7-9 hours.");
  } else if (avgSleep < 7) {
    insights.push("Warning: You're getting less than recommended sleep (7-9 hours).");
  } else if (avgSleep > 9) {
    insights.push("Note: You might be oversleeping. Try adjusting your sleep schedule.");
  } else {
    insights.push("Great! Your sleep duration is within the recommended range.");
  }

  // Sleep consistency insights
  if (consistencyScore >= 90) {
    insights.push("Excellent sleep schedule consistency! Keep it up!");
  } else if (consistencyScore >= 70) {
    insights.push("Good sleep consistency with minor variations.");
  } else if (consistencyScore >= 50) {
    insights.push("Your sleep schedule shows some irregularity. Try to maintain consistent sleep times.");
  } else {
    insights.push("Your sleep schedule is quite irregular. Consider setting a consistent sleep routine.");
  }

  // Sleep quality insights
  if (qualityScore >= 80) {
    insights.push("You're experiencing good quality sleep overall.");
  } else if (qualityScore >= 60) {
    insights.push("Your sleep quality is moderate. Consider factors that might be affecting your sleep.");
  } else {
    insights.push("Your sleep quality needs improvement. Consider factors like room temperature, noise, and pre-sleep routine.");
  }

  return {
    data: sleepData,
    average: avgSleep.toFixed(1),
    consistency: consistencyScore,
    qualityScore,
    insights
  };
};

const analyzeExercisePatterns = (entries) => {
  if (!entries || entries.length === 0) return {
    data: [],
    average: "0",
    consistency: 0,
    insights: [],
    intensity: 0
  };

  const exerciseData = entries.map(entry => ({
    date: new Date(entry.timestamp).toLocaleDateString(),
    value: entry.metrics?.exercise?.average || 0,
    intensity: entry.metrics?.exercise?.intensity || 'moderate'
  }));

  const avgExercise = exerciseData.reduce((acc, curr) => acc + curr.value, 0) / exerciseData.length;
  const consistencyScore = calculateConsistencyScore(exerciseData, 30); // Target 30 minutes of exercise
  
  // Calculate intensity score
  const intensityMap = { high: 100, moderate: 70, low: 40 };
  const intensityScore = Math.round(
    exerciseData.reduce((acc, curr) => acc + (intensityMap[curr.intensity] || 70), 0) / exerciseData.length
  );

  const insights = [];

  // Exercise duration insights
  if (avgExercise < 15) {
    insights.push("Critical: You're getting minimal exercise. Try to increase daily activity.");
  } else if (avgExercise < 30) {
    insights.push("Warning: You're below the recommended daily exercise (30 minutes).");
  } else {
    insights.push("Great! You're meeting or exceeding daily exercise recommendations.");
  }

  // Exercise consistency insights
  if (consistencyScore >= 90) {
    insights.push("Excellent exercise consistency! Keep up the routine!");
  } else if (consistencyScore >= 70) {
    insights.push("Good exercise consistency with some variation.");
  } else if (consistencyScore >= 50) {
    insights.push("Your exercise routine shows some irregularity. Try to maintain a consistent schedule.");
  } else {
    insights.push("Your exercise routine is quite irregular. Consider setting a regular workout schedule.");
  }

  // Exercise intensity insights
  if (intensityScore >= 80) {
    insights.push("You're maintaining good exercise intensity!");
  } else if (intensityScore >= 60) {
    insights.push("Consider increasing your workout intensity for better results.");
  } else {
    insights.push("Try to incorporate more moderate to high-intensity exercises in your routine.");
  }

  return {
    data: exerciseData,
    average: Math.round(avgExercise).toString(),
    consistency: consistencyScore,
    intensity: intensityScore,
    insights
  };
};

const calculateHealthScore = (entries) => {
  if (!entries || entries.length === 0) return 0;

  const weights = {
    sleep: 0.35,
    exercise: 0.25,
    mentalHealth: 0.4
  };

  let totalScore = 0;
  let validMetrics = 0;

  entries.forEach(entry => {
    let entryScore = 0;
    let entryMetrics = 0;

    // Sleep score
    if (entry.metrics?.sleep?.quality) {
      entryScore += entry.metrics.sleep.quality * weights.sleep;
      entryMetrics++;
    }

    // Exercise score
    if (entry.metrics?.exercise?.average) {
      const exerciseScore = Math.min(100, (entry.metrics.exercise.average / 30) * 100);
      entryScore += exerciseScore * weights.exercise;
      entryMetrics++;
    }

    // Mental health score
    if (entry.metrics?.mentalHealth?.averageScore) {
      entryScore += entry.metrics.mentalHealth.averageScore * weights.mentalHealth;
      entryMetrics++;
    }

    if (entryMetrics > 0) {
      totalScore += (entryScore / entryMetrics);
      validMetrics++;
    }
  });

  return validMetrics > 0 ? Math.round(totalScore / validMetrics) : 0;
};

const calculateAverageCalories = (meals) => {
  if (!meals || meals.length === 0) return 0;
  
  const totalCalories = meals.reduce((sum, meal) => {
    return sum + (meal.calories || 0);
  }, 0);
  
  return Math.round(totalCalories / meals.length);
};

const downloadReport = (reportData, reportPeriod) => {
  if (!reportData) return;

  const reportText = `Health Report (${reportPeriod})
Generated on: ${new Date().toLocaleDateString()}

Overview:
- Total Journal Entries: ${reportData.overview.totalEntries}
- Completed Goals: ${reportData.overview.completedGoals}
- Active Habits: ${reportData.overview.activeHabits}
- Average Daily Calories: ${reportData.overview.avgCalories}

Health Score: ${reportData.healthScore}%

Sleep Analysis:
- Average Sleep: ${reportData.sleep.average} hours
- Sleep Consistency: ${reportData.sleep.consistency}%
- Sleep Quality: ${reportData.sleep.qualityScore}%
Insights:
${reportData.sleep.insights.map(i => '- ' + i).join('\n')}

Exercise Analysis:
- Weekly Average: ${reportData.exercise.average} minutes
- Exercise Consistency: ${reportData.exercise.consistency}%
- Exercise Intensity: ${reportData.exercise.intensity}%
Insights:
${reportData.exercise.insights.map(i => '- ' + i).join('\n')}
`;

  const blob = new Blob([reportText], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `health-report-${reportPeriod}-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Helper function to ensure valid date
const ensureValidDate = (dateStr) => {
  if (!dateStr) return new Date();
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
};

// Format date consistently
const formatDate = (date) => {
  const validDate = ensureValidDate(date);
  return validDate.toISOString().split('T')[0];
};

export default function Reports() {
  const [journalEntries, setJournalEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [meals, setMeals] = useState([]);
  const [reportPeriod, setReportPeriod] = useState('week');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get stored analysis history
      const storedHistory = localStorage.getItem('journalAnalysisHistory');
      let analysisHistory = [];
      
      // Get nutrition data
      const nutritionData = localStorage.getItem('nutritionData');
      let meals = [];
      if (nutritionData) {
        try {
          const parsedNutrition = JSON.parse(nutritionData);
          meals = parsedNutrition.meals || [];
        } catch (e) {
          console.error('Error parsing nutrition data:', e);
        }
      }

      // Get goals and habits data
      const goalsData = localStorage.getItem('goalsData');
      let goals = [], habits = [];
      if (goalsData) {
        try {
          const parsedGoals = JSON.parse(goalsData);
          goals = parsedGoals.goals || [];
          habits = parsedGoals.habits || [];
        } catch (e) {
          console.error('Error parsing goals data:', e);
        }
      }
      
      if (storedHistory && storedHistory !== 'undefined') {
        try {
          analysisHistory = JSON.parse(storedHistory);
          // Sort by timestamp, newest first
          analysisHistory.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA;
          });
        } catch (e) {
          console.error('Error parsing analysis history:', e);
        }
      }

      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      
      switch (reportPeriod) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);

      // Filter entries within date range
      const filteredEntries = analysisHistory.filter(entry => {
        if (!entry.timestamp) return false;
        const entryDate = formatDate(new Date(entry.timestamp));
        return entryDate >= startDateStr && entryDate <= endDateStr;
      });

      // Filter meals within date range
      const filteredMeals = meals.filter(meal => {
        if (!meal.date) return false;
        const mealDate = formatDate(new Date(meal.date));
        return mealDate >= startDateStr && mealDate <= endDateStr;
      });

      // Calculate averages from filtered entries
      const healthScore = calculateHealthScore(filteredEntries);
      const sleepAnalysis = analyzeSleepPatterns(filteredEntries);
      const exerciseAnalysis = analyzeExercisePatterns(filteredEntries);

      // Calculate nutrition metrics
      const avgCalories = calculateAverageCalories(filteredMeals);
      
      // Calculate goals and habits metrics
      const activeHabits = habits.filter(habit => {
        const lastChecked = habit.lastChecked ? new Date(habit.lastChecked) : null;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // A habit is considered active if it was checked today or yesterday
        return lastChecked && 
               (formatDate(lastChecked) === formatDate(today) ||
                formatDate(lastChecked) === formatDate(yesterday));
      }).length;

      const completedGoals = goals.filter(goal => {
        const goalDate = goal.completedAt ? formatDate(new Date(goal.completedAt)) : null;
        return goal.completed && goalDate >= startDateStr && goalDate <= endDateStr;
      }).length;

      // Get the latest metrics
      const latestEntry = filteredEntries[0] || {};
      const metrics = latestEntry.metrics || {};

      const report = {
        dateRange: {
          start: startDateStr,
          end: endDateStr
        },
        healthScore,
        overview: {
          activeHabits,
          completedGoals,
          avgCalories
        },
        sleep: sleepAnalysis,
        exercise: exerciseAnalysis,
        mentalHealth: {
          averageScore: metrics.mentalHealth?.averageScore || 0,
          predominantMood: metrics.mentalHealth?.predominantMood || 'neutral',
          stressLevel: metrics.mentalHealth?.stressLevel || 'moderate',
          trend: metrics.mentalHealth?.trend || 'stable',
          insights: metrics.mentalHealth?.insights || []
        },
        nutrition: {
          meals: filteredMeals,
          avgCalories,
          mealCount: filteredMeals.length
        },
        goals: {
          active: goals.filter(g => !g.completed).length,
          completed: completedGoals,
          total: goals.length
        },
        habits: {
          active: activeHabits,
          total: habits.length,
          streaks: habits.map(h => ({
            name: h.name,
            streak: h.streak || 0,
            active: h.active
          }))
        }
      };

      setReportData(report);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [reportPeriod]);

  const handlePeriodChange = (period) => {
    setReportPeriod(period);
  };

  const handleDownload = () => {
    if (reportData) {
      downloadReport(reportData, reportPeriod);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600" />
              Health Reports
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track your health progress over time
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={reportPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="text-sm border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 p-2"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <button
              onClick={handleDownload}
              disabled={!reportData}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Download Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Generating your health report...</p>
          </div>
        ) : !reportData ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No journal entries found for the selected period</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100">Health Score</p>
                    <h3 className="text-2xl font-bold">{reportData.healthScore}%</h3>
                  </div>
                  <Heart className="h-8 w-8 text-violet-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sky-100">Sleep Quality</p>
                    <h3 className="text-2xl font-bold">{reportData.sleep.consistency}%</h3>
                  </div>
                  <Brain className="h-8 w-8 text-sky-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100">Active Habits</p>
                    <h3 className="text-2xl font-bold">{reportData.overview.activeHabits}</h3>
                  </div>
                  <TrendingUp className="h-8 w-8 text-violet-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sky-100">Avg. Calories</p>
                    <h3 className="text-2xl font-bold">{reportData.overview.avgCalories}</h3>
                  </div>
                  <Calendar className="h-8 w-8 text-sky-200" />
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sleep Analysis */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-violet-600" />
                  Sleep Analysis
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-violet-50">
                    <div>
                      <p className="text-sm text-gray-600">Average Sleep</p>
                      <p className="text-xl font-semibold text-violet-700">{reportData.sleep.average} hours</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-700">Insights:</p>
                    {reportData.sleep.insights.map((insight, index) => (
                      <p key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                        {insight}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exercise Analysis */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                  Exercise Analysis
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-violet-50">
                    <div>
                      <p className="text-sm text-gray-600">Weekly Average</p>
                      <p className="text-xl font-semibold text-violet-700">{reportData.exercise.average} min</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-700">Insights:</p>
                    {reportData.exercise.insights.map((insight, index) => (
                      <p key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                        {insight}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}