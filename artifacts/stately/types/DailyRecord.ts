export interface DailyRecord {
  id: string;
  date: string;
  activity: {
    activeKcal: number;
    goalKcal: number;
    score: number;
  };
  sleep: {
    hours: number;
    efficiency: number;
    deepSleepScore: number;
    score: number;
  };
  hrv: {
    value: number;
    reliability: "green" | "amber" | "red";
    score: number;
  };
  condition: {
    score: number;
    label: string;
    weights: {
      activity: number;
      sleep: number;
      hrv: number;
    };
  };
  ai: {
    advice: string;
    cached: boolean;
  };
}
