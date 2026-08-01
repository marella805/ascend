export type ProgramExercise = {
  slug: string;
  name: string;
  sets: number;
  reps: string;
};

export type ProgramDay = {
  name: string;
  tag: string;
  exercises: ProgramExercise[];
};

export type ProgramDef = {
  key: string;
  label: string;
  shortLabel: string;
  color: string;
  days: ProgramDay[];
};

export const PROGRAMS: ProgramDef[] = [
  {
    key: 'PPL',
    label: 'Push / Pull / Legs',
    shortLabel: 'PPL 6-Day',
    color: '#FF5A3C',
    days: [
      { name: 'Push (Heavy)', tag: 'DAY 1', exercises: [
        { slug: 'incline-barbell-press', name: 'Incline Barbell Press', sets: 3, reps: '4–6' },
        { slug: 'smith-machine-bench-press', name: 'Smith Machine Bench Press', sets: 3, reps: '6–8' },
        { slug: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', sets: 4, reps: '12–15' },
        { slug: 'cable-lateral-raise', name: 'Cable Lateral Raise', sets: 2, reps: '15–20' },
        { slug: 'skull-crusher-ez', name: 'Skull Crusher (EZ Bar)', sets: 3, reps: '8–10' },
      ]},
      { name: 'Pull (Lat Focus)', tag: 'DAY 2', exercises: [
        { slug: 'weighted-pull-up', name: 'Weighted Pull-Up', sets: 4, reps: '5–7' },
        { slug: 'lat-pulldown-wide', name: 'Lat Pulldown (Wide Grip)', sets: 3, reps: '8–10' },
        { slug: 'lat-pulldown-close', name: 'Lat Pulldown (Close Grip)', sets: 2, reps: '10–12' },
        { slug: 'face-pull', name: 'Face Pull', sets: 3, reps: '15–20' },
        { slug: 'preacher-curl-dumbbell', name: 'Preacher Curl (Dumbbell)', sets: 3, reps: '10–12' },
        { slug: 'hammer-curl', name: 'Hammer Curl', sets: 2, reps: '12' },
      ]},
      { name: 'Legs', tag: 'DAY 3', exercises: [
        { slug: 'pendulum-squat', name: 'Pendulum Squat', sets: 4, reps: '6–8' },
        { slug: 'leg-extension', name: 'Leg Extension', sets: 3, reps: '12–15' },
        { slug: 'lying-leg-curl', name: 'Lying Leg Curl', sets: 3, reps: '10–12' },
        { slug: 'barbell-hip-thrust', name: 'Barbell Hip Thrust', sets: 4, reps: '10–12' },
        { slug: 'adductor-machine', name: 'Adductor Machine', sets: 3, reps: '15–20' },
        { slug: 'standing-calf-raise', name: 'Standing Calf Raise (Machine)', sets: 4, reps: '12–15' },
      ]},
      { name: 'Push (Volume)', tag: 'DAY 4', exercises: [
        { slug: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', sets: 4, reps: '10–12' },
        { slug: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', sets: 3, reps: '10–12' },
        { slug: 'dips-chest', name: 'Dips (Chest Focus)', sets: 3, reps: '8–12' },
        { slug: 'dumbbell-shoulder-press-seated', name: 'Dumbbell Shoulder Press (Seated)', sets: 3, reps: '10–12' },
        { slug: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', sets: 4, reps: '15–20' },
        { slug: 'straight-bar-pushdown', name: 'Straight Bar Pushdown', sets: 3, reps: '10–12' },
        { slug: 'overhead-dumbbell-extension', name: 'Overhead Dumbbell Extension', sets: 2, reps: '10–12' },
      ]},
      { name: 'Pull (Row Focus)', tag: 'DAY 5', exercises: [
        { slug: 'chest-supported-row', name: 'Chest Supported Row', sets: 4, reps: '6–8' },
        { slug: 't-bar-row', name: 'T-Bar Row', sets: 3, reps: '8–10' },
        { slug: 'seated-cable-row-close', name: 'Seated Cable Row (Close Grip)', sets: 3, reps: '10–12' },
        { slug: 'face-pull', name: 'Face Pull', sets: 3, reps: '15–20' },
        { slug: 'ez-bar-curl', name: 'EZ Bar Curl', sets: 3, reps: '10–12' },
        { slug: 'bayesian-curl', name: 'Bayesian Curl', sets: 2, reps: '12–15' },
      ]},
      { name: 'Legs', tag: 'DAY 6', exercises: [
        { slug: 'romanian-deadlift', name: 'Romanian Deadlift', sets: 4, reps: '6–8' },
        { slug: 'leg-press', name: 'Leg Press', sets: 3, reps: '10–12' },
        { slug: 'seated-leg-curl', name: 'Seated Leg Curl', sets: 3, reps: '10–12' },
        { slug: 'machine-hip-thrust', name: 'Machine Hip Thrust', sets: 3, reps: '10–12' },
        { slug: 'abductor-machine', name: 'Abductor Machine', sets: 3, reps: '15–20' },
        { slug: 'seated-calf-raise', name: 'Seated Calf Raise', sets: 4, reps: '15–20' },
      ]},
    ],
  },
  {
    key: 'PPLA',
    label: 'Push / Pull / Legs + Arms',
    shortLabel: 'PPLA 7-Day',
    color: '#B57BFF',
    days: [
      { name: 'Push', tag: 'DAY 1', exercises: [
        { slug: 'incline-barbell-press', name: 'Incline Barbell Press', sets: 3, reps: '4–6' },
        { slug: 'smith-machine-bench-press', name: 'Smith Machine Bench Press', sets: 3, reps: '6–8' },
        { slug: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', sets: 3, reps: '12–15' },
        { slug: 'cable-lateral-raise', name: 'Cable Lateral Raise', sets: 3, reps: '15–20' },
        { slug: 'skull-crusher-ez', name: 'Skull Crusher (EZ Bar)', sets: 3, reps: '8–10' },
      ]},
      { name: 'Pull', tag: 'DAY 2', exercises: [
        { slug: 'weighted-pull-up', name: 'Weighted Pull-Up', sets: 3, reps: '5–7' },
        { slug: 'lat-pulldown-wide', name: 'Lat Pulldown (Wide Grip)', sets: 2, reps: '8–10' },
        { slug: 'iso-lateral-row', name: 'Iso Lateral Row', sets: 2, reps: '8–10' },
        { slug: 'low-row', name: 'Low Row (Cable)', sets: 2, reps: '10–12' },
        { slug: 'face-pull', name: 'Face Pull', sets: 3, reps: '15–20' },
        { slug: 'preacher-curl-dumbbell', name: 'Preacher Curl (Dumbbell)', sets: 3, reps: '10–12' },
      ]},
      { name: 'Legs', tag: 'DAY 3', exercises: [
        { slug: 'pendulum-squat', name: 'Pendulum Squat', sets: 4, reps: '6–8' },
        { slug: 'leg-extension', name: 'Leg Extension', sets: 3, reps: '12–15' },
        { slug: 'seated-leg-curl', name: 'Seated Leg Curl', sets: 3, reps: '10–12' },
        { slug: 'barbell-hip-thrust', name: 'Barbell Hip Thrust', sets: 4, reps: '10–12' },
        { slug: 'adductor-machine', name: 'Adductor Machine', sets: 3, reps: '15–20' },
        { slug: 'abductor-machine', name: 'Abductor Machine', sets: 3, reps: '15–20' },
        { slug: 'standing-calf-raise', name: 'Standing Calf Raise (Machine)', sets: 4, reps: '12–15' },
      ]},
      { name: 'Arms', tag: 'DAY 4', exercises: [
        { slug: 'ez-bar-curl', name: 'EZ Bar Curl', sets: 3, reps: '6–8' },
        { slug: 'preacher-curl-dumbbell', name: 'Preacher Curl (Dumbbell)', sets: 3, reps: '10–12' },
        { slug: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', sets: 2, reps: '12' },
        { slug: 'bayesian-curl', name: 'Bayesian Curl', sets: 2, reps: '12–15' },
        { slug: 'skull-crusher-ez', name: 'Skull Crusher (EZ Bar)', sets: 3, reps: '6–8' },
        { slug: 'straight-bar-pushdown', name: 'Straight Bar Pushdown', sets: 3, reps: '10–12' },
        { slug: 'overhead-dumbbell-extension', name: 'Overhead Dumbbell Extension', sets: 2, reps: '10–12' },
        { slug: 'reverse-curl', name: 'Reverse Curl', sets: 2, reps: '12' },
      ]},
      { name: 'Push', tag: 'DAY 5', exercises: [
        { slug: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', sets: 4, reps: '10–12' },
        { slug: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', sets: 3, reps: '10–12' },
        { slug: 'dips-chest', name: 'Dips (Chest Focus)', sets: 3, reps: '8–12' },
        { slug: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', sets: 3, reps: '15–20' },
        { slug: 'cable-lateral-raise', name: 'Cable Lateral Raise', sets: 3, reps: '15–20' },
      ]},
      { name: 'Pull', tag: 'DAY 6', exercises: [
        { slug: 'chest-supported-row', name: 'Chest Supported Row', sets: 3, reps: '6–8' },
        { slug: 't-bar-row', name: 'T-Bar Row', sets: 3, reps: '8–10' },
        { slug: 'high-row', name: 'High Row (Cable)', sets: 2, reps: '10–12' },
        { slug: 'face-pull', name: 'Face Pull', sets: 3, reps: '15–20' },
        { slug: 'rear-delt-fly-machine', name: 'Rear Delt Fly (Pec Deck)', sets: 3, reps: '15' },
        { slug: 'ez-bar-curl', name: 'EZ Bar Curl', sets: 3, reps: '10–12' },
        { slug: 'hammer-curl', name: 'Hammer Curl', sets: 2, reps: '12' },
      ]},
      { name: 'Legs', tag: 'DAY 7', exercises: [
        { slug: 'romanian-deadlift', name: 'Romanian Deadlift', sets: 4, reps: '6–8' },
        { slug: 'leg-press', name: 'Leg Press', sets: 3, reps: '10–12' },
        { slug: 'lying-leg-curl', name: 'Lying Leg Curl', sets: 3, reps: '10–12' },
        { slug: 'machine-hip-thrust', name: 'Machine Hip Thrust', sets: 3, reps: '10–12' },
        { slug: 'seated-calf-raise', name: 'Seated Calf Raise', sets: 4, reps: '15–20' },
      ]},
    ],
  },
  {
    key: 'UpperLower',
    label: 'Upper / Lower',
    shortLabel: 'Upper/Lower 4-Day',
    color: '#3CC5FF',
    days: [
      { name: 'Upper (Strength)', tag: 'DAY 1', exercises: [
        { slug: 'incline-barbell-press', name: 'Incline Barbell Press', sets: 4, reps: '4–6' },
        { slug: 'chest-supported-row', name: 'Chest Supported Row', sets: 4, reps: '5–7' },
        { slug: 'barbell-ohp-standing', name: 'Barbell Overhead Press', sets: 3, reps: '6–8' },
        { slug: 'weighted-pull-up', name: 'Weighted Pull-Up', sets: 3, reps: '6–8' },
        { slug: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', sets: 3, reps: '12–15' },
        { slug: 'ez-bar-curl', name: 'EZ Bar Curl', sets: 2, reps: '10–12' },
        { slug: 'skull-crusher-ez', name: 'Skull Crusher (EZ Bar)', sets: 2, reps: '10–12' },
      ]},
      { name: 'Lower (Strength)', tag: 'DAY 2', exercises: [
        { slug: 'pendulum-squat', name: 'Pendulum Squat', sets: 4, reps: '5–7' },
        { slug: 'romanian-deadlift', name: 'Romanian Deadlift', sets: 3, reps: '8–10' },
        { slug: 'leg-extension', name: 'Leg Extension', sets: 3, reps: '10–12' },
        { slug: 'lying-leg-curl', name: 'Lying Leg Curl', sets: 3, reps: '10–12' },
        { slug: 'barbell-hip-thrust', name: 'Barbell Hip Thrust', sets: 3, reps: '10–12' },
        { slug: 'standing-calf-raise', name: 'Standing Calf Raise (Machine)', sets: 4, reps: '12–15' },
      ]},
      { name: 'Upper (Volume)', tag: 'DAY 3', exercises: [
        { slug: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', sets: 4, reps: '10–12' },
        { slug: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', sets: 3, reps: '10–12' },
        { slug: 'lat-pulldown-wide', name: 'Lat Pulldown (Wide Grip)', sets: 4, reps: '10–12' },
        { slug: 'seated-cable-row-close', name: 'Seated Cable Row (Close Grip)', sets: 3, reps: '12' },
        { slug: 'dumbbell-shoulder-press-seated', name: 'Dumbbell Shoulder Press (Seated)', sets: 3, reps: '10–12' },
        { slug: 'cable-lateral-raise', name: 'Cable Lateral Raise', sets: 3, reps: '15–20' },
        { slug: 'face-pull', name: 'Face Pull', sets: 3, reps: '15–20' },
        { slug: 'preacher-curl-dumbbell', name: 'Preacher Curl (Dumbbell)', sets: 3, reps: '10–12' },
        { slug: 'rope-pushdown', name: 'Rope Pushdown', sets: 3, reps: '12' },
      ]},
      { name: 'Lower (Volume)', tag: 'DAY 4', exercises: [
        { slug: 'leg-press', name: 'Leg Press', sets: 4, reps: '10–12' },
        { slug: 'hack-squat', name: 'Hack Squat', sets: 3, reps: '8–10' },
        { slug: 'seated-leg-curl', name: 'Seated Leg Curl', sets: 3, reps: '12–15' },
        { slug: 'adductor-machine', name: 'Adductor Machine', sets: 3, reps: '15–20' },
        { slug: 'machine-hip-thrust', name: 'Machine Hip Thrust', sets: 4, reps: '12' },
        { slug: 'seated-calf-raise', name: 'Seated Calf Raise', sets: 4, reps: '15–20' },
      ]},
    ],
  },
];

export function getProgramByKey(key: string): ProgramDef | undefined {
  return PROGRAMS.find(p => p.key === key);
}
