// SQLite schema for ASCEND. Adapted from the PostgreSQL spec for local use.
// PRAGMAs are set separately in index.ts
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS app_user (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  handle        TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  timezone      TEXT NOT NULL DEFAULT 'America/Chicago',
  units         TEXT NOT NULL DEFAULT 'imperial' CHECK(units IN ('imperial','metric')),
  weekly_target INTEGER DEFAULT 4,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exercise (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  modality        TEXT NOT NULL CHECK(modality IN ('strength','endurance','mobility')),
  movement_pattern TEXT,
  is_compound     INTEGER NOT NULL DEFAULT 0,
  default_unit    TEXT NOT NULL DEFAULT 'lb',
  active          INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS workout_session (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  modality    TEXT NOT NULL CHECK(modality IN ('strength','endurance','mobility')),
  started_at  TEXT NOT NULL,
  ended_at    TEXT,
  duration_s  INTEGER,
  local_date  TEXT NOT NULL,
  tz_at_write TEXT NOT NULL DEFAULT 'America/Chicago',
  title       TEXT,
  notes       TEXT,
  state       TEXT NOT NULL DEFAULT 'open' CHECK(state IN ('open','finished','voided')),
  finished_at TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_session_user_date ON workout_session(user_id, local_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_user_mod ON workout_session(user_id, modality, finished_at DESC);

CREATE TABLE IF NOT EXISTS session_set (
  id          TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES workout_session(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercise(id),
  set_index   INTEGER NOT NULL,
  weight_kg   REAL,
  reps        INTEGER,
  duration_s  INTEGER,
  distance_m  REAL,
  rpe         REAL,
  is_warmup   INTEGER NOT NULL DEFAULT 0,
  logged_at   TEXT NOT NULL,
  UNIQUE(session_id, exercise_id, set_index)
);

CREATE TABLE IF NOT EXISTS xp_ledger (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  season_id  TEXT,
  amount     INTEGER NOT NULL,
  reason     TEXT NOT NULL CHECK(reason IN ('session','quest','season_goal','badge','adjustment')),
  source_id  TEXT,
  local_date TEXT NOT NULL,
  meta       TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, reason, source_id)
);
CREATE INDEX IF NOT EXISTS idx_xp_user ON xp_ledger(user_id, local_date);

CREATE TABLE IF NOT EXISTS attribute_state (
  user_id     TEXT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  attribute   TEXT NOT NULL CHECK(attribute IN ('str','end','mob','con')),
  value       INTEGER NOT NULL DEFAULT 0 CHECK(value BETWEEN 0 AND 100),
  peak_value  INTEGER NOT NULL DEFAULT 0,
  computed_at TEXT NOT NULL,
  PRIMARY KEY(user_id, attribute)
);

CREATE TABLE IF NOT EXISTS baseline_state (
  user_id         TEXT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  modality        TEXT NOT NULL,
  median_workload REAL NOT NULL DEFAULT 0,
  sample_count    INTEGER NOT NULL DEFAULT 0,
  computed_at     TEXT NOT NULL,
  PRIMARY KEY(user_id, modality)
);

CREATE TABLE IF NOT EXISTS streak_state (
  user_id            TEXT PRIMARY KEY REFERENCES app_user(id) ON DELETE CASCADE,
  current_length     INTEGER NOT NULL DEFAULT 0,
  longest_length     INTEGER NOT NULL DEFAULT 0,
  last_active_date   TEXT,
  rest_tokens        INTEGER NOT NULL DEFAULT 0 CHECK(rest_tokens BETWEEN 0 AND 3),
  tokens_earned_at_len INTEGER NOT NULL DEFAULT 0,
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS season (
  id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ordinal   INTEGER UNIQUE NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at   TEXT NOT NULL,
  state     TEXT NOT NULL DEFAULT 'active' CHECK(state IN ('upcoming','active','closing','closed'))
);

CREATE TABLE IF NOT EXISTS quest_definition (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  kind        TEXT NOT NULL CHECK(kind IN ('weekly','season_goal')),
  template_key TEXT NOT NULL,
  target_type TEXT NOT NULL,
  params      TEXT NOT NULL DEFAULT '{}',
  xp_reward   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS quest_assignment (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  definition_id TEXT NOT NULL REFERENCES quest_definition(id),
  week_start  TEXT,
  current_val INTEGER NOT NULL DEFAULT 0,
  target_val  INTEGER NOT NULL,
  completed   INTEGER NOT NULL DEFAULT 0,
  xp_awarded  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_quest_user ON quest_assignment(user_id, week_start);

CREATE TABLE IF NOT EXISTS badge_definition (
  id       TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  slug     TEXT UNIQUE NOT NULL,
  name     TEXT NOT NULL,
  criteria TEXT NOT NULL,
  rarity   TEXT NOT NULL DEFAULT 'common' CHECK(rarity IN ('common','rare','epic','legendary'))
);

CREATE TABLE IF NOT EXISTS badge_unlock (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id     TEXT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  badge_id    TEXT NOT NULL REFERENCES badge_definition(id),
  session_id  TEXT REFERENCES workout_session(id),
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS key_value (
  user_id    TEXT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY(user_id, key)
);
`;
