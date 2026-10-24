import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import stationsData from "@/data/stations.json";

export interface CommuteStep {
  mode: "walk" | "auto" | "metro" | "bus" | string;
  from: string;
  to: string;
  durationMin: number;
  costINR: number;
  instruction: string;
  line: string | null;
}

export interface PlanResponse {
  summary: string;
  totalMin: number;
  totalCostINR: number;
  steps: CommuteStep[];
}

const MOCK_RESPONSE: PlanResponse = {
  summary: "Take the Aqua Line from Vanaz to Pune Railway Station.",
  totalMin: 35,
  totalCostINR: 30,
  steps: [
    {
      mode: "walk",
      from: "Your location",
      to: "Vanaz Metro Station",
      durationMin: 5,
      costINR: 0,
      instruction: "Walk to Vanaz station entrance",
      line: null,
    },
    {
      mode: "metro",
      from: "Vanaz",
      to: "Pune Railway Station",
      durationMin: 25,
      costINR: 30,
      instruction: "Board Aqua Line towards Ramwadi",
      line: "Aqua Line",
    },
    {
      mode: "walk",
      from: "Pune Railway Station Metro",
      to: "Destination",
      durationMin: 5,
      costINR: 0,
      instruction: "Exit and walk to your destination",
      line: null,
    },
  ],
};

const SYSTEM_INSTRUCTION =
  "You are Pune Commute Copilot, a transit planner for Pune, India. The user describes a trip in English, Hindi, or Marathi. Using ONLY the Pune Metro stations provided, plan the best route combining walking, auto-rickshaw, PMPML bus, and Pune Metro. If the start or destination is far from any metro station, suggest auto or bus for that leg. Change lines only at the interchange station. Respect the user's preference (fastest/cheapest/time deadline). Give realistic estimates: metro fares ₹10–35, auto roughly ₹20–25 per km, PMPML bus ₹5–30. Respond in the same language the user wrote in for 'summary' and 'instruction' fields, but keep 'mode' and 'line' in English. Return ONLY JSON in this exact shape: { summary: string, totalMin: number, totalCostINR: number, steps: [{ mode: 'walk'|'auto'|'metro'|'bus', from: string, to: string, durationMin: number, costINR: number, instruction: string, line: string|null }] }";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { query, demo } = body;

    // Fallback: if demo: true is requested, return the mock response
    if (demo === true) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(MOCK_RESPONSE);
    }

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Please enter your journey details." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please set GEMINI_API_KEY in your environment." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Available Pune Metro network and transit stations data:
${JSON.stringify(stationsData, null, 2)}

User trip request:
"${query.trim()}"`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      return NextResponse.json(
        { error: "No response received from transit planner. Please try again." },
        { status: 500 }
      );
    }

    let planData: PlanResponse;
    try {
      planData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error from Gemini output:", responseText, parseError);
      return NextResponse.json(
        { error: "Received an invalid format from route planning service. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(planData);
  } catch (error) {
    console.error("Error generating commute plan with Gemini API:", error);
    return NextResponse.json(
      { error: "Failed to generate commute plan. Please try again later." },
      { status: 500 }
    );
  }
}
