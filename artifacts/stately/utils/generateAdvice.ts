export function generateAdvice(
  conditionScore: number,
  activityScore: number,
  sleepScore: number,
  hrvScore: number
): string {
  let base = "";

  if (conditionScore >= 85) {
    base =
      "Your body looks well recovered today. A productive training day is possible.";
  } else if (conditionScore >= 70) {
    base =
      "You are in good condition. Keep your workout moderate and stay hydrated.";
  } else if (conditionScore >= 50) {
    base =
      "Your body shows some fatigue. Choose light cardio or mobility work today.";
  } else {
    base =
      "Recovery should be your priority today. Reduce training intensity and focus on sleep.";
  }

  const scores: Record<string, number> = {
    activity: activityScore,
    sleep: sleepScore,
    hrv: hrvScore,
  };

  const weakest = Object.entries(scores).reduce((a, b) =>
    a[1] < b[1] ? a : b
  );

  let extra = "";
  if (weakest[0] === "sleep" && sleepScore < 70) {
    extra =
      " Sleep recovery is your limiting factor — prioritize rest tonight.";
  } else if (weakest[0] === "hrv" && hrvScore < 60) {
    extra =
      " Your HRV signal is low — reduce caffeine and prioritize relaxation.";
  } else if (weakest[0] === "activity" && activityScore > 110) {
    extra = " High activity load detected — watch for accumulated fatigue.";
  } else if (weakest[0] === "activity" && activityScore < 30) {
    extra = " A short walk or light movement would help boost your energy.";
  }

  return base + extra;
}
