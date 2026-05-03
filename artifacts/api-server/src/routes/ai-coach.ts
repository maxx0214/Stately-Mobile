import { Router } from "express";
import { z } from "zod";
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

function buildPrompt(data: CoachData): string {
  return `You are a gentle Korean condition coach for an app called Stately.

Based on the user's daily condition data, write one short Korean advice message.

Rules:
- Write in Korean.
- Be warm, calm, and supportive.
- Do not sound medical or diagnostic.
- Do not make disease claims.
- Use recommendation-style language.
- Keep it under 2 short sentences.
- Mention the weakest metric if useful.
- Do not mention exact formulas or weights.
- Use expressions like:
  - "해보면 좋겠어요"
  - "도움이 될 수 있어요"
  - "무리하지 않아도 괜찮아요"
  - "천천히 시작해보세요"
  - "오늘은 회복을 우선해보세요"

Data:
Condition score: ${data.conditionScore}
Condition label: ${data.conditionLabel}
Activity score: ${data.activityScore}
Sleep score: ${data.sleepScore}
HRV score: ${data.hrvScore}
HRV reliability: ${data.hrvReliability}
Weakest metric: ${data.weakestMetric}`;
}

router.post("/ai-coach", async (req, res) => {
  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const client = new OpenAI({ apiKey });
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: buildPrompt(data) }],
        max_tokens: 150,
        temperature: 0.7,
      });
      const advice = completion.choices[0]?.message?.content?.trim();
      if (advice) {
        res.json({ advice, source: "openai" });
        return;
      }
    } catch (err) {
      req.log.error({ err }, "OpenAI call failed — using Korean fallback");
    }
  } else {
    req.log.warn("OPENAI_API_KEY not set — using Korean fallback");
  }

  res.json({ advice: koreanFallback(data), source: "fallback" });
});

export default router;
