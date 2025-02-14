import { NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { Prisma } from "@prisma/client";

import { embeddingService } from "@/lib/embeddings/gemini-embeddings";
import { ragFeedbackService } from "@/lib/feedback/rag-feedback";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite-preview-02-05",
});

interface TradeScore {
  technicalScore: number;
  marketContextScore: number;
  riskScore: number;
  overallScore: number;
  confidence: number;
  explanation: string;
  timeframeRecommendations: {
    shouldCheckOther: boolean;
    suggestedTimeframes: string[];
    reason: string;
  };
}

interface TradeGuidance {
  currentPosition: {
    status: "PROFIT" | "LOSS" | "BREAKEVEN";
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    suggestedAction: "HOLD" | "EXIT" | "PARTIAL_EXIT" | "ADD";
  };
  psychologyCheck: {
    emotionalState: string;
    biasWarnings: string[];
    recommendations: string[];
  };
}

interface AnalysisResponse {
  type: "OPPORTUNITY" | "GUIDANCE";
  score?: TradeScore;
  guidance?: TradeGuidance;
  analysis: string;
  context: Array<{ id: string; category: string; similarity: number }>;
  timestamp: string; // ISO string format
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { image, prompt, type = "OPPORTUNITY", sessionId } = await req.json();

    if (!image || !prompt) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify session exists and belongs to user
    if (sessionId) {
      const session = await prisma.analysisSession.findUnique({
        where: {
          id: sessionId,
          userId: user.id!,
        },
      });

      if (!session) {
        return new NextResponse("Invalid session", { status: 400 });
      }
    }

    // Get relevant trading knowledge
    const relevantKnowledge = await embeddingService.findSimilar(
      prompt,
      undefined,
      3,
    );

    // Format knowledge for context injection
    const knowledgeContext = relevantKnowledge
      .map((k) => `${k.category}: ${k.content}`)
      .join("\n\n");

    // Convert base64 image to bytes
    const imageData = image.split(",")[1];

