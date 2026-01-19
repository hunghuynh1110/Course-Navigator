import { z } from "zod";

const MAX_SCORE = 100;

export const scoreSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/)
  .transform(Number);

export const convertScore = (score: string): number | null => {
  if (score === "") return null;

  // Handle fraction case like "20/20" or "100/100"
  if (score.includes("/")) {
    const parts = score.split("/");
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return Math.min(
          Math.max((numerator / denominator) * 100, 0),
          MAX_SCORE
        );
      }
    }
  }
  if (score.includes("%")) {
    const numericPart = parseFloat(score.replace("%", ""));
    if (!isNaN(numericPart)) {
      return Math.min(Math.max(numericPart, 0), MAX_SCORE);
    }
  }

  const result = scoreSchema.safeParse(score);
  if (!result.success) return null;

  return Math.min(Math.max(result.data, 0), MAX_SCORE);
};

export const calculateStats = (
  scores: Record<string, { score: number | null; weight: number }>
) => {
  let totalScore = 0;
  let completedWeight = 0;

  Object.values(scores).forEach((item) => {
    if (item.score !== null) {
      totalScore += item.score * item.weight;
      completedWeight += item.weight;
    }
  });

  return {
    totalScore: parseFloat(totalScore.toFixed(2)),
    completedWeight,
  };
};

export const processWeight = (weight: number) => {
  return weight === 0 ? "Pass/Fail" : `${Math.round(weight * 100)}%`;
};
