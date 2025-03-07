// src/lib/analyzeJournal.js
import { ChatOpenAI } from "@langchain/openai";

// Pattern definitions for text analysis
const patterns = {
  sleep: /(?:slept|sleep)\s*(?:for|about)?\s*(\d+(?:\.\d+)?)\s*hours?/i,
  exercise: /(?:exercised|worked out|ran|jogged|walked)\s*(?:for)?\s*(\d+)\s*(?:min(?:ute)?s?|hours?)/i,
  mood: {
    veryPositive: /\b(?:amazing|fantastic|excellent|wonderful|great|thrilled|ecstatic|overjoyed)\b/i,
    positive: /\b(?:happy|good|pleased|content|satisfied|cheerful|joyful)\b/i,
    neutral: /\b(?:okay|fine|alright|normal|average|moderate)\b/i,
    negative: /\b(?:sad|unhappy|down|upset|disappointed|frustrated)\b/i,
    veryNegative: /\b(?:terrible|awful|horrible|depressed|miserable|devastated)\b/i
  },
  stress: {
    veryLow: /\b(?:relaxed|peaceful|calm|serene|tranquil)\b/i,
    low: /\b(?:composed|steady|balanced|stable)\b/i,
    moderate: /\b(?:normal stress|some stress|bit stressed)\b/i,
    high: /\b(?:stressed|anxious|worried|tense)\b/i,
    veryHigh: /\b(?:extremely stressed|overwhelmed|panic|severe anxiety)\b/i
  },
  energy: {
    high: /\b(?:energetic|energized|active|full of energy|vigorous)\b/i,
    medium: /\b(?:moderate energy|decent energy|normal energy)\b/i,
    low: /\b(?:tired|exhausted|fatigued|low energy|drained)\b/i
  },
  symptoms: {
    headache: /\b(?:headache|migraine)\b/i,
    nausea: /\b(?:nausea|nauseated|sick to (?:my|the) stomach)\b/i,
    pain: /\b(?:pain|ache|sore)\b/i,
    anxiety: /\b(?:anxiety|anxious|worried|stress)\b/i,
    fatigue: /\b(?:fatigue|exhaustion|tired)\b/i
  }
};

// Cache for OpenAI analysis results
const analysisCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function calculateSleepScore(hours) {
  if (!hours) return 0;
  const idealHours = 8;
  const deviation = Math.abs(hours - idealHours);
  return Math.max(0, Math.min(100, Math.round(100 - (deviation * 12.5))));
}

function getSleepQualityLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Poor';
  return 'Very Poor';
}

function calculateMentalHealthScore(mood, stress, symptoms) {
  // Base score starts at 75 (neutral)
  let score = 75;
  
  // Mood impact (-25 to +25)
  const moodScores = {
    veryPositive: 25,
    positive: 15,
    neutral: 0,
    negative: -15,
    veryNegative: -25
  };
  score += moodScores[mood] || 0;
  
  // Stress impact (-25 to +25)
  const stressScores = {
    veryLow: 25,
    low: 15,
    moderate: 0,
    high: -15,
    veryHigh: -25
  };
  score += stressScores[stress] || 0;
  
  // Symptoms impact (up to -25)
  const symptomImpact = Math.min(symptoms.length * 5, 25);
  score -= symptomImpact;
  
  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getMentalHealthLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Poor';
  return 'Needs Attention';
}

function analyzeLocally(entry) {
  const metrics = {
    sleep: 0,
    exercise: 0,
    mood: 'neutral',
    stress: 'moderate',
    energy: 'medium',
    symptoms: []
  };

  // Extract sleep duration
  const sleepMatch = entry.match(patterns.sleep);
  if (sleepMatch) {
    metrics.sleep = parseFloat(sleepMatch[1]);
  }

  // Extract exercise duration
  const exerciseMatch = entry.match(patterns.exercise);
  if (exerciseMatch) {
    metrics.exercise = parseInt(exerciseMatch[1]);
  }

  // Analyze mood (find the strongest mood indicator)
  for (const [moodType, pattern] of Object.entries(patterns.mood)) {
    if (pattern.test(entry)) {
      metrics.mood = moodType;
      break;
    }
  }

  // Analyze stress level
  for (const [stressLevel, pattern] of Object.entries(patterns.stress)) {
    if (pattern.test(entry)) {
      metrics.stress = stressLevel;
      break;
    }
  }

  // Analyze energy level
  for (const [level, pattern] of Object.entries(patterns.energy)) {
    if (pattern.test(entry)) {
      metrics.energy = level;
      break;
    }
  }

  // Extract symptoms
  for (const [symptom, pattern] of Object.entries(patterns.symptoms)) {
    if (pattern.test(entry)) {
      metrics.symptoms.push(symptom);
    }
  }

  return metrics;
}

