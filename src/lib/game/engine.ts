// ASCEND Game Engine — implements all formulas from PRD section 6

// Double-progression formula for strength exercises (8–12 rep range)
// Input / output stay in kg; callers convert to lb for display
export function calcNextTarget(weightKg: number, lastReps: number): { weightKg: number; targetReps: number } {
  if (lastReps >= 12) {
    // Hit top of range → increase weight ~5%, drop to 8 reps
    // Round to nearest 2.5 lb (≈1.134 kg) for nice plate math
    const weightLb = weightKg * 2.20462;
    const newWeightLb = Math.round(weightLb * 1.05 / 2.5) * 2.5;
    return { weightKg: newWeightLb / 2.20462, targetReps: 8 };
  } else if (lastReps >= 8) {
    // In range → same weight, add one rep
    return { weightKg, targetReps: lastReps + 1 };
  } else {
    // Below range → same weight, aim for the bottom of range
    return { weightKg, targetReps: 8 };
  }
}

const BASE_XP: Record<string, number> = {
  strength: 350,
  endurance: 260,
  mobility: 180,
};

const REFERENCE_DURATION: Record<string, number> = {
  strength: 45,
  endurance: 30,
  mobility: 30,
};

// PRD 6.3: XP calculation
export function calcXP(opts: {
  modality: string;
  sessionWorkload: number;
  baselineWorkload: number;
  durationMinutes: number;
  streakLength: number;
  questMultiplier?: number;
}): number {
  const { modality, sessionWorkload, baselineWorkload, durationMinutes, streakLength, questMultiplier = 1 } = opts;

  const ratio = baselineWorkload > 0 ? sessionWorkload / baselineWorkload : 1.0;
  const performance = Math.min(1.80, Math.max(0.40, 1 + 0.6 * Math.log2(Math.max(ratio, 0.25))));

  const refDur = REFERENCE_DURATION[modality] ?? 45;
  const durationFactor = Math.min(1.5, durationMinutes / refDur);

  // streak_multiplier: 1.00 at streak=0, 1.15 at streak>=14
  const streakMultiplier = 1 + Math.min(14, streakLength) * (0.15 / 14);

  const base = BASE_XP[modality] ?? 150;
  const xp = Math.round(base * durationFactor * performance * questMultiplier * streakMultiplier);

  // Daily cap enforced at the API layer; session cap: max 1800 XP
  return Math.min(1800, xp);
}

// PRD 6.4: Level calculation
// Level N requires cumulative XP of round(300 * N^1.4 / 10) * 10
// Level 1 starts at 0 XP total.
function cumulativeXpForLevel(n: number): number {
  if (n <= 1) return 0;
  return Math.round(300 * Math.pow(n - 1, 1.4) / 10) * 10;
}

export function getLevelInfo(totalXp: number): {
  level: number;
  levelXp: number;
  levelXpRequired: number;
  xpToNext: number;
} {
  let level = 1;
  while (cumulativeXpForLevel(level + 1) <= totalXp) {
    level++;
    if (level > 999) break;
  }
  const floorXp = cumulativeXpForLevel(level);
  const ceilXp = cumulativeXpForLevel(level + 1);
  const levelXpRequired = ceilXp - floorXp;
  const levelXp = totalXp - floorXp;
  return { level, levelXp, levelXpRequired, xpToNext: levelXpRequired - levelXp };
}

// PRD 6.2: Workload calculation per modality
export function calcStrengthWorkload(sets: { weightKg: number; reps: number; isWarmup: boolean }[]): number {
  const workingSets = sets.filter(s => !s.isWarmup);
  if (workingSets.length === 0) return 0;
  const topWeight = Math.max(...workingSets.map(s => s.weightKg));
  // Exclude sets below 60% of top set weight
  return workingSets
    .filter(s => s.weightKg >= topWeight * 0.6)
    .reduce((sum, s) => sum + s.weightKg * s.reps, 0);
}

export function calcEnduranceWorkload(distanceM: number, durationS: number): number {
  if (durationS <= 0 || distanceM <= 0) return durationS / 60;
  const actualPace = durationS / distanceM; // s/m
  const referencePace = 6 * 60 / 1000; // 6 min/km in s/m
  const paceFactor = Math.pow(referencePace / actualPace, 1.5);
  return distanceM * paceFactor;
}

