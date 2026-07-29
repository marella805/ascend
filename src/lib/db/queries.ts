import { getClient, USER_ID } from './index';
import { getLevelInfo, computeBaseline, COHORT_PRIORS, calcXP, calcStrengthWorkload, calcEnduranceWorkload, calcMobilityWorkload, processStreakForDay, computeStrengthAttribute, computeEnduranceAttribute, computeMobilityAttribute, computeConsistencyAttribute, calcNextTarget } from '../game/engine';
import { type TemplateKey, getNextTemplate } from '../templates';
import type { Row } from '@libsql/client';

type DBRow = Row;

// ── Character Sheet ──────────────────────────────────────────────────────────

export async function getCharacterSheet() {
  const client = getClient();

  const userResult = await client.execute({ sql: 'SELECT display_name FROM app_user WHERE id=?', args: [USER_ID] });
  const user = userResult.rows[0] ?? null;
  if (!user) return null;

  const xpResult = await client.execute({ sql: 'SELECT COALESCE(SUM(amount),0) AS total FROM xp_ledger WHERE user_id=?', args: [USER_ID] });
  const xpRow = xpResult.rows[0];
  const totalXp = Number(xpRow?.total ?? 0);
  const levelInfo = getLevelInfo(totalXp);

  const attrResult = await client.execute({ sql: 'SELECT attribute, value FROM attribute_state WHERE user_id=?', args: [USER_ID] });
  const attrRows = attrResult.rows;
  const attrMap: Record<string, number> = { str: 0, end: 0, mob: 0, con: 0 };
  for (const row of attrRows) attrMap[String(row.attribute)] = Number(row.value);

  const streakResult = await client.execute({ sql: 'SELECT current_length, rest_tokens FROM streak_state WHERE user_id=?', args: [USER_ID] });
  const streak = (streakResult.rows[0] ?? null) ?? { current_length: 0, rest_tokens: 0 };

  const questResult = await client.execute({
    sql: `SELECT qa.id, qd.template_key, qa.current_val, qa.target_val, qd.xp_reward, qd.params
          FROM quest_assignment qa JOIN quest_definition qd ON qd.id=qa.definition_id
          WHERE qa.user_id=? AND qa.completed=0 AND qd.kind='weekly' LIMIT 1`,
    args: [USER_ID],
  });
  const questRow: DBRow | null = questResult.rows[0] ?? null;

  let todayQuest = null;
  if (questRow) {
    const params = JSON.parse(String(questRow.params));
    todayQuest = {
      id: String(questRow.id),
      name: buildQuestName(String(questRow.template_key), params),
      current: Number(questRow.current_val),
      target: Number(questRow.target_val),
      xpReward: Number(questRow.xp_reward),
    };
  }

  const seasonResult = await client.execute(`SELECT ordinal, starts_at FROM season WHERE state='active' LIMIT 1`);
  const seasonRow: DBRow | null = seasonResult.rows[0] ?? null;
  let season = { ordinal: 1, week: 1 };
  if (seasonRow) {
    const start = new Date(String(seasonRow.starts_at));
    const weekNum = Math.min(12, Math.floor((Date.now() - start.getTime()) / (7 * 86400000)) + 1);
    season = { ordinal: Number(seasonRow.ordinal), week: weekNum };
  }

  return {
    user: { displayName: String(user.display_name) },
    level: levelInfo,
    attributes: { str: attrMap.str, end: attrMap.end, mob: attrMap.mob, con: attrMap.con },
    streak: { length: Number(streak.current_length), restTokens: Number(streak.rest_tokens) },
    todayQuest,
    season,
  };
}

// ── Exercises ─────────────────────────────────────────────────────────────────

export async function getExercises(modality?: string): Promise<DBRow[]> {
  const client = getClient();
  if (modality) {
    const result = await client.execute({
      sql: 'SELECT id, slug, name, modality, movement_pattern, is_compound, default_unit FROM exercise WHERE modality=? AND active=1 ORDER BY is_compound DESC, name',
      args: [modality],
    });
    return result.rows;
  }
  const result = await client.execute(
    'SELECT id, slug, name, modality, movement_pattern, is_compound, default_unit FROM exercise WHERE active=1 ORDER BY modality, is_compound DESC, name'
  );
  return result.rows;
}

