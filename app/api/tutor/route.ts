import { NextRequest, NextResponse } from "next/server";
import { groq, MODEL } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, message, history, quiz, userAnswers, score } = body;

    // Mode: General Chat
    if (mode === "general") {
      const systemPrompt = `You are an expert medical genetics guide. You help players understand clinical genetics concepts clearly and thoroughly.

Key guidelines:
- Provide accurate, evidence-based information
- Use clinical examples when helpful
- Explain complex concepts in accessible terms
- Reference relevant genetic disorders, inheritance patterns, and molecular mechanisms
- Be encouraging and supportive
- IMPORTANT: Return plain text only. Do NOT use markdown formatting like **bold**, *italic*, or # headers. Just use plain text with line breaks for formatting.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...history.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: message },
      ];

      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      });

      return NextResponse.json({
        response: completion.choices[0]?.message?.content || "I couldn't generate a response.",
      });
    }

    // Mode: Learn → Quiz
    if (mode === "learn_quiz") {
      const systemPrompt = `You are an expert medical genetics guide. The player wants to learn about a topic and then be quizzed.

Your response MUST be in this exact JSON format:
{
  "explanation": "A detailed, educational explanation of the topic (2-3 paragraphs covering key concepts, clinical relevance, and important details). Use plain text only, no markdown formatting like ** or #.",
  "quiz": {
    "questions": [
      {
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0
      },
      {
        "question": "Second question",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 2
      },
      {
        "question": "Third question",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 1
      }
    ]
  }
}

IMPORTANT: The explanation must be plain text only - no markdown formatting like **bold** or # headers.
The quiz should have exactly 3 questions based on the explanation.
correctAnswer is the 0-indexed position of the correct option.
Only respond with valid JSON, no additional text.`;

      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Teach me about: ${message}` },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      try {
        // Try to parse the JSON response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            explanation: parsed.explanation,
            quiz: parsed.quiz,
          });
        }
      } catch (parseError) {
        // If JSON parsing fails, return just the text as explanation
        return NextResponse.json({
          explanation: responseText,
          quiz: null,
        });
      }

      return NextResponse.json({
        explanation: responseText,
        quiz: null,
      });
    }

    // Mode: Quiz → Learn (Generate Quiz)
    if (mode === "quiz_learn") {
      const systemPrompt = `You are an expert medical genetics guide. Generate a quiz for the player to test their knowledge BEFORE learning.

Your response MUST be in this exact JSON format:
{
  "quiz": {
    "questions": [
      {
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0
      },
      {
        "question": "Second question",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 2
      },
      {
        "question": "Third question",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 1
      }
    ]
  }
}

Generate exactly 3 challenging but fair questions about the topic.
correctAnswer is the 0-indexed position of the correct option.
Only respond with valid JSON, no additional text.`;

      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a quiz about: ${message}` },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            quiz: parsed.quiz,
          });
        }
      } catch (parseError) {
        return NextResponse.json({
          error: "Failed to generate quiz",
        });
      }

      return NextResponse.json({
        error: "Failed to generate quiz",
      });
    }

    // Mode: Quiz → Learn (Explain after quiz)
    if (mode === "quiz_learn_explain") {
      const wrongAnswers = quiz.questions
        .map((q: { question: string; options: string[]; correctAnswer: number }, i: number) => {
          if (userAnswers[i] !== q.correctAnswer) {
            return {
              question: q.question,
              userAnswer: q.options[userAnswers[i]],
              correctAnswer: q.options[q.correctAnswer],
            };
          }
          return null;
        })
        .filter(Boolean);

      const systemPrompt = `You are an expert medical genetics guide. The player just completed a quiz and scored ${score}/${quiz.questions.length}.

${wrongAnswers.length > 0 ? `They got these questions wrong:
${wrongAnswers.map((w: { question: string; userAnswer: string; correctAnswer: string }) => `- Question: "${w.question}"
  Their answer: "${w.userAnswer}"
  Correct answer: "${w.correctAnswer}"`).join('\n')}` : 'They got all questions correct!'}

Provide a comprehensive explanation of the topic that:
1. First, give a brief overview of the topic (2-3 paragraphs covering key concepts)
2. Congratulates them on their score
3. ${wrongAnswers.length > 0 ? 'Explains why their wrong answers were incorrect and why the correct answers are right' : 'Reinforces the key concepts they demonstrated understanding of'}
4. Provides additional context and clinical relevance
5. Offers tips for remembering key information

Be encouraging and educational.
IMPORTANT: Return plain text only. Do NOT use markdown formatting like **bold**, *italic*, or # headers.`;

      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Please explain the topic based on my quiz results." },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return NextResponse.json({
        explanation: completion.choices[0]?.message?.content || "Great job on the quiz!",
      });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (error) {
    console.error("Tutor API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
