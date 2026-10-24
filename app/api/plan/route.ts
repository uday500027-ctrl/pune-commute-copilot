import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = body?.query;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Please enter your journey details." },
        { status: 400 }
      );
    }

    // 1-second delay as requested (mocking AI/backend processing)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockData: PlanResponse = {
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

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("API error in /api/plan:", error);
    return NextResponse.json(
      { error: "Failed to generate commute plan. Please try again." },
      { status: 500 }
    );
  }
}
