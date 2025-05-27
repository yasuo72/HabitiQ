import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Verify JWT token
async function verifyToken(request) {
  try {
    // Get token from cookies or authorization header
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return null;
    }
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    console.log('Token verified successfully:', payload.email);
    return payload;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
}

// Fallback analysis when OpenAI API fails
// Helper functions for basic analysis
function calculateAverageSleep(entries) {
  try {
    let totalSleep = 0;
    let validEntries = 0;
    
    entries.forEach(entry => {
      if (entry.sleep && entry.sleep.hours) {
        totalSleep += parseFloat(entry.sleep.hours);
        validEntries++;
      }
    });
    
    return validEntries > 0 ? (totalSleep / validEntries).toFixed(1) : 7.5;
  } catch (error) {
    console.error('Error calculating average sleep:', error);
    return 7.5;
  }
}

function calculateSleepQuality(entries) {
  try {
    // Calculate sleep quality (0-100) based on deviation from ideal 8 hours
    const avgSleep = calculateAverageSleep(entries);
    const deviation = Math.abs(avgSleep - 8);
    return Math.max(0, Math.min(100, Math.round(100 - (deviation * 12.5))));
  } catch (error) {
    console.error('Error calculating sleep quality:', error);
    return 75;
  }
}

function calculateMentalHealthScore(entries) {
  try {
    // Simple scoring based on mood keywords in content
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'joy', 'positive', 'energetic'];
    const negativeWords = ['sad', 'bad', 'tired', 'exhausted', 'depressed', 'anxious', 'stress'];
    
    let totalScore = 0;
    
    entries.forEach(entry => {
      if (entry.content) {
        const content = entry.content.toLowerCase();
        let entryScore = 50; // Neutral starting point
        
        positiveWords.forEach(word => {
          if (content.includes(word)) entryScore += 10;
        });
        
        negativeWords.forEach(word => {
          if (content.includes(word)) entryScore -= 10;
        });
        
        totalScore += Math.max(0, Math.min(100, entryScore));
      }
    });
    
    return entries.length > 0 ? Math.round(totalScore / entries.length) : 80;
  } catch (error) {
    console.error('Error calculating mental health score:', error);
    return 80;
  }
}