export async function analyzeJournalEntry(entry) {
  // Start with optimized local analysis
  const metrics = analyzeLocally(entry);
  
  try {
    // Use cached AI analysis if available
    const enhancedAnalysis = await getAIAnalysis(entry, metrics);
    
    // Calculate scores
    const sleepScore = calculateSleepScore(metrics.sleep);
    const mentalHealthScore = calculateMentalHealthScore(metrics.mood, metrics.stress, metrics.symptoms);
    
    return {
      metrics,
      analysis: {
        mentalHealth: {
          overall: getMentalHealthLabel(mentalHealthScore),
          score: mentalHealthScore,
          mood: metrics.mood,
          stress: metrics.stress
        },
        sleep: {
          hours: metrics.sleep || 0,
          score: sleepScore,
          quality: getSleepQualityLabel(sleepScore)
        },
        insights: enhancedAnalysis.insights || [],
        recommendations: enhancedAnalysis.recommendations || []
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI analysis failed, using local analysis:', error);
    const sleepScore = calculateSleepScore(metrics.sleep);
    const mentalHealthScore = calculateMentalHealthScore(metrics.mood, metrics.stress, metrics.symptoms);
    
    return {
      metrics,
      analysis: {
        mentalHealth: {
          overall: getMentalHealthLabel(mentalHealthScore),
          score: mentalHealthScore,
          mood: metrics.mood,
          stress: metrics.stress
        },
        sleep: {
          hours: metrics.sleep || 0,
          score: sleepScore,
          quality: getSleepQualityLabel(sleepScore)
        },
        insights: generateLocalInsights(metrics),
        recommendations: generateLocalSuggestions(metrics)
      },
      timestamp: new Date().toISOString()
    };
  }
}

async function getAIAnalysis(entry, metrics) {
  const cacheKey = `${entry}_${JSON.stringify(metrics)}`;
  const cachedResult = analysisCache.get(cacheKey);
  
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
    return cachedResult.analysis;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.7,
    timeout: 5000,
    maxRetries: 2,
  });

  try {
    const response = await model.invoke([
      {
        role: "system",
        content: `You are an expert health analyst. Analyze the journal entry and metrics to provide structured insights about health patterns. Focus on:

1. Sleep Analysis:
   - Quality assessment
   - Pattern identification
   - Improvement areas

2. Exercise Analysis:
   - Intensity level
   - Consistency
   - Type of activities

3. Mood & Mental Health:
   - Overall state
   - Triggers or patterns
   - Stress indicators

4. Physical Health:
   - Symptoms analysis
   - Pattern recognition
   - Health concerns

5. Recommendations:
   - Specific, actionable steps
   - Lifestyle adjustments
   - Health optimization

Provide response in this JSON structure:
{
  "analysis": {
    "sleep": {
      "quality": "good|fair|poor",
      "pattern": "regular|irregular",
      "concerns": [],
      "score": 0-100
    },
    "exercise": {
      "intensity": "high|moderate|low",
      "consistency": "regular|irregular",
      "activities": [],
      "score": 0-100
    },
    "mentalHealth": {
      "overall": "positive|neutral|negative",
      "stressLevel": "high|moderate|low",
      "moodPatterns": [],
      "score": 0-100
    },
    "physicalHealth": {
      "status": "good|fair|poor",
      "symptoms": [],
      "concerns": [],
      "score": 0-100
    }
  },
  "insights": {
    "strengths": [],
    "improvements": [],
    "patterns": []
  },
  "recommendations": {
    "immediate": [],
    "shortTerm": [],
    "longTerm": []
  },
  "overallHealthScore": 0-100
}`
      },
      {
        role: "user",
        content: `Analyze this health journal entry and the extracted metrics:\n\nEntry: "${entry}"\n\nMetrics detected:\n${JSON.stringify(metrics, null, 2)}\n\nProvide a comprehensive analysis in the specified JSON format.`
      }
    ]);

    const analysis = JSON.parse(response.content);
    
    // Cache the result
    analysisCache.set(cacheKey, {
      analysis,
      timestamp: Date.now()
    });

    return analysis;
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('AI analysis failed');
  }
}

// Cleanup cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of analysisCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      analysisCache.delete(key);
    }
  }
}, CACHE_TTL);

function generateLocalInsights(metrics) {
  const insights = [];

  // Sleep insights
  if (metrics.sleep > 0) {
    const sleepQuality = metrics.sleep >= 7 ? "healthy" : "below recommended";
    insights.push(
      `Sleep duration is ${metrics.sleep} hours (${sleepQuality}). ${
        metrics.sleep < 7 
          ? "Consider aiming for 7-9 hours for optimal health."
          : "Maintain this healthy sleep pattern."
      }`
    );
  }

  // Exercise insights
  if (metrics.exercise > 0) {
    const exerciseQuality = metrics.exercise >= 30 ? "meeting" : "below";
    insights.push(
      `Exercise duration is ${metrics.exercise} minutes (${exerciseQuality} recommended levels). ${
        metrics.exercise < 30
          ? "Aim for at least 30 minutes of daily activity."
          : "Keep up this good level of activity."
      }`
    );
  }

  // Mood and energy insights
  insights.push(
    `Overall wellbeing shows ${metrics.mood} mood with ${metrics.energy} energy levels` +
    (metrics.symptoms.length 
      ? `. Health concerns noted: ${metrics.symptoms.join(', ')}` 
      : " with no reported symptoms."
    )
  );

  return insights;
}

function generateLocalSuggestions(metrics) {
  const suggestions = [];

  // Sleep suggestions
  if (metrics.sleep < 7) {
    suggestions.push(
      "Establish a consistent bedtime routine and aim for 7-9 hours of sleep"
    );
  }

  // Exercise suggestions
  if (metrics.exercise < 30) {
    suggestions.push(
      "Start with short exercise sessions and gradually work up to 30 minutes daily"
    );
  }

  // Health management suggestions
  if (metrics.symptoms.length > 0) {
    suggestions.push(
      "Monitor your symptoms and consider consulting a healthcare provider if they persist"
    );
  }

  // If we need more suggestions
  if (suggestions.length < 2) {
    if (metrics.energy === 'low') {
      suggestions.push(
        "Try to identify and address factors affecting your energy levels"
      );
    } else if (metrics.mood === 'bad') {
      suggestions.push(
        "Consider activities that boost your mood like exercise or socializing"
      );
    } else {
      suggestions.push(
        "Maintain your current healthy routines and track any changes in your wellbeing"
      );
    }
  }

  return suggestions;
}

export default analyzeJournalEntry;