    // Create parts array with image and text
    const parts: Part[] = [
      {
        inlineData: {
          data: imageData,
          mimeType: "image/png",
        },
      },
      {
        text: `Using the following trading knowledge as context:

${knowledgeContext}

${
  type === "OPPORTUNITY"
    ? `
Analyze this trading chart for potential opportunities. ${prompt}

First, identify if there are any specific questions in the user's prompt and make sure to address them directly in your explanation.

Consider timeframe context:
1. Assess if the current timeframe provides sufficient context
2. Suggest checking higher/lower timeframes if needed for better confirmation
3. Recommend specific timeframes that could provide valuable additional insights

Score this opportunity using these strict criteria:

TECHNICAL SCORE (0-100):
- 90-100: Perfect technical setup (multiple confirming indicators, clear patterns, strong momentum)
- 80-89: Strong technical setup (clear pattern, good indicators)
- 70-79: Good technical setup (some confirming signals)
- 60-69: Mixed technical signals
- Below 60: Weak or conflicting signals

MARKET CONTEXT SCORE (0-100):
- 90-100: Perfect market alignment (strong trend, clear market structure)
- 80-89: Strong market conditions (good trend alignment)
- 70-79: Decent market conditions (neutral trend)
- 60-69: Mixed market conditions
- Below 60: Poor market conditions

RISK SCORE (0-100):
- 90-100: Excellent R:R ratio (>3:1) with clear invalidation
- 80-89: Strong R:R ratio (2.5-3:1)
- 70-79: Good R:R ratio (2:1)
- 60-69: Marginal R:R ratio (1.5:1)
- Below 60: Poor R:R or unclear invalidation

OVERALL SCORE calculation:
1. Weight each component:
   - Technical Score: 40%
   - Risk Score: 35%
   - Market Context Score: 25%
2. Calculate weighted average
3. Round to nearest whole number

Provide the analysis in the following JSON format:
{
  "technicalScore": <score based on above criteria>,
  "marketContextScore": <score based on above criteria>,
  "riskScore": <score based on above criteria>,
  "overallScore": <weighted average as described above>,
  "confidence": <0-100 based on analysis certainty>,
  "timeframeRecommendations": {
    "shouldCheckOther": <true/false>,
    "suggestedTimeframes": [<list of recommended timeframes to check>],
    "reason": "<explanation of why these timeframes would be valuable>"
  },
  "explanation": "<Start with a direct response to any user questions. Then explain the scoring:
    - If overall score >= 80: Strongly recommend the opportunity
    - If overall score 70-79: Highlight both positives and cautions
    - If overall score < 70: Explain why it's not recommended

    Include specific timeframe suggestions if relevant.
    Use a conversational tone and address the user directly.>"
}
`
    : `
Analyze this trading chart for active trade guidance. ${prompt}

First, identify any specific questions or concerns in the user's prompt. Make sure to address these directly in your response.

Then extract the following information from the prompt and chart:
1. Entry price level (look for numbers or price levels mentioned)
2. Current price level (analyze the chart's current price)
3. Stop loss level (look for mentions of stop loss or risk level)
4. Trade direction (long/buy or short/sell)

Calculate the following:
1. Current P/L %: ((Current Price - Entry Price) / Entry Price) * 100 for longs, or ((Entry Price - Current Price) / Entry Price) * 100 for shorts
2. Risk Level: Based on proximity to stop loss and market volatility
3. Suggested Action: Based on technical analysis, risk level, and market conditions

Provide guidance in the following JSON format:
{
  "currentPosition": {
    "status": "<PROFIT if P/L > 0.5% | LOSS if P/L < -0.5% | BREAKEVEN if -0.5% <= P/L <= 0.5%>",
    "riskLevel": "<LOW if far from stop and low volatility | MEDIUM if moderate risk | HIGH if near stop or high volatility>",
    "suggestedAction": "<HOLD|EXIT|PARTIAL_EXIT|ADD based on technical analysis and risk>"
  },
  "psychologyCheck": {
    "emotionalState": "<analyze potential emotional state based on position performance and user's tone>",
    "biasWarnings": [
      "<identify potential trading biases based on market conditions, position, and user's concerns>"
    ],
    "recommendations": [
      "<provide personalized, actionable steps addressing user's specific questions and concerns>",
      "<add general position management advice if needed>"
    ]
  }
}

Start your response by directly addressing the user's questions or concerns. For example:
- If they ask "Should I exit?", begin with "Regarding your question about exiting the position..."
- If they ask "Is my stop loss good?", start with "About your stop loss placement..."
- If they express uncertainty, acknowledge it: "I understand your concern about..."

Then provide the technical analysis and recommendations in a conversational tone. Make the user feel understood and supported in their decision-making process.
`
}

Additional considerations:
1. Pattern identification
2. Key support and resistance levels
3. Trend analysis
4. Risk considerations
5. Direct answers to user questions`,
      },
    ];

    // Generate content
    const result = await model.generateContent(parts);
    const response = result.response;
    const text = response.text();

    // Try to parse JSON from the response
    let parsedResponse: any = {};
    try {
      // Extract JSON from the response text (it might be wrapped in other text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // First attempt: Try parsing the original JSON
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (originalParseError) {
          console.warn("Failed to parse original JSON, attempting cleanup");

          // Second attempt: Clean and parse
          const jsonStr = jsonMatch[0]
            .replace(/[\u0000-\u0019]+/g, "") // Remove control characters
            .replace(/\\([^"\/bfnrtu])/g, "$1") // Remove invalid escapes
            .replace(/([^\\])"/g, '$1\\"') // Escape unescaped quotes
            .replace(/^\s*"|"\s*$/g, '"') // Ensure proper quote wrapping
            .replace(/\n/g, "\\n") // Properly escape newlines
            .replace(/\r/g, "\\r") // Properly escape carriage returns
            .replace(/\t/g, "\\t"); // Properly escape tabs

          try {
            parsedResponse = JSON.parse(jsonStr);
          } catch (cleanedParseError) {
            console.error("Failed to parse both original and cleaned JSON", {
              originalError: originalParseError,
              cleanedError: cleanedParseError,
            });
            throw cleanedParseError;
          }
        }
      } else {
        throw new Error("No JSON object found in response");
      }
    } catch (e) {
      console.warn("Failed to parse JSON response", e);
      // Provide a default structure based on the analysis type
      parsedResponse =
        type === "OPPORTUNITY"
          ? {
              technicalScore: 0,
              marketContextScore: 0,
              riskScore: 0,
              overallScore: 0,
              confidence: 0,
              explanation:
                "Failed to parse analysis results. Please try again.",
              timeframeRecommendations: {
                shouldCheckOther: false,
                suggestedTimeframes: [],
                reason: "Analysis parsing failed",
              },
            }
          : {
              currentPosition: {
                status: "BREAKEVEN",
                riskLevel: "MEDIUM",
                suggestedAction: "HOLD",
              },
              psychologyCheck: {
                emotionalState: "Unable to analyze",
                biasWarnings: ["Analysis parsing failed"],
                recommendations: ["Please try the analysis again"],
              },
            };
    }

    // Record initial feedback
    await ragFeedbackService.recordFeedback({
      userId: user.id!,
      queryText: prompt,
      selectedKnowledge: relevantKnowledge.map((k) => k.id),
      isRelevant: true,
    });

    const analysisResponse: AnalysisResponse = {
      type,
      ...(type === "OPPORTUNITY"
        ? { score: parsedResponse }
        : { guidance: parsedResponse }),
      analysis: text,
      context: relevantKnowledge.map((k) => ({
        id: k.id,
        category: k.category,
        similarity: k.similarity,
      })),
      timestamp: new Date().toISOString(),
    };

    // Store analysis in session if provided
    if (sessionId) {
      await prisma.analysis.create({
        data: {
          sessionId,
          type,
          prompt,
          image,
          result: JSON.parse(
            JSON.stringify(analysisResponse),
          ) as Prisma.JsonObject,
        },
      });

      // Update session timestamp
      await prisma.analysisSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json(analysisResponse);
  } catch (error) {
    console.error("[ANALYZE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