function findPredominantMood(entries) {
  try {
    const moodCounts = { 'positive': 0, 'neutral': 0, 'negative': 0 };
    
    entries.forEach(entry => {
      if (entry.mood) {
        if (['happy', 'very happy', 'positive'].includes(entry.mood)) {
          moodCounts.positive++;
        } else if (['sad', 'very sad', 'negative'].includes(entry.mood)) {
          moodCounts.negative++;
        } else {
          moodCounts.neutral++;
        }
      } else if (entry.content) {
        // Simple content analysis
        const content = entry.content.toLowerCase();
        const positiveWords = ['happy', 'good', 'great', 'excellent'];
        const negativeWords = ['sad', 'bad', 'tired', 'exhausted'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        positiveWords.forEach(word => {
          if (content.includes(word)) positiveCount++;
        });
        
        negativeWords.forEach(word => {
          if (content.includes(word)) negativeCount++;
        });
        
        if (positiveCount > negativeCount) {
          moodCounts.positive++;
        } else if (negativeCount > positiveCount) {
          moodCounts.negative++;
        } else {
          moodCounts.neutral++;
        }
      }
    });
    
    // Find the mood with the highest count
    if (moodCounts.positive >= moodCounts.neutral && moodCounts.positive >= moodCounts.negative) {
      return 'positive';
    } else if (moodCounts.negative >= moodCounts.neutral && moodCounts.negative >= moodCounts.positive) {
      return 'negative';
    } else {
      return 'neutral';
    }
  } catch (error) {
    console.error('Error finding predominant mood:', error);
    return 'neutral';
  }
}

function calculateAverageExercise(entries) {
  try {
    let totalExercise = 0;
    let validEntries = 0;
    
    entries.forEach(entry => {
      if (entry.exercise && entry.exercise.minutes) {
        totalExercise += parseInt(entry.exercise.minutes);
        validEntries++;
      }
    });
    
    return validEntries > 0 ? Math.round(totalExercise / validEntries) : 30;
  } catch (error) {
    console.error('Error calculating average exercise:', error);
    return 30;
  }
}

function generateBasicInsights(entries) {
  try {
    const insights = [
      `Based on your journal entries, you've been sleeping an average of ${calculateAverageSleep(entries)} hours per night.`,
      `Your predominant mood appears to be ${findPredominantMood(entries)}.`,
      `You've been exercising for an average of ${calculateAverageExercise(entries)} minutes per day.`
    ];
    
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [
      "Your sleep patterns appear to be consistent.",
      "Your journal entries suggest a generally balanced mood.",
      "Consider maintaining a regular exercise routine."
    ];
  }
}

function generateBasicRecommendations(entries) {
  try {
    const avgSleep = calculateAverageSleep(entries);
    const avgExercise = calculateAverageExercise(entries);
    const mood = findPredominantMood(entries);
    
    const recommendations = [];
    
    if (avgSleep < 7) {
      recommendations.push("Consider increasing your sleep duration to at least 7-8 hours per night.");
    } else if (avgSleep > 9) {
      recommendations.push("You might be oversleeping. Try to maintain a consistent 7-8 hour sleep schedule.");
    } else {
      recommendations.push("Your sleep duration is good. Try to maintain this consistent pattern.");
    }
    
    if (avgExercise < 20) {
      recommendations.push("Try to increase your physical activity to at least 30 minutes per day.");
    } else {
      recommendations.push("You're maintaining a good level of physical activity. Keep it up!");
    }
    
    if (mood === 'negative') {
      recommendations.push("Consider incorporating mindfulness or meditation practices to improve your mood.");
    } else {
      recommendations.push("Continue with activities that maintain your positive mental state.");
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [
      "Consider adding a short meditation practice before bed to improve sleep quality.",
      "Try to identify specific stressors in your daily routine and develop coping strategies.",
      "Gradually increase exercise duration or intensity to continue improving fitness."
    ];
  }
}

function generateFallbackAnalysis() {
  return {
    metrics: {
      sleep: {
        average: 7.5,
        quality: 75.0,
        trend: "stable"
      },
      mentalHealth: {
        averageScore: 80.0,
        predominantMood: "positive",
        stressLevel: "moderate",
        trend: "stable"
      },
      exercise: {
        average: 30.0,
        trend: "stable"
      }
    },
    insights: [
      "Your sleep patterns appear to be consistent, averaging around 7.5 hours per night.",
      "Your journal entries suggest a generally positive mood with moderate stress levels.",
      "You seem to be maintaining a regular exercise routine."
    ],
    recommendations: [
      "Consider adding a short meditation practice before bed to improve sleep quality.",
      "Try to identify specific stressors in your daily routine and develop coping strategies.",
      "Gradually increase exercise duration or intensity to continue improving fitness."
    ]
  };
}

export async function POST(request) {
  try {
    // Verify token
    const user = await verifyToken(request);
    if (!user) {
      console.log('Authentication failed');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { entries } = await request.json();
    console.log(`Analyzing ${entries?.length || 0} journal entries for user: ${user.email}`);
    
    // Debug the entries format
    console.log('Journal entries format:', JSON.stringify(entries?.[0] || {}, null, 2));

    if (!entries || !Array.isArray(entries)) {
      console.log('Invalid entries format:', entries);
      return NextResponse.json(
        { error: 'Invalid request: entries must be an array' },
        { status: 400 }
      );
    }
    
    // If no entries, return empty analysis
    if (entries.length === 0) {
      console.log('No entries provided, returning default analysis');
      return NextResponse.json(generateFallbackAnalysis());
    }

    // Format entries properly for analysis
    const formattedEntries = entries.map(entry => {
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
    
    console.log(`Formatted ${formattedEntries.length} entries for analysis`);
    
    const prompt = `Analyze this array of journal entries and return ONLY a valid JSON object:
${JSON.stringify(formattedEntries, null, 2)}

Required JSON structure (return EXACTLY this structure):
{
  "metrics": {
    "sleep": {
      "average": number,
      "quality": number,
      "trend": string
    },
    "mentalHealth": {
      "averageScore": number,
      "predominantMood": string,
      "stressLevel": string,
      "trend": string
    },
    "exercise": {
      "average": number,
      "trend": string
    }
  },
  "insights": [
    string,
    string,
    string
  ],
  "recommendations": [
    string,
    string,
    string
  ]
}

Analysis rules:
1. Sleep score (0-100): Based on deviation from ideal 8 hours (subtract 12.5 points per hour deviation)
2. Mental health score (0-100): Based on mood, stress, and symptoms
3. Provide exactly 3 specific insights
4. Provide exactly 3 actionable recommendations
5. Calculate trends as "improving", "stable", or "declining" based on last 3 entries
6. Round all numbers to 1 decimal place
7. DO NOT include any text or explanation, ONLY the JSON object
8. DO NOT add any additional fields to the JSON structure`;

    // Check if we have a valid OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('No OpenAI API key found, using basic analysis');
      const basicAnalysis = {
        metrics: {
          sleep: {
            average: calculateAverageSleep(formattedEntries),
            quality: calculateSleepQuality(formattedEntries),
            trend: "stable"
          },
          mentalHealth: {
            averageScore: calculateMentalHealthScore(formattedEntries),
            predominantMood: findPredominantMood(formattedEntries),
            stressLevel: "moderate",
            trend: "stable"
          },
          exercise: {
            average: calculateAverageExercise(formattedEntries),
            trend: "stable"
          }
        },
        insights: generateBasicInsights(formattedEntries),
        recommendations: generateBasicRecommendations(formattedEntries)
      };
      
      return NextResponse.json(basicAnalysis);
    }
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a health analytics expert. You MUST respond with ONLY a valid JSON object matching the EXACT structure specified. Do not include any other text, markdown, or explanation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

    let content = completion.choices[0].message.content;
    if (!content) {
      console.log('Empty response from analysis');
      return NextResponse.json(
        { error: 'Empty response from analysis' },
        { status: 500 }
      );
    }

    content = content.trim();
    console.log('Raw content:', content); // Debug log
    
    try {
      const analysis = JSON.parse(content);
      
      // Validate the required structure
      if (!analysis.metrics?.sleep || !analysis.insights || !analysis.recommendations) {
        console.log('Invalid analysis structure:', analysis);
        return NextResponse.json(
          { error: 'Invalid analysis structure' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(analysis);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError, 'Content:', content);
      return NextResponse.json(
        { error: 'Failed to parse analysis response' },
        { status: 500 }
      );
    }
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError.message || openaiError);
      
      // Use our basic analysis instead
      console.log('Using basic analysis due to OpenAI API error');
      const basicAnalysis = {
        metrics: {
          sleep: {
            average: calculateAverageSleep(formattedEntries),
            quality: calculateSleepQuality(formattedEntries),
            trend: "stable"
          },
          mentalHealth: {
            averageScore: calculateMentalHealthScore(formattedEntries),
            predominantMood: findPredominantMood(formattedEntries),
            stressLevel: "moderate",
            trend: "stable"
          },
          exercise: {
            average: calculateAverageExercise(formattedEntries),
            trend: "stable"
          }
        },
        insights: generateBasicInsights(formattedEntries),
        recommendations: generateBasicRecommendations(formattedEntries)
      };
      
      return NextResponse.json(basicAnalysis);
    }

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Log the error but try to continue with a partial analysis if possible
    console.error('Analysis error:', error.message || error);
    
    // Always return a valid JSON response
    try {
      // Check if we have any entries to analyze
      if (entries && entries.length > 0) {
      console.log('Attempting to generate a basic analysis from available data');
      
      // Create a simplified analysis based on the actual entries
      const basicAnalysis = {
        metrics: {
          sleep: {
            average: calculateAverageSleep(entries),
            quality: calculateSleepQuality(entries),
            trend: "stable"
          },
          mentalHealth: {
            averageScore: calculateMentalHealthScore(entries),
            predominantMood: findPredominantMood(entries),
            stressLevel: "moderate",
            trend: "stable"
          },
          exercise: {
            average: calculateAverageExercise(entries),
            trend: "stable"
          }
        },
        insights: generateBasicInsights(entries),
        recommendations: generateBasicRecommendations(entries)
      };
      
      console.log('Generated basic analysis from real data');
      return NextResponse.json(basicAnalysis);
    } else {
      // If no entries or other critical error, use fallback
      console.log('Using fallback analysis due to error and no valid entries');
      return NextResponse.json(generateFallbackAnalysis());
    }
    } catch (innerError) {
      console.error('Error in error handler:', innerError.message || innerError);
      // Last resort fallback
      return NextResponse.json({
        metrics: {
          sleep: { average: 7.5, quality: 75, trend: "stable" },
          mentalHealth: { averageScore: 80, predominantMood: "neutral", stressLevel: "moderate", trend: "stable" },
          exercise: { average: 30, trend: "stable" }
        },
        insights: ["Unable to analyze journal entries.", "Please try again later.", "Consider adding more detailed journal entries."],
        recommendations: ["Get 7-8 hours of sleep each night.", "Exercise regularly.", "Practice mindfulness for stress management."]
      });
    }
  }
}