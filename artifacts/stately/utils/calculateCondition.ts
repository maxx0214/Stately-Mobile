function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getSleepTimeScore(hours: number): number {
  if (hours >= 8) return 100;
  if (hours >= 7) return 87;
  if (hours >= 6) return 75;
  if (hours >= 5) return 60;
  return 45;
}

function getHRVScore(hrv: number): number {
  if (hrv >= 70) return 90;
  if (hrv >= 55) return 75;
  if (hrv >= 40) return 60;
  if (hrv >= 30) return 45;
  return 30;
}

export function getConditionLabel(score: number): string {
  if (score >= 85) return "Excellent Recovery";
  if (score >= 70) return "Good Condition";
  if (score >= 50) return "Moderate Fatigue";
  return "Recovery Needed";
}

export function getStatusColor(score: number): string {
  if (score >= 85) return "#34D399";
  if (score >= 70) return "#60A5FA";
  if (score >= 50) return "#FBBF24";
  return "#F87171";
}

export interface ConditionInput {
  activeKcal: number;
  goalKcal: number;
  sleepHours: number;
  sleepEfficiency: number;
  deepSleepScore: number;
  hrv: number;
  hrvReliability: "green" | "amber" | "red";
}

export interface ConditionResult {
  activityScore: number;
  sleepScore: number;
  hrvScore: number;
  conditionScore: number;
  label: string;
  weights: { activity: number; sleep: number; hrv: number };
}

export function calculateCondition(input: ConditionInput): ConditionResult {
  const activityScore = clamp(
    input.goalKcal > 0 ? (input.activeKcal / input.goalKcal) * 100 : 0,
    0,
    120
  );

  const sleepTimeScore = getSleepTimeScore(input.sleepHours);
  const sleepScore =
    0.2 * sleepTimeScore +
    0.45 * input.sleepEfficiency +
    0.35 * input.deepSleepScore;

  const hrvScore = getHRVScore(input.hrv);

  let weights = { activity: 0.3, sleep: 0.4, hrv: 0.3 };
  if (input.hrvReliability === "red") {
    weights = { activity: 0.35, sleep: 0.5, hrv: 0.15 };
  } else if (input.hrvReliability === "amber") {
    weights = { activity: 0.32, sleep: 0.43, hrv: 0.25 };
  }

  const conditionScore = clamp(
    weights.activity * activityScore +
      weights.sleep * sleepScore +
      weights.hrv * hrvScore,
    0,
    100
  );

  return {
    activityScore: Math.round(activityScore),
    sleepScore: Math.round(sleepScore),
    hrvScore,
    conditionScore: Math.round(conditionScore),
    label: getConditionLabel(conditionScore),
    weights,
  };
}