export async function getExerciseById(id: string): Promise<DBRow | null> {
  const client = getClient();
  const result = await client.execute({
    sql: 'SELECT id, slug, name, modality, movement_pattern, is_compound, default_unit FROM exercise WHERE id=?',
    args: [id],
  });
  return result.rows[0] ?? null;
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function createSession(opts: { id: string; modality: string; startedAt: string; localDate: string }): Promise<void> {
  const client = getClient();
  await client.execute({
    sql: `INSERT INTO workout_session (id, user_id, modality, started_at, local_date, state) VALUES (?,?,?,?,?,'open')`,
    args: [opts.id, USER_ID, opts.modality, opts.startedAt, opts.localDate],
  });
}

export async function addSet(opts: {
  id: string; sessionId: string; exerciseId: string; setIndex: number;
  weightKg?: number; reps?: number; durationS?: number; distanceM?: number; rpe?: number; isWarmup?: boolean;
}): Promise<void> {
  const client = getClient();
  await client.execute({
    sql: `INSERT OR REPLACE INTO session_set
      (id, session_id, exercise_id, set_index, weight_kg, reps, duration_s, distance_m, rpe, is_warmup, logged_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
    args: [
      opts.id, opts.sessionId, opts.exerciseId, opts.setIndex,
      opts.weightKg ?? null, opts.reps ?? null,
      opts.durationS ?? null, opts.distanceM ?? null,
      opts.rpe ?? null, opts.isWarmup ? 1 : 0,
    ],
  });
}

// ── Personal Records ─────────────────────────────────────────────────────────

export async function getPRs(): Promise<PR[]> {
  const client = getClient();
  const result = await client.execute({
    sql: `SELECT ss.exercise_id, e.name,
                 MAX(ss.weight_kg) as max_kg,
                 ws.local_date
          FROM session_set ss
          JOIN workout_session ws ON ws.id = ss.session_id
          JOIN exercise e ON e.id = ss.exercise_id
          WHERE ws.user_id = ? AND ws.state = 'finished' AND ss.is_warmup = 0
            AND ss.weight_kg IS NOT NULL AND ss.reps IS NOT NULL AND ss.weight_kg > 0
          GROUP BY ss.exercise_id
          ORDER BY max_kg DESC`,
    args: [USER_ID],
  });
  const rows = result.rows;

  return Promise.all(rows.map(async r => {
    const repResult = await client.execute({
      sql: `SELECT ss.reps FROM session_set ss JOIN workout_session ws ON ws.id = ss.session_id
            WHERE ss.exercise_id = ? AND ss.weight_kg = ? AND ws.user_id = ? AND ss.is_warmup = 0
            ORDER BY ws.finished_at DESC LIMIT 1`,
      args: [String(r.exercise_id), Number(r.max_kg), USER_ID],
    });
    const repRow: DBRow | null = repResult.rows[0] ?? null;
    return {
      exerciseId: String(r.exercise_id),
      name: String(r.name),
      weightLb: Math.round(Number(r.max_kg) * 2.20462 * 10) / 10,
      reps: Number(repRow?.reps ?? 1),
      date: String(r.local_date),
    };
  }));
}

// ── Last-session best set for an exercise (for progression hint) ──────────────

export async function getLastBestSet(exerciseId: string): Promise<{ weightKg: number; reps: number; nextWeightLb: number; nextReps: number } | null> {
  const client = getClient();

  const sessionResult = await client.execute({
    sql: `SELECT ws.id FROM workout_session ws
          JOIN session_set ss ON ss.session_id = ws.id
          WHERE ws.user_id = ? AND ss.exercise_id = ? AND ws.state = 'finished' AND ss.is_warmup = 0
          ORDER BY ws.finished_at DESC LIMIT 1`,
    args: [USER_ID, exerciseId],
  });
  const sessionRow: DBRow | null = sessionResult.rows[0] ?? null;

  if (!sessionRow) return null;

  const setResult = await client.execute({
    sql: `SELECT weight_kg, reps FROM session_set
          WHERE session_id = ? AND exercise_id = ? AND is_warmup = 0 AND weight_kg IS NOT NULL
          ORDER BY weight_kg DESC LIMIT 1`,
    args: [String(sessionRow.id), exerciseId],
  });
  const setRow: DBRow | null = setResult.rows[0] ?? null;

  if (!setRow || !setRow.weight_kg || !setRow.reps) return null;

  const wKg = Number(setRow.weight_kg);
  const reps = Number(setRow.reps);
  const next = calcNextTarget(wKg, reps);
  return {
    weightKg: wKg,
    reps,
    nextWeightLb: Math.round(next.weightKg * 2.20462 * 10) / 10,
    nextReps: next.targetReps,
  };
}

// ── Workout Templates / Rotation ──────────────────────────────────────────────

export async function getTemplateState(): Promise<{ lastTemplate: TemplateKey | null; nextTemplate: TemplateKey | null }> {
  const client = getClient();
  const result = await client.execute({ sql: 'SELECT value FROM key_value WHERE user_id=? AND key=?', args: [USER_ID, 'last_template'] });
  const row: DBRow | null = result.rows[0] ?? null;
  const last = row ? (String(row.value) as TemplateKey) : null;
  const next = last ? getNextTemplate(last).key : null;
  return { lastTemplate: last, nextTemplate: next };
}

export async function saveTemplateState(templateKey: TemplateKey): Promise<void> {
  const client = getClient();
  await client.execute({
    sql: `INSERT OR REPLACE INTO key_value (user_id, key, value, updated_at) VALUES (?,?,?,datetime('now'))`,
    args: [USER_ID, 'last_template', templateKey],
  });
}

async function getSessionWithSets(sessionId: string) {
  const client = getClient();
  const sessionResult = await client.execute({ sql: 'SELECT * FROM workout_session WHERE id=? AND user_id=?', args: [sessionId, USER_ID] });
  const session: DBRow | null = sessionResult.rows[0] ?? null;
  if (!session) return null;
  const setsResult = await client.execute({
    sql: `SELECT ss.*, e.name as exercise_name, e.modality, e.movement_pattern, e.default_unit
          FROM session_set ss JOIN exercise e ON e.id=ss.exercise_id
          WHERE ss.session_id=? ORDER BY ss.exercise_id, ss.set_index`,
    args: [sessionId],
  });
  const sets = setsResult.rows;
  return { session, sets };
}

// ── Reward computation ────────────────────────────────────────────────────────

export type NextTarget = {
  exerciseId: string;
  exerciseName: string;
  lastWeightLb: number;
  lastReps: number;
  nextWeightLb: number;
  nextReps: number;
};

export type PR = {
  exerciseId: string;
  name: string;
  weightLb: number;
  reps: number;
  date: string;
};

export type RewardEnvelope = {
  xpEarned: number; sessionXp: number; questXp: number; totalXp: number;
  prevLevel: number; newLevel: number; leveledUp: boolean;
  levelInfo: ReturnType<typeof getLevelInfo>;
  baselineRatio: number;
  attrDeltas: { str: number; end: number; mob: number; con: number };
  streak: { length: number; restTokens: number };
  questsCompleted: number;
  badges: Array<{ slug: string; name: string; rarity: string }>;
  sessionId: string;
  nextTargets: NextTarget[];
};

export async function finishSession(sessionId: string, localDate: string): Promise<RewardEnvelope> {
  const client = getClient();
  const data = await getSessionWithSets(sessionId);
  if (!data) throw new Error('Session not found');

  const { session, sets } = data;
  const modality = String(session.modality);
  const now = new Date().toISOString();
  const startedAt = new Date(String(session.started_at));
  const durationS = Math.round((Date.now() - startedAt.getTime()) / 1000);

  await client.execute({
    sql: `UPDATE workout_session SET state='finished', finished_at=?, ended_at=?, duration_s=? WHERE id=?`,
    args: [now, now, durationS, sessionId],
  });

  // Get baseline
  const blResult = await client.execute({ sql: 'SELECT median_workload, sample_count FROM baseline_state WHERE user_id=? AND modality=?', args: [USER_ID, modality] });
  const blRow: DBRow | null = blResult.rows[0] ?? null;
  const observedMedian = blRow ? Number(blRow.median_workload) : 0;
  const sampleCount = blRow ? Number(blRow.sample_count) : 0;
  const baselineWorkload = computeBaseline(observedMedian, sampleCount, COHORT_PRIORS[modality] ?? 100);

  // Compute session workload
  let sessionWorkload = 0;
  if (modality === 'strength') {
    sessionWorkload = calcStrengthWorkload(sets.map(s => ({
      weightKg: Number(s.weight_kg ?? 0),
      reps: Number(s.reps ?? 0),
      isWarmup: Boolean(s.is_warmup),
    })));
  } else if (modality === 'endurance') {
    const totalDistM = sets.reduce((sum, s) => sum + Number(s.distance_m ?? 0), 0);
    sessionWorkload = calcEnduranceWorkload(totalDistM, durationS);
  } else {
    sessionWorkload = calcMobilityWorkload(durationS / 60);
  }

  // Update baseline
  const countResult = await client.execute({
    sql: `SELECT COUNT(*) as cnt FROM workout_session WHERE user_id=? AND modality=? AND state='finished' AND finished_at >= datetime('now','-28 days')`,
    args: [USER_ID, modality],
  });
  const countRow = countResult.rows[0];
  await client.execute({
    sql: `INSERT OR REPLACE INTO baseline_state (user_id, modality, median_workload, sample_count, computed_at) VALUES (?,?,?,?,datetime('now'))`,
    args: [USER_ID, modality, sessionWorkload, Number(countRow?.cnt ?? 0)],
  });

  // Streak
  const stResult = await client.execute({ sql: 'SELECT current_length, longest_length, last_active_date, rest_tokens, tokens_earned_at_len FROM streak_state WHERE user_id=?', args: [USER_ID] });
  const stRow = stResult.rows[0] ?? { current_length: 0, longest_length: 0, last_active_date: null, rest_tokens: 0, tokens_earned_at_len: 0 };

  const newStreak = processStreakForDay(
    {
      currentLength: Number(stRow.current_length),
      longestLength: Number(stRow.longest_length),
      lastActiveDate: stRow.last_active_date ? String(stRow.last_active_date) : null,
      restTokens: Number(stRow.rest_tokens),
      tokensEarnedAtLen: Number(stRow.tokens_earned_at_len),
    },
    localDate, true
  );

  // Active quests
  const qResult = await client.execute({
    sql: `SELECT qa.id, qd.template_key, qd.params, qa.current_val, qa.target_val, qd.xp_reward
          FROM quest_assignment qa JOIN quest_definition qd ON qd.id=qa.definition_id
          WHERE qa.user_id=? AND qa.completed=0 AND qd.kind='weekly'`,
    args: [USER_ID],
  });
  const qRows = qResult.rows;

  let questMultiplier = 1;
  const questUpdates: Array<{ id: string; newVal: number; completed: boolean; xpReward: number }> = [];

  for (const row of qRows) {
    const params = JSON.parse(String(row.params));
    const key = String(row.template_key);
    let increment = false;
    if (key === 'strength_sessions' && modality === 'strength') increment = true;
    if (key === 'endurance_sessions' && modality === 'endurance') increment = true;
    if (key === 'mobility_sessions' && modality === 'mobility') increment = true;
    if (key === 'pull_sessions' && sets.some(s => s.movement_pattern === 'vertical_pull')) increment = true;
    if (key === 'hinge_sessions' && sets.some(s => s.movement_pattern === 'hinge')) increment = true;

    if (increment) {
      const newVal = Math.min(Number(row.target_val), Number(row.current_val) + 1);
      const completed = newVal >= Number(row.target_val);
      if (completed) questMultiplier = 1.2;
      questUpdates.push({ id: String(row.id), newVal, completed, xpReward: Number(row.xp_reward) });
    }
  }

  const xp = calcXP({
    modality, sessionWorkload, baselineWorkload,
    durationMinutes: durationS / 60,
    streakLength: newStreak.currentLength,
    questMultiplier,
  });

  const baselineRatio = baselineWorkload > 0 ? sessionWorkload / baselineWorkload : 1;

  // Get XP before this session
  const prevXpResult = await client.execute({ sql: 'SELECT COALESCE(SUM(amount),0) as total FROM xp_ledger WHERE user_id=?', args: [USER_ID] });
  const prevXpRow = prevXpResult.rows[0];
  const prevTotalXp = Number(prevXpRow?.total ?? 0);

  const prevLevel = getLevelInfo(prevTotalXp);

  // Write XP ledger
  await client.execute({
    sql: `INSERT OR IGNORE INTO xp_ledger (user_id, amount, reason, source_id, local_date) VALUES (?,?,'session',?,?)`,
    args: [USER_ID, xp, sessionId, localDate],
  });

  // Update quests and award quest XP
  let questXp = 0;
  for (const qu of questUpdates) {
    await client.execute({
      sql: `UPDATE quest_assignment SET current_val=?, completed=? WHERE id=?`,
      args: [qu.newVal, qu.completed ? 1 : 0, qu.id],
    });
    if (qu.completed) {
      await client.execute({
        sql: `INSERT OR IGNORE INTO xp_ledger (user_id, amount, reason, source_id, local_date) VALUES (?,?,'quest',?,?)`,
        args: [USER_ID, qu.xpReward, qu.id, localDate],
      });
      questXp += qu.xpReward;
    }
  }

  const newTotalXp = prevTotalXp + xp + questXp;
  const newLevel = getLevelInfo(newTotalXp);

  // Update streak
  await client.execute({
    sql: `INSERT OR REPLACE INTO streak_state (user_id, current_length, longest_length, last_active_date, rest_tokens, tokens_earned_at_len, updated_at)
          VALUES (?,?,?,?,?,?,datetime('now'))`,
    args: [USER_ID, newStreak.currentLength, newStreak.longestLength, newStreak.lastActiveDate,
           newStreak.restTokens, newStreak.tokensEarnedAtLen],
  });

  // Recompute attributes
  const attrDeltas = await recomputeAttributes();

  // Check badges
  const badges = await checkBadges(sessionId, newStreak.currentLength);

  // Compute next-session targets for strength exercises
  const nextTargets: NextTarget[] = [];
  if (modality === 'strength') {
    const seenExercises = new Set<string>();
    for (const s of sets) {
      const eid = String(s.exercise_id);
      if (seenExercises.has(eid) || s.is_warmup || !s.weight_kg || !s.reps) continue;
      // Find the best working set for this exercise in this session
      const bestSet = sets
        .filter(x => x.exercise_id === eid && !x.is_warmup && x.weight_kg && x.reps)
        .sort((a, b) => Number(b.weight_kg) - Number(a.weight_kg))[0];
      if (bestSet) {
        seenExercises.add(eid);
        const wKg = Number(bestSet.weight_kg);
        const reps = Number(bestSet.reps);
        const next = calcNextTarget(wKg, reps);
        nextTargets.push({
          exerciseId: eid,
          exerciseName: String(s.exercise_name),
          lastWeightLb: Math.round(wKg * 2.20462 * 10) / 10,
          lastReps: reps,
          nextWeightLb: Math.round(next.weightKg * 2.20462 * 10) / 10,
          nextReps: next.targetReps,
        });
      }
    }
  }

  return {
    xpEarned: xp + questXp, sessionXp: xp, questXp, totalXp: newTotalXp,
    prevLevel: prevLevel.level, newLevel: newLevel.level, leveledUp: newLevel.level > prevLevel.level,
    levelInfo: newLevel, baselineRatio, attrDeltas,
    streak: { length: newStreak.currentLength, restTokens: newStreak.restTokens },
    questsCompleted: questUpdates.filter(q => q.completed).length,
    badges, sessionId, nextTargets,
  };
}

async function recomputeAttributes(): Promise<{ str: number; end: number; mob: number; con: number }> {
  const client = getClient();

  const strResult = await client.execute({
    sql: `SELECT COALESCE(SUM(ss.weight_kg*ss.reps),0) as vol
          FROM session_set ss JOIN workout_session ws ON ws.id=ss.session_id
          WHERE ws.user_id=? AND ws.modality='strength' AND ws.state='finished'
          AND ws.finished_at >= datetime('now','-56 days') AND ss.is_warmup=0`,
    args: [USER_ID],
  });
  const strRow = strResult.rows[0];

  const strPeakResult = await client.execute({
    sql: `SELECT MAX(weekly_vol) as peak FROM (
            SELECT SUM(ss.weight_kg*ss.reps) as weekly_vol
            FROM session_set ss JOIN workout_session ws ON ws.id=ss.session_id
            WHERE ws.user_id=? AND ws.modality='strength' AND ws.state='finished' AND ss.is_warmup=0
            GROUP BY strftime('%Y-%W', ws.finished_at)
          )`,
    args: [USER_ID],
  });
  const strPeakRow = strPeakResult.rows[0];
  const recentStr = Number(strRow?.vol ?? 0);
  const peakStr = Math.max(Number(strPeakRow?.peak ?? 0), recentStr, 1);

  const endResult = await client.execute({
    sql: `SELECT COALESCE(SUM(duration_s),0)/60.0 as mins FROM workout_session WHERE user_id=? AND modality='endurance' AND state='finished' AND finished_at >= datetime('now','-56 days')`,
    args: [USER_ID],
  });
  const endRow = endResult.rows[0];

  const endPeakResult = await client.execute({
    sql: `SELECT COALESCE(MAX(weekly_mins),0) as peak FROM (SELECT SUM(duration_s)/60.0 as weekly_mins FROM workout_session WHERE user_id=? AND modality='endurance' AND state='finished' GROUP BY strftime('%Y-%W', finished_at))`,
    args: [USER_ID],
  });
  const endPeakRow = endPeakResult.rows[0];
  const recentEnd = Number(endRow?.mins ?? 0);
  const peakEnd = Math.max(Number(endPeakRow?.peak ?? 0), recentEnd, 1);

  const mobResult = await client.execute({
    sql: `SELECT COALESCE(SUM(duration_s),0)/60.0 as mins FROM workout_session WHERE user_id=? AND modality='mobility' AND state='finished' AND finished_at >= datetime('now','-28 days')`,
    args: [USER_ID],
  });
  const mobRow = mobResult.rows[0];
  const mobMins = Number(mobRow?.mins ?? 0);

  const conResult = await client.execute({
    sql: `SELECT COUNT(*) as cnt FROM workout_session WHERE user_id=? AND state='finished' AND finished_at >= datetime('now','-56 days')`,
    args: [USER_ID],
  });
  const conRow = conResult.rows[0];

  const targetResult = await client.execute({ sql: 'SELECT weekly_target FROM app_user WHERE id=?', args: [USER_ID] });
  const targetRow = targetResult.rows[0] ?? null;

  const str = computeStrengthAttribute(recentStr, peakStr);
  const end = computeEnduranceAttribute(recentEnd, peakEnd);
  const mob = computeMobilityAttribute(mobMins);
  const con = computeConsistencyAttribute(Number(conRow?.cnt ?? 0), Number(targetRow?.weekly_target ?? 4), 8);

  const prevAttrResult = await client.execute({ sql: 'SELECT attribute, value FROM attribute_state WHERE user_id=?', args: [USER_ID] });
  const prevAttrRows = prevAttrResult.rows;
  const prev: Record<string, number> = { str: 0, end: 0, mob: 0, con: 0 };
  for (const r of prevAttrRows) prev[String(r.attribute)] = Number(r.value);

  for (const [attr, value] of [['str', str], ['end', end], ['mob', mob], ['con', con]] as const) {
    const peakResult = await client.execute({ sql: 'SELECT COALESCE(peak_value,0) as pk FROM attribute_state WHERE user_id=? AND attribute=?', args: [USER_ID, attr] });
    const peakRow: DBRow | null = peakResult.rows[0] ?? null;
    await client.execute({
      sql: `INSERT OR REPLACE INTO attribute_state (user_id, attribute, value, peak_value, computed_at) VALUES (?,?,?,?,datetime('now'))`,
      args: [USER_ID, attr, value, Math.max(value, Number(peakRow?.pk ?? 0))],
    });
  }

  return { str: str - prev.str, end: end - prev.end, mob: mob - prev.mob, con: con - prev.con };
}

async function checkBadges(sessionId: string, streakLength: number): Promise<Array<{ slug: string; name: string; rarity: string }>> {
  const client = getClient();
  const cntResult = await client.execute({ sql: `SELECT COUNT(*) as cnt FROM workout_session WHERE user_id=? AND state='finished'`, args: [USER_ID] });
  const totalSessions = Number(cntResult.rows[0]?.cnt ?? 0);
  const unlocked: Array<{ slug: string; name: string; rarity: string }> = [];

  const candidates = [
    { slug: 'first-session', condition: totalSessions === 1 },
    { slug: 'week-streak', condition: streakLength >= 7 },
    { slug: 'month-streak', condition: streakLength >= 30 },
  ];

  for (const c of candidates) {
    if (!c.condition) continue;
    const defResult = await client.execute({ sql: 'SELECT id, name, rarity FROM badge_definition WHERE slug=?', args: [c.slug] });
    const def: DBRow | null = defResult.rows[0] ?? null;
    if (!def) continue;
    const existingResult = await client.execute({ sql: 'SELECT id FROM badge_unlock WHERE user_id=? AND badge_id=?', args: [USER_ID, def.id] });
    const existing = existingResult.rows[0];
    if (existing) continue;
    await client.execute({ sql: 'INSERT INTO badge_unlock (user_id, badge_id, session_id) VALUES (?,?,?)', args: [USER_ID, def.id, sessionId] });
    unlocked.push({ slug: c.slug, name: String(def.name), rarity: String(def.rarity) });
  }
  return unlocked;
}

// ── History ────────────────────────────────────────────────────────────────────

export async function getHistory() {
  const client = getClient();
  const result = await client.execute({
    sql: `SELECT ws.id, ws.local_date, ws.modality, ws.duration_s, ws.title,
                 (SELECT COUNT(*) FROM session_set ss WHERE ss.session_id=ws.id) as set_count
          FROM workout_session ws WHERE ws.user_id=? AND ws.state='finished'
          ORDER BY ws.local_date DESC LIMIT 100`,
    args: [USER_ID],
  });
  return { sessions: result.rows };
}

// ── Quests ─────────────────────────────────────────────────────────────────────

export async function getQuests() {
  const client = getClient();
  const result = await client.execute({
    sql: `SELECT qa.id, qa.current_val, qa.target_val, qa.completed, qa.week_start,
                 qd.kind, qd.template_key, qd.xp_reward, qd.params
          FROM quest_assignment qa JOIN quest_definition qd ON qd.id=qa.definition_id
          WHERE qa.user_id=? ORDER BY qd.kind, qa.completed`,
    args: [USER_ID],
  });

  return result.rows.map(row => {
    const params = JSON.parse(String(row.params));
    return {
      id: String(row.id),
      name: buildQuestName(String(row.template_key), params),
      kind: String(row.kind),
      current: Number(row.current_val),
      target: Number(row.target_val),
      completed: Boolean(row.completed),
      xpReward: Number(row.xp_reward),
    };
  });
}

function buildQuestName(key: string, params: Record<string, unknown>): string {
  switch (key) {
    case 'strength_sessions': return `${params.count} strength session${Number(params.count) > 1 ? 's' : ''}`;
    case 'endurance_sessions': return `${params.count} cardio session${Number(params.count) > 1 ? 's' : ''}`;
    case 'mobility_sessions': return `${params.count} mobility session${Number(params.count) > 1 ? 's' : ''}`;
    case 'pull_sessions': return 'Include a pulling movement';
    case 'hinge_sessions': return 'Include a hinge movement';
    case 'strength_50': return 'Reach STR 50';
    default: return key;
  }
}