export function calcMobilityWorkload(durationMinutes: number): number {
  return durationMinutes;
}

// PRD 6.1: Attribute computation (simplified — scales 0-100 from user's own history)
export function computeStrengthAttribute(
  recentTonnage: number,   // kg total volume over last 8 weeks
  peakTonnage: number      // user's peak 8-week tonnage
): number {
  if (peakTonnage <= 0) return 0;
  return Math.min(100, Math.round((recentTonnage / peakTonnage) * 85 + 5));
}

export function computeEnduranceAttribute(
  recentWorkload: number,
  peakWorkload: number
): number {
  if (peakWorkload <= 0) return 0;
  return Math.min(100, Math.round((recentWorkload / peakWorkload) * 85 + 5));
}

export function computeMobilityAttribute(
  mobilityMinutesLast4Weeks: number
): number {
  // Target: 4 sessions/week × 30 min = 480 min/4wk for score ~80
  const target = 480;
  return Math.min(100, Math.round((mobilityMinutesLast4Weeks / target) * 80));
}

export function computeConsistencyAttribute(
  sessionsCompleted: number,
  weeklyTarget: number,
  weeksBack: number = 8
): number {
  const targetTotal = weeklyTarget * weeksBack;
  if (targetTotal <= 0) return 50;
  return Math.min(100, Math.round((sessionsCompleted / targetTotal) * 100));
}

// PRD 6.5: Streak management
export function processStreakForDay(streak: {
  currentLength: number;
  longestLength: number;
  lastActiveDate: string | null;
  restTokens: number;
  tokensEarnedAtLen: number;
}, todayDateStr: string, hadSession: boolean): {
  currentLength: number;
  longestLength: number;
  lastActiveDate: string | null;
  restTokens: number;
  tokensEarnedAtLen: number;
  tokenConsumed: boolean;
  streakReset: boolean;
} {
  const today = new Date(todayDateStr);
  const last = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;

  const daysDiff = last
    ? Math.round((today.getTime() - last.getTime()) / 86400000)
    : null;

  let { currentLength, longestLength, restTokens, tokensEarnedAtLen } = streak;
  let tokenConsumed = false;
  let streakReset = false;

  if (hadSession) {
    if (daysDiff === null || daysDiff === 0) {
      // same day or first session — no change to length yet
    } else if (daysDiff === 1) {
      currentLength += 1;
    } else {
      // gap > 1 day; each missing day between last and today may consume a token
      const gapDays = daysDiff - 1;
      if (restTokens >= gapDays) {
        restTokens -= gapDays;
        tokenConsumed = true;
        currentLength += 1;
      } else {
        streakReset = true;
        currentLength = 1;
        restTokens = Math.max(0, restTokens - gapDays);
      }
    }
    longestLength = Math.max(longestLength, currentLength);

    // Accrue a token every 7 consecutive active days
    const newMilestone = Math.floor(currentLength / 7) * 7;
    if (newMilestone > tokensEarnedAtLen && restTokens < 3) {
      restTokens = Math.min(3, restTokens + 1);
      tokensEarnedAtLen = newMilestone;
    }

    return { currentLength, longestLength, lastActiveDate: todayDateStr, restTokens, tokensEarnedAtLen, tokenConsumed, streakReset };
  } else {
    // rest day
    if (daysDiff === 1) {
      if (restTokens > 0) {
        restTokens -= 1;
        tokenConsumed = true;
      } else {
        streakReset = true;
        currentLength = 0;
      }
    } else if (daysDiff !== null && daysDiff > 1) {
      streakReset = true;
      currentLength = 0;
    }
    return { currentLength, longestLength, lastActiveDate: streak.lastActiveDate, restTokens, tokensEarnedAtLen, tokenConsumed, streakReset };
  }
}

// PRD 6.2: Empirical Bayes baseline (warm-up blending)
export function computeBaseline(observedMedian: number, sampleCount: number, cohortPrior: number): number {
  const weight = sampleCount / (sampleCount + 5);
  return weight * observedMedian + (1 - weight) * cohortPrior;
}

// Cohort priors (approximate median values)
export const COHORT_PRIORS: Record<string, number> = {
  strength: 5000,   // kg total volume
  endurance: 500,   // workload units
  mobility: 30,     // minutes
};
