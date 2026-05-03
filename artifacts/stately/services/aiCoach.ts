import { Platform } from "react-native";

export interface AiCoachRequest {
  conditionScore: number;
  conditionLabel: string;
  activityScore: number;
  sleepScore: number;
  hrvScore: number;
  hrvReliability: "green" | "amber" | "red";
  weakestMetric: "activity" | "sleep" | "hrv";
}

export interface AiCoachResponse {
  advice: string;
  source: "openai" | "fallback";
}

function getApiBase(): string {
  if (Platform.OS === "web") return "";
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
}

export async function fetchAiCoachAdvice(
  payload: AiCoachRequest
): Promise<AiCoachResponse> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/ai-coach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`AI coach API error: ${res.status}`);
  }
  return res.json() as Promise<AiCoachResponse>;
}
