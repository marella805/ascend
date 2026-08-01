import type { Client } from '@libsql/client';

const USER_ID = 'demo-user-001';

const EXERCISES = [
  // ── CHEST ──────────────────────────────────────────────────────────────────
  { slug: 'barbell-bench-press', name: 'Barbell Bench Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'incline-barbell-press', name: 'Incline Barbell Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'incline-bench-press', name: 'Incline Bench Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'decline-barbell-press', name: 'Decline Barbell Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'decline-dumbbell-press', name: 'Decline Dumbbell Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'smith-machine-bench-press', name: 'Smith Machine Bench Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'smith-machine-incline-press', name: 'Smith Machine Incline Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'cable-fly-low-to-high', name: 'Cable Fly (Low to High)', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 0, default_unit: 'lb' },
  { slug: 'cable-fly-high-to-low', name: 'Cable Fly (High to Low)', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 0, default_unit: 'lb' },
  { slug: 'cable-crossover', name: 'Cable Crossover', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 0, default_unit: 'lb' },
  { slug: 'pec-deck', name: 'Pec Deck / Machine Fly', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 0, default_unit: 'lb' },
  { slug: 'chest-fly', name: 'Chest Fly', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 0, default_unit: 'lb' },
  { slug: 'dumbbell-fly', name: 'Dumbbell Fly', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 0, default_unit: 'lb' },
  { slug: 'incline-dumbbell-fly', name: 'Incline Dumbbell Fly', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 0, default_unit: 'lb' },
  { slug: 'push-up', name: 'Push-Up', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'decline-push-up', name: 'Decline Push-Up', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'dip', name: 'Dip', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'dips-chest', name: 'Dips (Chest Focus)', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'landmine-press', name: 'Landmine Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },

  // ── BACK ───────────────────────────────────────────────────────────────────
  { slug: 'barbell-deadlift', name: 'Barbell Deadlift', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'conventional-deadlift', name: 'Conventional Deadlift', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'romanian-deadlift', name: 'Romanian Deadlift', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'sumo-deadlift', name: 'Sumo Deadlift', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'hex-bar-deadlift', name: 'Hex Bar Deadlift', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'rack-pull', name: 'Rack Pull', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'stiff-leg-deadlift', name: 'Stiff-Leg Deadlift', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'single-leg-deadlift', name: 'Single-Leg Deadlift', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'good-morning', name: 'Good Morning', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'back-extension', name: 'Back Extension / Hyperextension', modality: 'strength', movement_pattern: 'hinge', is_compound: 0, default_unit: 'lb' },
  { slug: 'barbell-row', name: 'Barbell Row', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'barbell-row-bent-over', name: 'Barbell Row (Bent Over)', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'pendlay-row', name: 'Pendlay Row', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 't-bar-row', name: 'T-Bar Row', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'meadows-row', name: 'Meadows Row', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'dumbbell-row', name: 'Dumbbell Row', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 0, default_unit: 'lb' },
  { slug: 'single-arm-dumbbell-row', name: 'Single-Arm Dumbbell Row', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'chest-supported-row', name: 'Chest Supported Row', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'iso-lateral-row', name: 'Iso Lateral Row', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'cable-row', name: 'Cable Row', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 0, default_unit: 'lb' },
  { slug: 'seated-cable-row-close', name: 'Seated Cable Row (Close Grip)', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'seated-cable-row-wide', name: 'Seated Cable Row (Wide Grip)', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'high-row', name: 'High Row (Cable)', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'low-row', name: 'Low Row (Cable)', modality: 'strength', movement_pattern: 'horizontal_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'pull-up', name: 'Pull-up', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'pull-up-wide', name: 'Pull-Up (Wide Grip)', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'pull-up-close', name: 'Pull-Up (Close Grip)', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'chin-up', name: 'Chin-up', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'weighted-pull-up', name: 'Weighted Pull-Up', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'lat-pulldown', name: 'Lat Pulldown', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 0, default_unit: 'lb' },
  { slug: 'lat-pulldown-wide', name: 'Lat Pulldown (Wide Grip)', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'lat-pulldown-close', name: 'Lat Pulldown (Close Grip)', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 1, default_unit: 'lb' },
  { slug: 'straight-arm-pulldown', name: 'Straight-Arm Pulldown', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 0, default_unit: 'lb' },

  // ── SHOULDERS ──────────────────────────────────────────────────────────────
  { slug: 'barbell-overhead-press', name: 'Barbell Overhead Press', modality: 'strength', movement_pattern: 'vertical_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'barbell-ohp-standing', name: 'Barbell Overhead Press (Standing)', modality: 'strength', movement_pattern: 'vertical_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'barbell-ohp-seated', name: 'Barbell Overhead Press (Seated)', modality: 'strength', movement_pattern: 'vertical_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', modality: 'strength', movement_pattern: 'vertical_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'dumbbell-shoulder-press-standing', name: 'Dumbbell Shoulder Press (Standing)', modality: 'strength', movement_pattern: 'vertical_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'dumbbell-shoulder-press-seated', name: 'Dumbbell Shoulder Press (Seated)', modality: 'strength', movement_pattern: 'vertical_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'machine-shoulder-press', name: 'Machine Shoulder Press', modality: 'strength', movement_pattern: 'vertical_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'smith-machine-ohp', name: 'Smith Machine OHP', modality: 'strength', movement_pattern: 'vertical_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'arnold-press', name: 'Arnold Press', modality: 'strength', movement_pattern: 'vertical_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'lateral-raise', name: 'Lateral Raise', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'cable-lateral-raise', name: 'Cable Lateral Raise', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'machine-lateral-raise', name: 'Machine Lateral Raise', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'upright-row-barbell', name: 'Upright Row (Barbell)', modality: 'strength', movement_pattern: null, is_compound: 1, default_unit: 'lb' },
  { slug: 'upright-row-dumbbell', name: 'Upright Row (Dumbbell)', modality: 'strength', movement_pattern: null, is_compound: 1, default_unit: 'lb' },
  { slug: 'face-pull', name: 'Face Pull', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'rear-delt-fly', name: 'Rear Delt Fly (Dumbbell)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'rear-delt-fly-machine', name: 'Rear Delt Fly (Pec Deck Reverse)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'front-raise-dumbbell', name: 'Front Raise (Dumbbell)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'front-raise-barbell', name: 'Front Raise (Barbell)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'cable-front-raise', name: 'Cable Front Raise', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },

  // ── BICEPS ─────────────────────────────────────────────────────────────────
  { slug: 'barbell-curl', name: 'Barbell Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'ez-bar-curl', name: 'EZ Bar Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'dumbbell-curl', name: 'Dumbbell Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'dumbbell-curl-seated', name: 'Dumbbell Curl (Seated)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'hammer-curl', name: 'Hammer Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'preacher-curl-barbell', name: 'Preacher Curl (Barbell)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'preacher-curl-dumbbell', name: 'Preacher Curl (Dumbbell)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'preacher-curl-machine', name: 'Preacher Curl (Machine)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'cable-curl', name: 'Cable Curl (Low Pulley)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'bayesian-curl', name: 'Bayesian Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'concentration-curl', name: 'Concentration Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'spider-curl', name: 'Spider Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'cross-body-hammer-curl', name: 'Cross Body Hammer Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'reverse-curl', name: 'Reverse Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'zottman-curl', name: 'Zottman Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },

  // ── TRICEPS ────────────────────────────────────────────────────────────────
  { slug: 'close-grip-bench-press', name: 'Close Grip Bench Press', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'skull-crusher', name: 'Skull Crusher', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'skull-crusher-ez', name: 'Skull Crusher (EZ Bar)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'skull-crusher-dumbbell', name: 'Skull Crusher (Dumbbell)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'overhead-dumbbell-extension', name: 'Overhead Dumbbell Extension', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'overhead-cable-extension', name: 'Overhead Cable Extension', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'tricep-pushdown', name: 'Tricep Pushdown', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'rope-pushdown', name: 'Rope Pushdown', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'straight-bar-pushdown', name: 'Straight Bar Pushdown', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'v-bar-pushdown', name: 'V-Bar Pushdown', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'single-arm-cable-pushdown', name: 'Single Arm Cable Pushdown', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'dips-tricep', name: 'Dips (Tricep Focus)', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'diamond-push-up', name: 'Diamond Push-Up', modality: 'strength', movement_pattern: 'horizontal_push', is_compound: 1, default_unit: 'lb' },
  { slug: 'tate-press', name: 'Tate Press', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'jm-press', name: 'JM Press', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'tricep-kickback', name: 'Kickback (Dumbbell)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },

  // ── LEGS ───────────────────────────────────────────────────────────────────
  { slug: 'barbell-back-squat', name: 'Barbell Back Squat', modality: 'strength', movement_pattern: 'squat', is_compound: 1, default_unit: 'lb' },
  { slug: 'barbell-front-squat', name: 'Barbell Front Squat', modality: 'strength', movement_pattern: 'squat', is_compound: 1, default_unit: 'lb' },
  { slug: 'goblet-squat', name: 'Goblet Squat', modality: 'strength', movement_pattern: 'squat', is_compound: 1, default_unit: 'lb' },
  { slug: 'hack-squat', name: 'Hack Squat', modality: 'strength', movement_pattern: 'squat', is_compound: 1, default_unit: 'lb' },
  { slug: 'pendulum-squat', name: 'Pendulum Squat', modality: 'strength', movement_pattern: 'squat', is_compound: 1, default_unit: 'lb' },
  { slug: 'leg-press', name: 'Leg Press', modality: 'strength', movement_pattern: 'squat', is_compound: 0, default_unit: 'lb' },
  { slug: 'sumo-squat', name: 'Sumo Squat', modality: 'strength', movement_pattern: 'squat', is_compound: 1, default_unit: 'lb' },
  { slug: 'sissy-squat', name: 'Sissy Squat', modality: 'strength', movement_pattern: 'squat', is_compound: 0, default_unit: 'lb' },
  { slug: 'walking-lunge', name: 'Walking Lunge', modality: 'strength', movement_pattern: 'lunge', is_compound: 1, default_unit: 'lb' },
  { slug: 'barbell-lunge', name: 'Barbell Lunge', modality: 'strength', movement_pattern: 'lunge', is_compound: 1, default_unit: 'lb' },
  { slug: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', modality: 'strength', movement_pattern: 'lunge', is_compound: 1, default_unit: 'lb' },
  { slug: 'step-up', name: 'Step-Up', modality: 'strength', movement_pattern: 'lunge', is_compound: 1, default_unit: 'lb' },
  { slug: 'romanian-deadlift-dumbbell', name: 'Romanian Deadlift (Dumbbell)', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'leg-curl', name: 'Leg Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'lying-leg-curl', name: 'Lying Leg Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'seated-leg-curl', name: 'Seated Leg Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'standing-leg-curl', name: 'Standing Leg Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'nordic-hamstring-curl', name: 'Nordic Hamstring Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'leg-extension', name: 'Leg Extension', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },

  // ── GLUTES ─────────────────────────────────────────────────────────────────
  { slug: 'hip-thrust', name: 'Hip Thrust', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'barbell-hip-thrust', name: 'Barbell Hip Thrust', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'machine-hip-thrust', name: 'Machine Hip Thrust', modality: 'strength', movement_pattern: 'hinge', is_compound: 1, default_unit: 'lb' },
  { slug: 'glute-bridge-barbell', name: 'Glute Bridge (Barbell)', modality: 'strength', movement_pattern: 'hinge', is_compound: 0, default_unit: 'lb' },
  { slug: 'glute-bridge', name: 'Glute Bridge (Bodyweight)', modality: 'strength', movement_pattern: 'hinge', is_compound: 0, default_unit: 'lb' },
  { slug: 'cable-kickback', name: 'Cable Kickback', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'abductor-machine', name: 'Abductor Machine', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'adductor-machine', name: 'Adductor Machine', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'donkey-kick', name: 'Donkey Kick', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'fire-hydrant', name: 'Fire Hydrant', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },

  // ── CORE ───────────────────────────────────────────────────────────────────
  { slug: 'cable-crunch', name: 'Cable Crunch', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'machine-crunch', name: 'Machine Crunch', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'hanging-leg-raise', name: 'Hanging Leg Raise', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'ab-wheel', name: 'Ab Wheel', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'plank', name: 'Plank', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'side-plank', name: 'Side Plank', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'pallof-press', name: 'Pallof Press', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'decline-crunch', name: 'Decline Crunch', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'russian-twist', name: 'Russian Twist', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'dragon-flag', name: 'Dragon Flag', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'hollow-hold', name: 'Hollow Hold', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'dead-bug', name: 'Dead Bug', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'bicycle-crunch', name: 'Bicycle Crunch', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'v-up', name: 'V-Up', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'reverse-crunch', name: 'Reverse Crunch', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'landmine-rotation', name: 'Landmine Rotation', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },
  { slug: 'woodchop-cable', name: 'Woodchop (Cable)', modality: 'strength', movement_pattern: 'core', is_compound: 0, default_unit: 'lb' },

  // ── CALVES ─────────────────────────────────────────────────────────────────
  { slug: 'calf-raise', name: 'Calf Raise', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'standing-calf-raise', name: 'Standing Calf Raise (Machine)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'seated-calf-raise', name: 'Seated Calf Raise', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'donkey-calf-raise', name: 'Donkey Calf Raise', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'single-leg-calf-raise', name: 'Single-Leg Calf Raise', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'leg-press-calf-raise', name: 'Leg Press Calf Raise', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },

  // ── FOREARMS ───────────────────────────────────────────────────────────────
  { slug: 'wrist-curl-barbell', name: 'Wrist Curl (Barbell)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'wrist-curl-dumbbell', name: 'Wrist Curl (Dumbbell)', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'reverse-wrist-curl', name: 'Reverse Wrist Curl', modality: 'strength', movement_pattern: null, is_compound: 0, default_unit: 'lb' },
  { slug: 'farmers-walk', name: "Farmer's Walk", modality: 'strength', movement_pattern: null, is_compound: 1, default_unit: 'lb' },
  { slug: 'dead-hang', name: 'Dead Hang', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 0, default_unit: 'lb' },
  { slug: 'towel-pull-up', name: 'Towel Pull-Up', modality: 'strength', movement_pattern: 'vertical_pull', is_compound: 1, default_unit: 'lb' },

  // ── ENDURANCE ──────────────────────────────────────────────────────────────
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

  // ── MOBILITY ───────────────────────────────────────────────────────────────
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

const ALL_QUEST_DEFS = [
  { kind: 'weekly', template_key: 'strength_sessions', target_type: 'modality_count', params: JSON.stringify({ modality: 'strength', count: 2 }), xp_reward: 150 },
  { kind: 'weekly', template_key: 'endurance_sessions', target_type: 'modality_count', params: JSON.stringify({ modality: 'endurance', count: 1 }), xp_reward: 120 },
  { kind: 'weekly', template_key: 'mobility_sessions', target_type: 'modality_count', params: JSON.stringify({ modality: 'mobility', count: 1 }), xp_reward: 90 },
  { kind: 'weekly', template_key: 'pull_sessions', target_type: 'pattern_sessions', params: JSON.stringify({ pattern: 'vertical_pull', count: 1 }), xp_reward: 100 },
  { kind: 'weekly', template_key: 'hinge_sessions', target_type: 'pattern_sessions', params: JSON.stringify({ pattern: 'hinge', count: 1 }), xp_reward: 100 },
  { kind: 'weekly', template_key: 'push_sessions', target_type: 'pattern_sessions', params: JSON.stringify({ pattern: 'push', count: 1 }), xp_reward: 100 },
  { kind: 'weekly', template_key: 'squat_sessions', target_type: 'pattern_sessions', params: JSON.stringify({ pattern: 'squat', count: 1 }), xp_reward: 100 },
  { kind: 'weekly', template_key: 'volume_5k', target_type: 'session_volume', params: JSON.stringify({ threshold_lb: 5000, count: 1 }), xp_reward: 200 },
  { kind: 'season_goal', template_key: 'strength_50', target_type: 'attribute_threshold', params: JSON.stringify({ attribute: 'str', threshold: 50 }), xp_reward: 2000 },
  { kind: 'season_goal', template_key: 'strength_75', target_type: 'attribute_threshold', params: JSON.stringify({ attribute: 'str', threshold: 75 }), xp_reward: 4000 },
];

const ALL_BADGE_DEFS = [
  { slug: 'first-session', name: 'First Step', criteria: 'Complete your first session', rarity: 'common' },
  { slug: 'week-streak', name: 'Week Warrior', criteria: 'Reach a 7-day streak', rarity: 'common' },
  { slug: 'month-streak', name: 'Iron Discipline', criteria: 'Reach a 30-day streak', rarity: 'rare' },
  { slug: 'first-pr', name: 'Personal Best', criteria: 'Set your first PR', rarity: 'common' },
  { slug: 'century', name: 'Century', criteria: 'Log 100 sessions', rarity: 'rare' },
  { slug: 'full-season', name: 'Season Veteran', criteria: 'Active in all 12 weeks', rarity: 'epic' },
];

export async function seedDatabase(client: Client): Promise<void> {
  // Always ensure quest and badge definitions are current (INSERT OR IGNORE = idempotent)
  for (const qd of ALL_QUEST_DEFS) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO quest_definition (kind, template_key, target_type, params, xp_reward) VALUES (?,?,?,?,?)`,
      args: [qd.kind, qd.template_key, qd.target_type, qd.params, qd.xp_reward],
    });
  }
  for (const bd of ALL_BADGE_DEFS) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO badge_definition (slug, name, criteria, rarity) VALUES (?,?,?,?)`,
      args: [bd.slug, bd.name, bd.criteria, bd.rarity],
    });
  }

  // Always sync exercises (INSERT OR IGNORE = new exercises added, existing unchanged)
  const exerciseStmts = EXERCISES.map(ex => ({
    sql: `INSERT OR IGNORE INTO exercise (slug, name, modality, movement_pattern, is_compound, default_unit) VALUES (?,?,?,?,?,?)`,
    args: [ex.slug, ex.name, ex.modality, ex.movement_pattern, ex.is_compound, ex.default_unit],
  }));
  await client.batch(exerciseStmts, 'write');

  const countResult = await client.execute('SELECT COUNT(*) as c FROM app_user');
  if (Number(countResult.rows[0]?.c) > 0) {
    await ensureQuestAssignments(client);
    return;
  }

  // ── New user full setup ────────────────────────────────────────────────────
  await client.execute({
    sql: `INSERT OR IGNORE INTO app_user (id, handle, display_name, timezone, units, weekly_target)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [USER_ID, 'you', 'Athlete', 'America/Chicago', 'imperial', 4],
  });

  await client.execute({
    sql: `INSERT OR IGNORE INTO streak_state (user_id, current_length, longest_length, rest_tokens, updated_at)
          VALUES (?, 0, 0, 0, datetime('now'))`,
    args: [USER_ID],
  });

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

  await ensureQuestAssignments(client);

  for (const attr of ['str', 'end', 'mob', 'con']) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO attribute_state (user_id, attribute, value, peak_value, computed_at) VALUES (?,?,0,0,datetime('now'))`,
      args: [USER_ID, attr],
    });
  }
}

async function ensureQuestAssignments(client: Client): Promise<void> {
  const weekStart = getWeekStart();
  const allDefsResult = await client.execute(`SELECT id, kind, params FROM quest_definition`);
  for (const qd of allDefsResult.rows) {
    const kind = String(qd.kind);
    const params = JSON.parse(String(qd.params));
    const ws = kind === 'season_goal' ? '2025-01-01' : weekStart;
    await client.execute({
      sql: `INSERT OR IGNORE INTO quest_assignment (user_id, definition_id, week_start, current_val, target_val) VALUES (?,?,?,0,?)`,
      args: [USER_ID, qd.id, ws, params.count ?? params.threshold ?? 1],
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
