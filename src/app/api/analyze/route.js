import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { entries } = await request.json();

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Invalid request: entries must be an array' },
        { status: 400 }
      );
    }

    const prompt = `Analyze this array of journal entries and return ONLY a valid JSON object:
${JSON.stringify(entries, null, 2)}

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

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze entries' },
      { status: 500 }
    );
  }
}