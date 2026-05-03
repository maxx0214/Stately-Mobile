export function generateAdvice(
  conditionScore: number,
  activityScore: number,
  sleepScore: number,
  hrvScore: number
): string {
  let base: string;

  if (conditionScore >= 85) {
    base = "오늘은 컨디션이 매우 좋아요. 활발하게 움직여보면 좋겠어요.";
  } else if (conditionScore >= 70) {
    base = "전반적으로 좋은 컨디션이에요. 오늘도 꾸준히 움직여보세요.";
  } else if (conditionScore >= 50) {
    base = "몸이 조금 지쳐있는 것 같아요. 무리하지 않고 천천히 시작해보세요.";
  } else {
    base = "오늘은 회복을 우선해보세요. 충분한 휴식이 도움이 될 수 있어요.";
  }

  const scores: Record<string, number> = {
    activity: activityScore,
    sleep: sleepScore,
    hrv: hrvScore,
  };

  const weakest = Object.entries(scores).reduce((a, b) =>
    a[1] < b[1] ? a : b
  );

  if (weakest[0] === "sleep" && sleepScore < 70) {
    return "어젯밤 수면이 충분하지 않았을 수 있어요. " + base;
  }
  if (weakest[0] === "hrv" && hrvScore < 60) {
    return "신체 회복이 필요한 상태예요. 가벼운 스트레칭이나 명상을 해보면 좋겠어요.";
  }
  if (weakest[0] === "activity" && activityScore < 30) {
    return base + " 짧은 산책부터 시작해보면 어떨까요?";
  }

  return base;
}
