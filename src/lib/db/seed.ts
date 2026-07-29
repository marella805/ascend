import type { Client } from '@libsql/client';

const EXERCISES = [
  { slug: 'barbell-back-squat', name: 'Barbell Back Squat', modality: 'strength', movement_pattern: 'squat', is_compound: 1, default_unit: 'lb' },
  { slug: 'barbell-front-squat', name: 'Barbell Front Squat', modality: 'strength', movement_pattern: 'squat', is_compound: 1, default_unit: 'lb' },
  { slug: 'goblet-squat', name: 'Goblet Squat', modality: 'strength', movement_pattern: 'squat', is_compound: 1, default_unit: 'lb' },
  { slug: 'barbell-deadlift', name: 'Barbell Deadlift', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'romanian-deadlift', name: 'Romanian Deadlift', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'sumo-deadlift', name: 'Sumo Deadlift', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'hex-bar-deadlift', name: 'Hex Bar Deadlift', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'barbell-bench-press', name: 'Barbell Bench Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'incline-bench-press', name: 'Incline Bench Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'barbell-overhead-press', name: 'Barbell Overhead Press', modality: 'strength', movement_pattern: 'vertical_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', modality: 'strength', movement_pattern: 'vertical_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'pull-up', name: 'Pull-up', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'chin-up', name: 'Chin-up', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'lat-pulldown', name: 'Lat Pulldown', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 0, default_unit: 'lb' },
  { slug: 'barbell-row', name: 'Barbell Row', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'dumbbell-row', name: 'Dumbbell Row', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 0, default_unit: 'lb' },
  { slug: 'cable-row', name: 'Cable Row', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 0, default_unit: 'lb' },
  { slug: 'dip', name: 'Dip', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'hip-thrust', name: 'Hip Thrust', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'leg-press', name: 'Leg Press', modality: 'strength', movement_pattern: 'squat', is_compound: 0, default_unit: 'lb' },
  { slug: 'walking-lunge', name: 'Walking Lunge', modality: 'strength', movement_pattern: 'lunge', is_compound: 1, default_unit: 'lb' },
  { slug: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', modality: 'strength', movement_pattern: 'lunge', is_compound: 1, default_unit: 'lb' },
  { slug: 'barbell-curl', name: 'Barbell Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'dumbbell-curl', name: 'Dumbbell Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'hammer-curl', name: 'Hammer Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'tricep-pushdown', name: 'Tricep Pushdown', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'skull-crusher', name: 'Skull Crusher', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'lateral-raise', name: 'Lateral Raise', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'face-pull', name: 'Face Pull', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'chest-fly', name: 'Chest Fly', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 0, default_unit: 'lb' },
  { slug: 'leg-curl', name: 'Leg Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'leg-extension', name: 'Leg Extension', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'calf-raise', name: 'Calf Raise', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'plank', name: 'Plank', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'ab-wheel', name: 'Ab Wheel', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'cable-crunch', name: 'Cable Crunch', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'running-outdoor', name: 'Running (Outdoor)', modality: 'endurance', movement_pattern: null, is_compound: 0, default_unit: 'mi' },
  { slug: 'running-treadmill', name: 'Running (Treadmill)', modality: 'endurance', movement_pattern: null, is_compound: 0, default_unit: 'mi' },
  { slug: 'cycling-road', name: 'Cycling (Road)', modality: 'endurance', movement_pattern: null, is_compound: 0, default_unit: 'mi' },
  { slug: 'cycling-stationary', name: 'Cycling (Stationary)', modality: 'endurance', movement_pattern: null, is_compound: 0, default_unit: 'mi' },
  { slug: 'rowing-machine', name: 'Rowing Machine', modality: 'endurance', movement_pattern: null, is_compound: 0, default_unit: 'm' },
  { slug: 'swimming', name: 'Swimming', modality: 'endurance', movement_pattern: null, is_compound: 0, default_unit: 'm' },
  { slug: 'jump-rope', name: 'Jump Rope', modality: 'endurance', movement_pattern: null, is_compound: 0, default_unit: 'min' },
  { slug: 'elliptical', name: 'Elliptical', modality: 'endurance', movement_pattern: null, is_compound: 0, default_unit: 'mi' },
  { slug: 'stair-climber', name: 'Stair Climber', modality: 'endurance', movement_pattern: null, is_compound: 0, default_unit: 'floors' },
  { slug: 'hiit', name: 'HIIT', modality: 'endurance', movement_pattern: null, is_compound: 0, default_unit: 'min' },
  { slug: 'yoga', name: 'Yoga', modality: 'mobility', movement_pattern: null, is_compound: 0, default_unit: 'min' },
  { slug: 'dynamic-stretching', name: 'Dynamic Stretching', modality: 'mobility', movement_pattern: null, is_compound: 0, default_unit: 'min' },
  { slug: 'static-stretching', name: 'Static Stretching', modality: 'mobility', movement_pattern: null, is_compound: 0, default_unit: 'min' },
  { slug: 'foam-rolling', name: 'Foam Rolling', modality: 'mobility', movement_pattern: null, is_compound: 0, default_unit: 'min' },
  { slug: 'hip-flexor-routine', name: 'Hip Flexor Routine', modality: 'mobility', movement_pattern: null, is_compound: 0, default_unit: 'min' },
  { slug: 'shoulder-mobility', name: 'Shoulder Mobility', modality: 'mobility', movement_pattern: null, is_compound: 0, default_unit: 'min' },
  { slug: 'thoracic-mobility', name: 'Thoracic Mobility', modality: 'mobility', movement_pattern: null, is_compound: 0, default_unit: 'min' },
  { slug: 'ankle-mobility', name: 'Ankle Mobility', modality: 'mobility', movement_pattern: null, is_compound: 0, default_unit: 'min' },
  { slug: 'pilates', name: 'Pilates', modality: 'mobility', movement_pattern: null, is_compound: 0, default_unit: 'min' },
];

export async function seedDatabase(client: Client): Promise<void> {
  const countResult = await client.execute('SELECT COUNT(*) as c FROM app_user');
  const count = countResult.rows[0]?.c;
  if (Number(count) > 0) return;

  await client.execute({
    sql: `INSERT OR IGNORE INTO app_user (id, handle, display_name, timezone, units, weekly_target)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: ['demo-user-001', 'you', 'Athlete', 'America/Chicago', 'imperial', 4],
  });

  await client.execute({
    sql: `INSERT OR IGNORE INTO streak_state (user_id, current_length, longest_length, rest_tokens, updated_at)
          VALUES (?, 0, 0, 0, datetime('now'))`,
    args: ['demo-user-001'],
  });

  const exerciseStmts = EXERCISES.map(ex => ({
    sql: `INSERT OR IGNORE INTO exercise (slug, name, modality, movement_pattern, is_compound, default_unit) VALUES (?,?,?,?,?,?)`,
    args: [ex.slug, ex.name, ex.modality, ex.movement_pattern, ex.is_compound, ex.default_unit],
  }));
  await client.batch(exerciseStmts, 'write');

  const questDefs = [
    { kind: 'weekly', template_key: 'strength_sessions', target_type: 'modality_count', params: JSON.stringify({ modality: 'strength', count: 2 }), xp_reward: 150 },
    { kind: 'weekly', template_key: 'endurance_sessions', target_type: 'modality_count', params: JSON.stringify({ modality: 'endurance', count: 1 }), xp_reward: 120 },
    { kind: 'weekly', template_key: 'mobility_sessions', target_type: 'modality_count', params: JSON.stringify({ modality: 'mobility', count: 1 }), xp_reward: 90 },
    { kind: 'weekly', template_key: 'pull_sessions', target_type: 'pattern_sessions', params: JSON.stringify({ pattern: 'vertical_pull', count: 1 }), xp_reward: 100 },
    { kind: 'weekly', template_key: 'hinge_sessions', target_type: 'pattern_sessions', params: JSON.stringify({ pattern: 'hinge', count: 1 }), xp_reward: 100 },
    { kind: 'season_goal', template_key: 'strength_50', target_type: 'attribute_threshold', params: JSON.stringify({ attribute: 'str', threshold: 50 }), xp_reward: 2000 },
  ];
  for (const qd of questDefs) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO quest_definition (kind, template_key, target_type, params, xp_reward) VALUES (?,?,?,?,?)`,
      args: [qd.kind, qd.template_key, qd.target_type, qd.params, qd.xp_reward],
    });
  }

  const badgeDefs = [
    { slug: 'first-session', name: 'First Step', criteria: 'Complete your first session', rarity: 'common' },
    { slug: 'week-streak', name: 'Week Warrior', criteria: 'Reach a 7-day streak', rarity: 'common' },
    { slug: 'month-streak', name: 'Iron Discipline', criteria: 'Reach a 30-day streak', rarity: 'rare' },
    { slug: 'first-pr', name: 'Personal Best', criteria: 'Set your first PR', rarity: 'common' },
    { slug: 'century', name: 'Century', criteria: 'Log 100 sessions', rarity: 'rare' },
    { slug: 'full-season', name: 'Season Veteran', criteria: 'Active in all 12 weeks', rarity: 'epic' },
  ];
  for (const bd of badgeDefs) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO badge_definition (slug, name, criteria, rarity) VALUES (?,?,?,?)`,
      args: [bd.slug, bd.name, bd.criteria, bd.rarity],
    });
  }

  const now = new Date();
  const seasonStart = new Date(now);
  seasonStart.setDate(seasonStart.getDate() - ((now.getDay() + 6) % 7));
  seasonStart.setHours(0, 0, 0, 0);
  const seasonEnd = new Date(seasonStart);
  seasonEnd.setDate(seasonEnd.getDate() + 84);
  await client.execute({
    sql: `INSERT OR IGNORE INTO season (ordinal, starts_at, ends_at, state) VALUES (1,?,?,'active')`,
    args: [seasonStart.toISOString(), seasonEnd.toISOString()],
  });

  const weekStart = getWeekStart();
  const weeklyDefsResult = await client.execute(`SELECT id, params FROM quest_definition WHERE kind='weekly' LIMIT 3`);
  const weeklyDefs = weeklyDefsResult.rows;
  for (const qd of weeklyDefs) {
    const params = JSON.parse(String(qd.params));
    await client.execute({
      sql: `INSERT OR IGNORE INTO quest_assignment (user_id, definition_id, week_start, current_val, target_val) VALUES (?,?,?,0,?)`,
      args: ['demo-user-001', qd.id, weekStart, params.count ?? params.threshold ?? 1],
    });
  }

  for (const attr of ['str', 'end', 'mob', 'con']) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO attribute_state (user_id, attribute, value, peak_value, computed_at) VALUES (?,?,0,0,datetime('now'))`,
      args: ['demo-user-001', attr],
    });
  }
}

function getWeekStart(): string {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}
