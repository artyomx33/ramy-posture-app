import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

export async function POST(request: Request) {
  try {
    const { imageUrls } = await request.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length !== 4) {
      return NextResponse.json(
        { error: 'Exactly 4 images required (front, back, left, right)' },
        { status: 400 }
      );
    }

    // Analyze each photo with GPT-4 Vision
    const analysisPromises = imageUrls.map(async (url, index) => {
      const positions = ['front', 'back', 'left', 'right'];
      const position = positions[index];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a professional posture analyst. Analyze the ${position} view body posture photo against the grid background. 
            
Identify and measure:
1. Shoulder alignment (height difference in cm)
2. Head position (forward head posture in cm)
3. Hip alignment (rotation, height difference)
4. Spine curvature (kyphosis, lordosis)
5. Any other visible imbalances

Return ONLY a JSON object with this structure:
{
  "position": "${position}",
  "findings": [
    {
      "type": "Shoulders|Head|Hips|Spine|Other",
      "finding": "detailed description",
      "severity": "normal|mild|moderate|severe",
      "measurement": "measurement with units or null"
    }
  ]
}`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this ${position} view posture photo. The person is standing against a grid background. Identify any postural imbalances.`,
              },
              {
                type: 'image_url',
                image_url: { url },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content || '{}';
      // Extract JSON from markdown code block if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/({[\s\S]*})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      return JSON.parse(jsonStr);
    });

    const analyses = await Promise.all(analysisPromises);

    // Generate recommendations based on findings
    const allFindings = analyses.flatMap((a) => a.findings || []);
    const issues = allFindings.filter((f: any) => f.severity !== 'normal');

    const recommendationsPrompt = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a physical therapy expert. Based on the posture analysis findings, generate 4-6 specific therapy recommendations.

Return ONLY a JSON object:
{
  "summary": "brief overall assessment",
  "recommendations": ["specific treatment 1", "specific treatment 2", ...]
}`,
        },
        {
          role: 'user',
          content: `Findings: ${JSON.stringify(issues)}`,
        },
      ],
      max_tokens: 800,
    });

    const recContent = recommendationsPrompt.choices[0]?.message?.content || '{}';
    const recJsonMatch = recContent.match(/```json\n?([\s\S]*?)\n?```/) || recContent.match(/({[\s\S]*})/);
    const recJsonStr = recJsonMatch ? recJsonMatch[1] : recContent;
    const recommendations = JSON.parse(recJsonStr);

    return NextResponse.json({
      analyses,
      summary: recommendations.summary,
      recommendations: recommendations.recommendations,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze images' },
      { status: 500 }
    );
  }
}
