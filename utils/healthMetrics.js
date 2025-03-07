// utils/healthMetrics.js
export function extractHealthMetrics(text) {
    const metrics = {
      sleep: null,
      exercise: null,
      symptoms: [],
      energy: null,
      mood: null
    }
  
    // Sleep Pattern
    const sleepMatches = [
      text.match(/slept\s+(\d+)\s*hours?/i),
      text.match(/(\d+)\s*hours?\s+of\s+sleep/i),
      text.match(/sleep.*?(\d+)\s*hours?/i)
    ]
    const sleepMatch = sleepMatches.find(match => match)
    if (sleepMatch) metrics.sleep = parseInt(sleepMatch[1])
  
    // Exercise Pattern
    const exerciseMatches = [
      text.match(/(\d+)[\s-]*min(ute)?s?\s*(workout|exercise|run|jog|swim|yoga|gym)/i),
      text.match(/(worked out|exercised)\s+for\s+(\d+)/i)
    ]
    const exerciseMatch = exerciseMatches.find(match => match)
    if (exerciseMatch) metrics.exercise = parseInt(exerciseMatch[1] || exerciseMatch[2])
  
    // Symptoms
    const commonSymptoms = [
      'headache', 'fever', 'cough', 'fatigue',
      'pain', 'nausea', 'dizzy', 'anxiety',
      'stress', 'insomnia', 'cramps'
    ]
    commonSymptoms.forEach(symptom => {
      if (text.toLowerCase().includes(symptom)) {
        metrics.symptoms.push(symptom)
      }
    })
  
    // Energy Level
    if (text.toLowerCase().includes('energy')) {
      if (text.toLowerCase().includes('low')) metrics.energy = 'low'
      if (text.toLowerCase().includes('high')) metrics.energy = 'high'
      if (text.toLowerCase().includes('medium') || text.toLowerCase().includes('moderate')) metrics.energy = 'medium'
    }
  
    // Mood Detection
    const moodPatterns = {
      positive: ['happy', 'great', 'good', 'excellent', 'wonderful', 'amazing', 'fantastic'],
      negative: ['sad', 'bad', 'terrible', 'awful', 'depressed', 'unhappy', 'stressed'],
      neutral: ['okay', 'fine', 'alright', 'normal']
    }
  
    for (const [type, patterns] of Object.entries(moodPatterns)) {
      if (patterns.some(pattern => text.toLowerCase().includes(pattern))) {
        metrics.mood = type
        break
      }
    }
  
    return metrics
  }
  
  export function generateInsights(metrics) {
    const insights = []
    
    // Sleep Analysis
    const recentSleep = metrics.sleep.slice(-7)
    if (recentSleep.length > 0) {
      const avgSleep = recentSleep.reduce((acc, curr) => acc + curr.value, 0) / recentSleep.length
      if (avgSleep < 7) {
        insights.push({
          type: 'warning',
          message: "Your average sleep has been below recommended levels. Consider adjusting your sleep schedule.",
          metric: 'sleep'
        })
      } else if (avgSleep > 9) {
        insights.push({
          type: 'info',
          message: "You're getting plenty of sleep. If you still feel tired, consider checking sleep quality.",
          metric: 'sleep'
        })
      }
    }
  
    // Exercise Patterns
    const recentExercise = metrics.exercise.slice(-7)
    if (recentExercise.length > 0) {
      const exerciseDays = recentExercise.length
      if (exerciseDays < 3) {
        insights.push({
          type: 'suggestion',
          message: "Try to increase your exercise frequency to at least 3 times per week.",
          metric: 'exercise'
        })
      } else {
        insights.push({
          type: 'success',
          message: "Great job maintaining regular exercise!",
          metric: 'exercise'
        })
      }
    }
  
    // Symptom Patterns
    const recentSymptoms = metrics.symptoms.slice(-7)
    if (recentSymptoms.length > 0) {
      const symptomCount = {}
      recentSymptoms.forEach(entry => {
        entry.value.forEach(symptom => {
          symptomCount[symptom] = (symptomCount[symptom] || 0) + 1
        })
      })
      
      Object.entries(symptomCount).forEach(([symptom, count]) => {
        if (count >= 3) {
          insights.push({
            type: 'alert',
            message: `You've reported ${symptom} multiple times recently. Consider consulting a healthcare provider.`,
            metric: 'symptoms'
          })
        }
      })
    }
  
    return insights
  }