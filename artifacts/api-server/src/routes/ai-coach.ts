import { Router } from "express";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

const router = Router();

const RequestSchema = z.object({
  conditionScore: z.number().min(0).max(100),
  conditionLabel: z.string(),
  activityScore: z.number(),
  sleepScore: z.number(),
  hrvScore: z.number(),
  hrvReliability: z.enum(["green", "amber", "red"]),
  weakestMetric: z.enum(["activity", "sleep", "hrv"]),
});

type CoachData = z.infer<typeof RequestSchema>;

function koreanFallback(data: CoachData): string {
  let base: string;

  if (data.conditionScore >= 85) {
    base = "오늘은 컨디션이 매우 좋아요. 활발하게 움직여보면 좋겠어요.";
  } else if (data.conditionScore >= 70) {
    base = "전반적으로 좋은 컨디션이에요. 오늘도 꾸준히 움직여보세요.";
  } else if (data.conditionScore >= 50) {
    base = "몸이 조금 지쳐있는 것 같아요. 무리하지 않고 천천히 시작해보세요.";
  } else {
    base = "오늘은 회복을 우선해보세요. 충분한 휴식이 도움이 될 수 있어요.";
  }

  if (data.weakestMetric === "sleep" && data.sleepScore < 70) {
    return "어젯밤 수면이 충분하지 않았을 수 있어요. " + base;
  }
  if (data.weakestMetric === "hrv" && data.hrvScore < 60) {
    return "신체 회복이 필요한 상태예요. 가벼운 스트레칭이나 명상을 해보면 좋겠어요.";
  }
  if (data.weakestMetric === "activity" && data.activityScore < 30) {
    return base + " 짧은 산책부터 시작해보면 어떨까요?";
  }

  return base;
}

const STIFF_PHRASE_MAP: [RegExp, string][] = [
  [/필요합니다/g, "챙겨보면 좋아요"],
  [/해야 합니다/g, "해보면 좋겠어요"],
  [/권장됩니다/g, "도움이 될 수 있어요"],
  [/요구됩니다/g, "도움이 될 수 있어요"],
  [/주의가 필요합니다/g, "조금만 신경 써보면 좋아요"],
  [/주의가 필요해요/g, "조금만 신경 써보면 좋아요"],
  [/필요해요/g, "챙겨보면 좋아요"],
  [/해야 해요/g, "해보면 좋겠어요"],
];

function cleanAdvice(text: string): string {
  let result = text
    .trim()
    .replace(/^["'「『【\s]+|["'」』】\s]+$/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/（[^）]*）/g, "")
    .trim();

  for (const [pattern, replacement] of STIFF_PHRASE_MAP) {
    result = result.replace(pattern, replacement);
  }

  return result.trim();
}

function buildPrompt(data: CoachData): string {
  return `You are Stately, a gentle Korean condition coach.

Write one short Korean advice message based on the user's daily condition data.

Strict rules:
- Korean only. Use Hangul (한글) characters only.
- Do not include English words or letters.
- Do not include Chinese characters (漢字).
- Do not include Japanese characters.
- Do not include translations.
- Do not include parentheses or brackets explaining the message.
- Do not wrap the output in quotation marks.
- Do not greet the user.
- Output only the advice sentence, nothing else.
- Keep it under 2 short sentences.
- Be warm, calm, and supportive.
- Use recommendation-style language, not commands.
- Do not sound medical or diagnostic.
- Do not make disease claims.
- Do not mention formulas or weights.
- Make the advice consistent with the condition score and condition label.

Tone rules — endings to prefer:
- "해보면 좋겠어요"
- "챙겨보면 좋아요"
- "도움이 될 수 있어요"
- "무리 없이 이어가도 좋아요"
- "천천히 시작해보세요"

Tone rules — endings to avoid:
- "필요합니다" (too clinical)
- "해야 합니다" (too commanding)
- "권장됩니다" (too formal)
- "요구됩니다" (too strict)
- "주의가 필요합니다" (too alarming)

Interpretation guide:
- 85–100 / Excellent Recovery: strong recovery, great readiness. Keep the tone clearly positive. Recommend maintaining rhythm or light-to-moderate activity. If mentioning a weaker metric, phrase it as a minor, optional note — not a problem.
- 70–84 / Good Condition: generally good, keep a moderate pace.
- 50–69 / Moderate Fatigue: some fatigue showing, suggest lighter movement.
- 0–49 / Recovery Needed: prioritize rest, reduce intensity.

If one metric is weaker than the others, mention it gently.
If the overall score is high, do not make the second sentence feel negative or urgent.

Data:
Condition score: ${data.conditionScore}
Condition label: ${data.conditionLabel}
Activity score: ${data.activityScore}
Sleep score: ${data.sleepScore}
HRV score: ${data.hrvScore}
HRV reliability: ${data.hrvReliability}
Weakest metric: ${data.weakestMetric}

Good output examples:
- "오늘은 회복 상태가 좋아 보여요. 평소 루틴을 무리 없이 이어가도 좋겠어요."
- "전반적인 컨디션이 좋은 편이에요. 수면은 조금만 더 챙겨보면 내일도 활기차게 시작할 수 있어요."
- "몸이 조금 지쳐 있는 신호가 보여요. 오늘은 강도를 낮추고 가볍게 움직여보면 좋겠어요."
- "회복이 잘 되고 있어요. 가벼운 유산소나 스트레칭을 해보면 좋겠어요."`;
}

async function callGroq(data: CoachData, apiKey: string): Promise<string> {
  const model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: buildPrompt(data) }],
    max_tokens: 120,
    temperature: 0.7,
  });
  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty response from Groq");
  return cleanAdvice(raw);
}

async function callGemini(data: CoachData, apiKey: string): Promise<string> {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: buildPrompt(data),
  });
  const raw = response.text?.trim();
  if (!raw) throw new Error("Empty response from Gemini");
  return cleanAdvice(raw);
}

async function callOpenAI(data: CoachData, apiKey: string): Promise<string> {
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: buildPrompt(data) }],
    max_tokens: 120,
    temperature: 0.7,
  });
  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty response from OpenAI");
  return cleanAdvice(raw);
}

router.post("/ai-coach", async (req, res) => {
  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (groqKey) {
    try {
      const advice = await callGroq(data, groqKey);
      req.log.info("Groq call succeeded");
      res.json({ advice, source: "groq" });
      return;
    } catch (err) {
      req.log.error({ err }, "Groq call failed — trying Gemini fallback");
    }
  } else {
    req.log.warn("GROQ_API_KEY not set — skipping Groq");
  }

  if (geminiKey) {
    req.log.info("Gemini fallback attempted");
    try {
      const advice = await callGemini(data, geminiKey);
      req.log.info("Gemini call succeeded");
      res.json({ advice, source: "gemini" });
      return;
    } catch (err) {
      req.log.error({ err }, "Gemini call failed — trying OpenAI fallback");
    }
  } else {
    req.log.warn("GEMINI_API_KEY not set — skipping Gemini");
  }

  if (openaiKey) {
    req.log.info("OpenAI fallback attempted");
    try {
      const advice = await callOpenAI(data, openaiKey);
      req.log.info("OpenAI call succeeded");
      res.json({ advice, source: "openai" });
      return;
    } catch (err) {
      req.log.error({ err }, "OpenAI call failed — using local fallback");
    }
  } else {
    req.log.warn("OPENAI_API_KEY not set — skipping OpenAI");
  }

  req.log.info("Local Korean fallback used");
  res.json({ advice: koreanFallback(data), source: "fallback" });
});

export default router;
