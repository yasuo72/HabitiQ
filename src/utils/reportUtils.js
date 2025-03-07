// src/utils/reportUtils.js
import { storageUtils } from './storage';

const calculateHealthScore = (data) => {
  let score = 0;
  let totalFactors = 0;

  // 1. Nutrition Score (25%)
  const nutritionScore = (() => {
    const { meals, waterIntake } = data.nutrition;
    const today = new Date().toISOString().split('T')[0];
    const todaysMeals = meals.filter(meal => meal.date === today);
    
    // Calculate calories score (0-10)
    const totalCalories = todaysMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const caloriesScore = Math.min(10, (totalCalories / 2000) * 10);

    // Calculate water intake score (0-10)
    const waterScore = Math.min(10, (waterIntake / 2000) * 10);

    // Calculate meal distribution score (0-5)
    const mealTypes = new Set(todaysMeals.map(meal => meal.type));
    const mealDistributionScore = Math.min(5, mealTypes.size);

    return (caloriesScore + waterScore + mealDistributionScore) / 25 * 100;
  })();
  score += nutritionScore;
  totalFactors++;

  // 2. Goals Score (25%)
  const goalsScore = (() => {
    const { goals, habits } = data.goals;
    if (!goals.length && !habits.length) return 0;

    // Calculate goals completion rate
    const completedGoals = goals.filter(goal => goal.completed).length;
    const goalsCompletionScore = goals.length > 0 ? (completedGoals / goals.length) * 50 : 0;

    // Calculate habits consistency
    const activeHabits = habits.filter(habit => {
      if (!habit.lastChecked) return false;
      const lastChecked = new Date(habit.lastChecked);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      return lastChecked >= oneDayAgo;
    }).length;
    const habitsScore = habits.length > 0 ? (activeHabits / habits.length) * 50 : 0;

    return goalsCompletionScore + habitsScore;
  })();
  score += goalsScore;
  totalFactors++;

  // 3. Journal Analysis Score (25%)
  const journalScore = (() => {
    const analysis = data.analysis;
    if (!analysis) return 0;

    let moodScore = 0;
    if (analysis.mood) {
      const moodMap = {
        'very positive': 100,
        'positive': 80,
        'neutral': 60,
        'negative': 40,
        'very negative': 20
      };
      moodScore = moodMap[analysis.mood.toLowerCase()] || 60;
    }

    let energyScore = 0;
    if (analysis.energy) {
      const energyMap = {
        'high': 100,
        'medium': 70,
        'low': 40
      };
      energyScore = energyMap[analysis.energy.toLowerCase()] || 70;
    }

    return (moodScore + energyScore) / 2;
  })();
  if (journalScore > 0) {
    score += journalScore;
    totalFactors++;
  }

  // 4. Activity Score (25%)
  const activityScore = (() => {
    const analysis = data.analysis;
    if (!analysis || !analysis.metrics) return 0;

    // Calculate exercise score
    const exerciseMinutes = analysis.metrics.exercise || 0;
    const exerciseScore = Math.min(100, (exerciseMinutes / 30) * 100);

    // Calculate sleep score
    const sleepHours = analysis.metrics.sleep || 0;
    const sleepScore = sleepHours >= 7 && sleepHours <= 9 ? 100 :
                      sleepHours >= 6 && sleepHours <= 10 ? 80 :
                      sleepHours >= 5 && sleepHours <= 11 ? 60 : 40;

    return (exerciseScore + sleepScore) / 2;
  })();
  if (activityScore > 0) {
    score += activityScore;
    totalFactors++;
  }

  // Calculate final score
  return Math.round(totalFactors > 0 ? score / totalFactors : 0);
};

export const fetchAllHealthData = () => {
  // Get all data from localStorage
  const journalAnalysis = storageUtils.getAnalysis() || { insights: [], recommendations: [] };
  const nutritionData = storageUtils.getNutritionData();
  const goalsData = storageUtils.getGoalsData();
  const journalEntries = storageUtils.getJournalEntries();

  // Prepare data for health score calculation
  const healthData = {
    nutrition: nutritionData,
    goals: goalsData,
    analysis: journalAnalysis,
    entries: journalEntries
  };

  // Calculate health score
  const healthScore = calculateHealthScore(healthData);

  // Calculate active habits
  const activeHabits = goalsData.habits.filter(habit => {
    if (!habit.lastChecked) return false;
    const lastChecked = new Date(habit.lastChecked);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return lastChecked >= oneDayAgo;
  }).length;

  // Calculate goals progress
  const completedGoals = goalsData.goals.filter(goal => goal.completed).length;
  const totalGoals = goalsData.goals.length;
  const goalProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Calculate daily nutrition
  const today = new Date().toISOString().split('T')[0];
  const todaysMeals = nutritionData.meals.filter(meal => meal.date === today);
  const dailyCalories = todaysMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const waterIntake = nutritionData.waterIntake || 0;

  // Get recent entries
  const recentEntries = journalEntries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Get timestamps for data freshness
  const timestamps = {
    analysis: journalAnalysis?.timestamp || null,
    nutrition: nutritionData?.timestamp || null,
    goals: goalsData?.timestamp || null,
  };

  return {
    summary: {
      healthScore,
      activeHabits,
      goalProgress,
      dailyCalories,
      waterIntake,
    },
    details: {
      journalAnalysis,
      nutritionData,
      goalsData,
      recentEntries,
    },
    timestamps,
    metrics: {
      sleep: journalAnalysis?.metrics?.sleep || 0,
      exercise: journalAnalysis?.metrics?.exercise || 0,
      mood: journalAnalysis?.mood || 'neutral',
      energy: journalAnalysis?.energy || 'medium',
    }
  };
};
