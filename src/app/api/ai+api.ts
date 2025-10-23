// Using direct fetch to OpenAI API instead of the Node.js SDK for React Native compatibility
import Constants from 'expo-constants';

export async function POST(request: Request) {
    const { exerciseName } = await request.json();

    if (!exerciseName) {
        return new Response(JSON.stringify({ error: "Exercise name is required" }), { status: 400 });
    }

    const apiKey = Constants.expoConfig?.extra?.openaiApiKey;

    if (!apiKey) {
        console.log("No OpenAI API key found, returning mock response");
        return Response.json({ message: getMockAIResponse(exerciseName) });
    }

    const prompt = `
    You are a fitness coach.
    You are given an exercise, provide clear instructions on how to perform the exercise. Include if any equipment is required.
    Explain the exercise in detail and for a beginner.
    
    The exercise name is "${exerciseName}".

    Keep it short and concise. Use markdown formatting.
    
    Use the following format:

    ## Equipment Required
    
    ## Instructions
    
    ## Variations
    
    ## Safety Tips
    
    Keep spacing between the headings and the content.
    
    Always use headings and subheadings.
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return Response.json({ message: data.choices[0].message?.content });
    } catch (error) {
        console.error("Error fetching AI response:", error);
        // Fallback to mock response if API fails
        return Response.json({ message: getMockAIResponse(exerciseName) });
    }
}

function getMockAIResponse(exerciseName: string): string {
    return `## Equipment Required

No special equipment required - just your body weight and some floor space.

## Instructions

1. **Starting Position**: Begin in the proper starting stance for ${exerciseName}
2. **Movement**: Execute the movement with controlled motion
3. **Form Focus**: Maintain proper form throughout the entire range of motion
4. **Breathing**: Coordinate your breathing with the movement pattern
5. **Repetitions**: Start with 8-12 repetitions and build up gradually

## Variations

• **Beginner**: Start with an easier modified version
• **Intermediate**: Perform the standard version with focus on form
• **Advanced**: Add resistance or increase range of motion
• **Alternative**: Try different grips or stances for variety

## Safety Tips

• Always warm up before starting your exercise routine
• Focus on proper form rather than speed or heavy weight
• Stop immediately if you feel any sharp pain
• Start slowly and gradually increase intensity
• Listen to your body and rest when needed

*Note: This is a demo response. For personalized guidance, consult with a certified fitness trainer.*`;
}
