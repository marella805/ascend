'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppNav } from '@/components/AppNav';
import { PROGRAMS, type ProgramDef } from '@/lib/program-splits';

// ── Types ──────────────────────────────────────────────────────────────────────
type DBExercise = {
  id: string; name: string; slug: string; modality: string;
  default_unit: string; is_compound: number; movement_pattern: string | null;
};

type ActiveProgram = {
  active: boolean; split: string; dayIndex: number; cycleDay: number;
  day: { name: string; tag: string; exercises: { slug: string; name: string; sets: number; reps: string }[] };
  totalDays: number;
  programs: { key: string; label: string; shortLabel: string; color: string; totalDays: number }[];
};

// ── Shared exercise data (static - matches DB) ─────────────────────────────────
const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core', 'Forearms', 'Calves'];
type LibraryExercise = { name: string; muscle: string; equipment: string; type: string; slug: string };

const LIBRARY_EXERCISES: LibraryExercise[] = [
  // CHEST
  { slug: 'barbell-bench-press', name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell', type: 'Compound' },
  { slug: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', muscle: 'Chest', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'incline-barbell-press', name: 'Incline Barbell Press', muscle: 'Chest', equipment: 'Barbell', type: 'Compound' },
  { slug: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'decline-barbell-press', name: 'Decline Barbell Press', muscle: 'Chest', equipment: 'Barbell', type: 'Compound' },
  { slug: 'decline-dumbbell-press', name: 'Decline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'smith-machine-bench-press', name: 'Smith Machine Bench Press', muscle: 'Chest', equipment: 'Machine', type: 'Compound' },
  { slug: 'smith-machine-incline-press', name: 'Smith Machine Incline Press', muscle: 'Chest', equipment: 'Machine', type: 'Compound' },
  { slug: 'cable-fly-low-to-high', name: 'Cable Fly (Low to High)', muscle: 'Chest', equipment: 'Cable', type: 'Isolation' },
  { slug: 'cable-fly-high-to-low', name: 'Cable Fly (High to Low)', muscle: 'Chest', equipment: 'Cable', type: 'Isolation' },
  { slug: 'cable-crossover', name: 'Cable Crossover', muscle: 'Chest', equipment: 'Cable', type: 'Isolation' },
  { slug: 'pec-deck', name: 'Pec Deck / Machine Fly', muscle: 'Chest', equipment: 'Machine', type: 'Isolation' },
  { slug: 'dumbbell-fly', name: 'Dumbbell Fly', muscle: 'Chest', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'incline-dumbbell-fly', name: 'Incline Dumbbell Fly', muscle: 'Chest', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'push-up', name: 'Push-Up', muscle: 'Chest', equipment: 'Bodyweight', type: 'Compound' },
  { slug: 'decline-push-up', name: 'Decline Push-Up', muscle: 'Chest', equipment: 'Bodyweight', type: 'Compound' },
  { slug: 'dips-chest', name: 'Dips (Chest Focus)', muscle: 'Chest', equipment: 'Bodyweight', type: 'Compound' },
  { slug: 'landmine-press', name: 'Landmine Press', muscle: 'Chest', equipment: 'Barbell', type: 'Compound' },
  // BACK
  { slug: 'conventional-deadlift', name: 'Conventional Deadlift', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  { slug: 'romanian-deadlift', name: 'Romanian Deadlift', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  { slug: 'barbell-row', name: 'Barbell Row (Bent Over)', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  { slug: 'pendlay-row', name: 'Pendlay Row', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  { slug: 't-bar-row', name: 'T-Bar Row', muscle: 'Back', equipment: 'Machine', type: 'Compound' },
  { slug: 'single-arm-dumbbell-row', name: 'Single-Arm Dumbbell Row', muscle: 'Back', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'chest-supported-row', name: 'Chest Supported Row', muscle: 'Back', equipment: 'Machine', type: 'Compound' },
  { slug: 'iso-lateral-row', name: 'Iso Lateral Row', muscle: 'Back', equipment: 'Machine', type: 'Compound' },
  { slug: 'seated-cable-row-close', name: 'Seated Cable Row (Close Grip)', muscle: 'Back', equipment: 'Cable', type: 'Compound' },
  { slug: 'seated-cable-row-wide', name: 'Seated Cable Row (Wide Grip)', muscle: 'Back', equipment: 'Cable', type: 'Compound' },
  { slug: 'high-row', name: 'High Row (Cable)', muscle: 'Back', equipment: 'Cable', type: 'Compound' },
  { slug: 'low-row', name: 'Low Row (Cable)', muscle: 'Back', equipment: 'Cable', type: 'Compound' },
  { slug: 'pull-up-wide', name: 'Pull-Up (Wide Grip)', muscle: 'Back', equipment: 'Bodyweight', type: 'Compound' },
  { slug: 'pull-up-close', name: 'Pull-Up (Close Grip)', muscle: 'Back', equipment: 'Bodyweight', type: 'Compound' },
  { slug: 'chin-up', name: 'Chin-Up', muscle: 'Back', equipment: 'Bodyweight', type: 'Compound' },
  { slug: 'weighted-pull-up', name: 'Weighted Pull-Up', muscle: 'Back', equipment: 'Bodyweight', type: 'Compound' },
  { slug: 'lat-pulldown-wide', name: 'Lat Pulldown (Wide Grip)', muscle: 'Back', equipment: 'Cable', type: 'Compound' },
  { slug: 'lat-pulldown-close', name: 'Lat Pulldown (Close Grip)', muscle: 'Back', equipment: 'Cable', type: 'Compound' },
  { slug: 'straight-arm-pulldown', name: 'Straight-Arm Pulldown', muscle: 'Back', equipment: 'Cable', type: 'Isolation' },
  { slug: 'good-morning', name: 'Good Morning', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  { slug: 'hyperextension', name: 'Back Extension / Hyperextension', muscle: 'Back', equipment: 'Machine', type: 'Isolation' },
  { slug: 'rack-pull', name: 'Rack Pull', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  { slug: 'meadows-row', name: 'Meadows Row', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  // SHOULDERS
  { slug: 'barbell-ohp-standing', name: 'Barbell Overhead Press (Standing)', muscle: 'Shoulders', equipment: 'Barbell', type: 'Compound' },
  { slug: 'barbell-ohp-seated', name: 'Barbell Overhead Press (Seated)', muscle: 'Shoulders', equipment: 'Barbell', type: 'Compound' },
  { slug: 'dumbbell-shoulder-press-standing', name: 'Dumbbell Shoulder Press (Standing)', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'dumbbell-shoulder-press-seated', name: 'Dumbbell Shoulder Press (Seated)', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'machine-shoulder-press', name: 'Machine Shoulder Press', muscle: 'Shoulders', equipment: 'Machine', type: 'Compound' },
  { slug: 'smith-machine-ohp', name: 'Smith Machine OHP', muscle: 'Shoulders', equipment: 'Machine', type: 'Compound' },
  { slug: 'arnold-press', name: 'Arnold Press', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'cable-lateral-raise', name: 'Cable Lateral Raise', muscle: 'Shoulders', equipment: 'Cable', type: 'Isolation' },
  { slug: 'machine-lateral-raise', name: 'Machine Lateral Raise', muscle: 'Shoulders', equipment: 'Machine', type: 'Isolation' },
  { slug: 'upright-row-barbell', name: 'Upright Row (Barbell)', muscle: 'Shoulders', equipment: 'Barbell', type: 'Compound' },
  { slug: 'upright-row-dumbbell', name: 'Upright Row (Dumbbell)', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'face-pull', name: 'Face Pull', muscle: 'Shoulders', equipment: 'Cable', type: 'Isolation' },
  { slug: 'rear-delt-fly-dumbbell', name: 'Rear Delt Fly (Dumbbell)', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'rear-delt-fly-machine', name: 'Rear Delt Fly (Pec Deck Reverse)', muscle: 'Shoulders', equipment: 'Machine', type: 'Isolation' },
  { slug: 'front-raise-dumbbell', name: 'Front Raise (Dumbbell)', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'front-raise-barbell', name: 'Front Raise (Barbell)', muscle: 'Shoulders', equipment: 'Barbell', type: 'Isolation' },
  { slug: 'cable-front-raise', name: 'Cable Front Raise', muscle: 'Shoulders', equipment: 'Cable', type: 'Isolation' },
  // BICEPS
  { slug: 'barbell-curl', name: 'Barbell Curl', muscle: 'Biceps', equipment: 'Barbell', type: 'Isolation' },
  { slug: 'ez-bar-curl', name: 'EZ Bar Curl', muscle: 'Biceps', equipment: 'Barbell', type: 'Isolation' },
  { slug: 'dumbbell-curl-standing', name: 'Dumbbell Curl (Standing)', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'dumbbell-curl-seated', name: 'Dumbbell Curl (Seated)', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'hammer-curl', name: 'Hammer Curl', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'preacher-curl-barbell', name: 'Preacher Curl (Barbell)', muscle: 'Biceps', equipment: 'Barbell', type: 'Isolation' },
  { slug: 'preacher-curl-dumbbell', name: 'Preacher Curl (Dumbbell)', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'preacher-curl-machine', name: 'Preacher Curl (Machine)', muscle: 'Biceps', equipment: 'Machine', type: 'Isolation' },
  { slug: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'cable-curl', name: 'Cable Curl (Low Pulley)', muscle: 'Biceps', equipment: 'Cable', type: 'Isolation' },
  { slug: 'bayesian-curl', name: 'Bayesian Curl', muscle: 'Biceps', equipment: 'Cable', type: 'Isolation' },
  { slug: 'concentration-curl', name: 'Concentration Curl', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'spider-curl', name: 'Spider Curl', muscle: 'Biceps', equipment: 'Barbell', type: 'Isolation' },
  { slug: 'cross-body-hammer-curl', name: 'Cross Body Hammer Curl', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'reverse-curl', name: 'Reverse Curl', muscle: 'Biceps', equipment: 'Barbell', type: 'Isolation' },
  { slug: 'zottman-curl', name: 'Zottman Curl', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  // TRICEPS
  { slug: 'close-grip-bench-press', name: 'Close Grip Bench Press', muscle: 'Triceps', equipment: 'Barbell', type: 'Compound' },
  { slug: 'skull-crusher-ez', name: 'Skull Crusher (EZ Bar)', muscle: 'Triceps', equipment: 'Barbell', type: 'Isolation' },
  { slug: 'skull-crusher-dumbbell', name: 'Skull Crusher (Dumbbell)', muscle: 'Triceps', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'overhead-dumbbell-extension', name: 'Overhead Dumbbell Extension', muscle: 'Triceps', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'overhead-cable-extension', name: 'Overhead Cable Extension', muscle: 'Triceps', equipment: 'Cable', type: 'Isolation' },
  { slug: 'rope-pushdown', name: 'Rope Pushdown', muscle: 'Triceps', equipment: 'Cable', type: 'Isolation' },
  { slug: 'straight-bar-pushdown', name: 'Straight Bar Pushdown', muscle: 'Triceps', equipment: 'Cable', type: 'Isolation' },
  { slug: 'v-bar-pushdown', name: 'V-Bar Pushdown', muscle: 'Triceps', equipment: 'Cable', type: 'Isolation' },
  { slug: 'dips-tricep', name: 'Dips (Tricep Focus)', muscle: 'Triceps', equipment: 'Bodyweight', type: 'Compound' },
  { slug: 'diamond-push-up', name: 'Diamond Push-Up', muscle: 'Triceps', equipment: 'Bodyweight', type: 'Compound' },
  { slug: 'tate-press', name: 'Tate Press', muscle: 'Triceps', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'single-arm-pushdown', name: 'Single Arm Cable Pushdown', muscle: 'Triceps', equipment: 'Cable', type: 'Isolation' },
  { slug: 'kickback-dumbbell', name: 'Kickback (Dumbbell)', muscle: 'Triceps', equipment: 'Dumbbell', type: 'Isolation' },
  // LEGS
  { slug: 'back-squat', name: 'Back Squat', muscle: 'Legs', equipment: 'Barbell', type: 'Compound' },
  { slug: 'front-squat', name: 'Front Squat', muscle: 'Legs', equipment: 'Barbell', type: 'Compound' },
  { slug: 'hack-squat', name: 'Hack Squat', muscle: 'Legs', equipment: 'Machine', type: 'Compound' },
  { slug: 'pendulum-squat', name: 'Pendulum Squat', muscle: 'Legs', equipment: 'Machine', type: 'Compound' },
  { slug: 'leg-press', name: 'Leg Press', muscle: 'Legs', equipment: 'Machine', type: 'Compound' },
  { slug: 'leg-extension', name: 'Leg Extension', muscle: 'Legs', equipment: 'Machine', type: 'Isolation' },
  { slug: 'walking-lunge', name: 'Walking Lunge', muscle: 'Legs', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'barbell-lunge', name: 'Barbell Lunge', muscle: 'Legs', equipment: 'Barbell', type: 'Compound' },
  { slug: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscle: 'Legs', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'step-up', name: 'Step-Up', muscle: 'Legs', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'sissy-squat', name: 'Sissy Squat', muscle: 'Legs', equipment: 'Bodyweight', type: 'Isolation' },
  { slug: 'goblet-squat', name: 'Goblet Squat', muscle: 'Legs', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'romanian-deadlift-dumbbell', name: 'Romanian Deadlift (Dumbbell)', muscle: 'Legs', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'lying-leg-curl', name: 'Lying Leg Curl', muscle: 'Legs', equipment: 'Machine', type: 'Isolation' },
  { slug: 'seated-leg-curl', name: 'Seated Leg Curl', muscle: 'Legs', equipment: 'Machine', type: 'Isolation' },
  { slug: 'standing-leg-curl', name: 'Standing Leg Curl', muscle: 'Legs', equipment: 'Machine', type: 'Isolation' },
  { slug: 'nordic-hamstring-curl', name: 'Nordic Hamstring Curl', muscle: 'Legs', equipment: 'Bodyweight', type: 'Isolation' },
  { slug: 'stiff-leg-deadlift', name: 'Stiff-Leg Deadlift', muscle: 'Legs', equipment: 'Barbell', type: 'Compound' },
  { slug: 'single-leg-deadlift', name: 'Single-Leg Deadlift', muscle: 'Legs', equipment: 'Dumbbell', type: 'Compound' },
  // GLUTES
  { slug: 'barbell-hip-thrust', name: 'Barbell Hip Thrust', muscle: 'Glutes', equipment: 'Barbell', type: 'Compound' },
  { slug: 'machine-hip-thrust', name: 'Machine Hip Thrust', muscle: 'Glutes', equipment: 'Machine', type: 'Compound' },
  { slug: 'glute-bridge-barbell', name: 'Glute Bridge (Barbell)', muscle: 'Glutes', equipment: 'Barbell', type: 'Isolation' },
  { slug: 'glute-bridge-bodyweight', name: 'Glute Bridge (Bodyweight)', muscle: 'Glutes', equipment: 'Bodyweight', type: 'Isolation' },
  { slug: 'cable-kickback', name: 'Cable Kickback', muscle: 'Glutes', equipment: 'Cable', type: 'Isolation' },
  { slug: 'abductor-machine', name: 'Abductor Machine', muscle: 'Glutes', equipment: 'Machine', type: 'Isolation' },
  { slug: 'adductor-machine', name: 'Adductor Machine', muscle: 'Glutes', equipment: 'Machine', type: 'Isolation' },
  { slug: 'sumo-deadlift', name: 'Sumo Deadlift', muscle: 'Glutes', equipment: 'Barbell', type: 'Compound' },
  // CORE
  { slug: 'cable-crunch', name: 'Cable Crunch', muscle: 'Core', equipment: 'Cable', type: 'Isolation' },
  { slug: 'machine-crunch', name: 'Machine Crunch', muscle: 'Core', equipment: 'Machine', type: 'Isolation' },
  { slug: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { slug: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', muscle: 'Core', equipment: 'Equipment', type: 'Isolation' },
  { slug: 'plank', name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { slug: 'side-plank', name: 'Side Plank', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { slug: 'pallof-press', name: 'Pallof Press', muscle: 'Core', equipment: 'Cable', type: 'Isolation' },
  { slug: 'hollow-hold', name: 'Hollow Hold', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { slug: 'dragon-flag', name: 'Dragon Flag', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  // CALVES
  { slug: 'standing-calf-raise', name: 'Standing Calf Raise (Machine)', muscle: 'Calves', equipment: 'Machine', type: 'Isolation' },
  { slug: 'seated-calf-raise', name: 'Seated Calf Raise', muscle: 'Calves', equipment: 'Machine', type: 'Isolation' },
  { slug: 'donkey-calf-raise', name: 'Donkey Calf Raise', muscle: 'Calves', equipment: 'Machine', type: 'Isolation' },
  { slug: 'single-leg-calf-raise', name: 'Single-Leg Calf Raise', muscle: 'Calves', equipment: 'Bodyweight', type: 'Isolation' },
  { slug: 'leg-press-calf-raise', name: 'Leg Press Calf Raise', muscle: 'Calves', equipment: 'Machine', type: 'Isolation' },
  // FOREARMS
  { slug: 'wrist-curl-barbell', name: 'Wrist Curl (Barbell)', muscle: 'Forearms', equipment: 'Barbell', type: 'Isolation' },
  { slug: 'wrist-curl-dumbbell', name: 'Wrist Curl (Dumbbell)', muscle: 'Forearms', equipment: 'Dumbbell', type: 'Isolation' },
  { slug: 'reverse-wrist-curl', name: 'Reverse Wrist Curl', muscle: 'Forearms', equipment: 'Barbell', type: 'Isolation' },
  { slug: 'farmers-walk', name: "Farmer's Walk", muscle: 'Forearms', equipment: 'Dumbbell', type: 'Compound' },
  { slug: 'dead-hang', name: 'Dead Hang', muscle: 'Forearms', equipment: 'Bodyweight', type: 'Isolation' },
];

const TYPE_COLOR: Record<string, string> = { Compound: '#FF5A3C', Isolation: '#3CC5FF' };
const EQUIP_COLOR: Record<string, string> = {
  Barbell: '#FFC53C', Dumbbell: '#B57BFF', Machine: '#8A939C',
  Cable: '#3CC5FF', Bodyweight: '#C6F135', Equipment: '#FF9EAF',
};

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LibraryPage() {
  const [tab, setTab] = useState<'mine' | 'exercises' | 'programs'>('mine');

  // My Library state
  const [mySlugs, setMySlugs] = useState<string[]>([]);
  const [myLoading, setMyLoading] = useState(true);

  // Program state
  const [programData, setProgramData] = useState<ActiveProgram | null>(null);
  const [programLoading, setProgramLoading] = useState(true);

  // Exercise tab state
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Programs tab state
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editSlugs, setEditSlugs] = useState<string[]>([]);
  const [progSaving, setProgSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  // Load my library + program on mount
  useEffect(() => {
    fetch('/api/my-exercises')
      .then(r => r.json())
      .then((data: DBExercise[]) => { setMySlugs(data.map(e => e.slug)); setMyLoading(false); })
      .catch(() => setMyLoading(false));
    fetch('/api/program')
      .then(r => r.json())
      .then((data: ActiveProgram) => { setProgramData(data); setProgramLoading(false); })
      .catch(() => setProgramLoading(false));
  }, []);

  const toggleMyExercise = useCallback(async (slug: string, inLibrary: boolean) => {
    const action = inLibrary ? 'remove' : 'add';
    setMySlugs(prev => inLibrary ? prev.filter(s => s !== slug) : [...prev, slug]);
    await fetch('/api/my-exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, slug }),
    });
    showToast(inLibrary ? 'Removed from library' : 'Added to library');
  }, []);

  const setActiveProgram = useCallback(async (splitKey: string) => {
    setProgSaving(true);
    await fetch('/api/program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', split: splitKey }),
    });
    const r = await fetch('/api/program');
    const data: ActiveProgram = await r.json();
    setProgramData(data);
    setProgSaving(false);
    showToast('Program activated');
  }, []);

  const advanceDay = useCallback(async () => {
    setProgSaving(true);
    await fetch('/api/program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'advance' }),
    });
    const r = await fetch('/api/program');
    const data: ActiveProgram = await r.json();
    setProgramData(data);
    setProgSaving(false);
    setExpandedDay(null);
  }, []);

  const startEditDay = (dayIdx: number) => {
    if (!programData?.active) return;
    const def = PROGRAMS.find(p => p.key === programData.split);
    if (!def) return;
    const dayDef = def.days[dayIdx];
    setEditSlugs(dayDef.exercises.map(e => e.slug));
    setEditingDay(dayIdx);
  };

  const saveEditDay = useCallback(async () => {
    if (editingDay === null || !programData?.active) return;
    setProgSaving(true);
    await fetch('/api/program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'customize', daySlot: editingDay, slugs: editSlugs }),
    });
    const r = await fetch('/api/program');
    const data: ActiveProgram = await r.json();
    setProgramData(data);
    setEditingDay(null);
    setProgSaving(false);
    showToast('Day saved');
  }, [editingDay, editSlugs, programData]);

  // ── MY LIBRARY tab ─────────────────────────────────────────────────────────
  const renderMyLibrary = () => {
    if (myLoading) return <div style={{ textAlign: 'center', padding: 40, color: '#4A5260' }}>Loading…</div>;
    const myExercises = LIBRARY_EXERCISES.filter(e => mySlugs.includes(e.slug));
    if (myExercises.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <i className="ph ph-clipboard" style={{ fontSize: 40, color: '#23282F', display: 'block', marginBottom: 12 }} />
          <div className="font-oswald" style={{ color: '#8A939C', letterSpacing: '.12em', marginBottom: 6 }}>YOUR LIBRARY IS EMPTY</div>
          <div style={{ fontSize: 13, color: '#4A5260', marginBottom: 20 }}>Go to the Exercises tab and tap + to add exercises you do.</div>
          <button
            onClick={() => setTab('exercises')}
            style={{ background: '#C6F135', color: '#0B0D10', borderRadius: 12, padding: '10px 20px', fontFamily: "'Oswald',sans-serif", fontSize: 13, letterSpacing: '.1em' }}
          >
            BROWSE EXERCISES
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {myExercises.map(ex => (
          <div key={ex.slug} style={{ background: '#14181D', border: '1px solid #1E2530', borderRadius: 10, padding: '11px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, color: '#E2E8F0', marginBottom: 4 }}>{ex.name}</div>
              <div style={{ display: 'flex', gap: 5 }}>
                <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, color: TYPE_COLOR[ex.type] ?? '#8A939C', background: `${TYPE_COLOR[ex.type] ?? '#8A939C'}14`, border: `1px solid ${TYPE_COLOR[ex.type] ?? '#8A939C'}28`, fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em' }}>{ex.type.toUpperCase()}</span>
                <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, color: EQUIP_COLOR[ex.equipment] ?? '#8A939C', background: `${EQUIP_COLOR[ex.equipment] ?? '#8A939C'}14`, border: `1px solid ${EQUIP_COLOR[ex.equipment] ?? '#8A939C'}28`, fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em' }}>{ex.equipment.toUpperCase()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 9, color: '#4A5260', fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em' }}>{ex.muscle.toUpperCase()}</span>
              <button
                onClick={() => toggleMyExercise(ex.slug, true)}
                style={{ width: 28, height: 28, borderRadius: 8, background: '#FF5A3C18', border: '1px solid #FF5A3C40', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <i className="ph ph-minus" style={{ fontSize: 14, color: '#FF5A3C' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── EXERCISES tab ──────────────────────────────────────────────────────────
  const filteredExercises = LIBRARY_EXERCISES.filter(e => {
    const matchMuscle = muscleFilter === 'All' || e.muscle === muscleFilter;
    const matchType = typeFilter === 'All' || e.type === typeFilter;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    return matchMuscle && matchType && matchSearch;
  });

  const renderExercises = () => (
    <>
      <input
        type="text"
        placeholder="Search exercises…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', background: '#14181D', border: '1px solid #23282F', borderRadius: 10, padding: '10px 14px', color: '#F2F5F7', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {['All', 'Compound', 'Isolation'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{ borderRadius: 8, padding: '5px 12px', fontSize: 11, fontFamily: "'Oswald',sans-serif", letterSpacing: '.08em', background: typeFilter === t ? '#C6F135' : '#14181D', color: typeFilter === t ? '#0B0D10' : '#8A939C', border: '1px solid #23282F', cursor: 'pointer' }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
        {MUSCLE_GROUPS.map(m => (
          <button key={m} onClick={() => setMuscleFilter(m)} style={{ borderRadius: 7, padding: '4px 10px', fontSize: 10, fontFamily: "'Oswald',sans-serif", letterSpacing: '.08em', background: muscleFilter === m ? '#23282F' : 'transparent', color: muscleFilter === m ? '#F2F5F7' : '#4A5260', border: `1px solid ${muscleFilter === m ? '#3A4250' : '#1E2530'}`, cursor: 'pointer' }}>
            {m.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 9, letterSpacing: '.14em', color: '#4A5260', marginBottom: 8, fontFamily: "'Oswald',sans-serif" }}>
        {filteredExercises.length} EXERCISES
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {filteredExercises.map(ex => {
          const inLib = mySlugs.includes(ex.slug);
          return (
            <div key={ex.slug} style={{ background: '#14181D', border: '1px solid #1E2530', borderRadius: 10, padding: '11px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, color: '#E2E8F0', marginBottom: 4 }}>{ex.name}</div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, color: TYPE_COLOR[ex.type] ?? '#8A939C', background: `${TYPE_COLOR[ex.type] ?? '#8A939C'}14`, border: `1px solid ${TYPE_COLOR[ex.type] ?? '#8A939C'}28`, fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em' }}>{ex.type.toUpperCase()}</span>
                  <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, color: EQUIP_COLOR[ex.equipment] ?? '#8A939C', background: `${EQUIP_COLOR[ex.equipment] ?? '#8A939C'}14`, border: `1px solid ${EQUIP_COLOR[ex.equipment] ?? '#8A939C'}28`, fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em' }}>{ex.equipment.toUpperCase()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 9, color: '#4A5260', fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em' }}>{ex.muscle.toUpperCase()}</span>
                <button
                  onClick={() => toggleMyExercise(ex.slug, inLib)}
                  style={{ width: 28, height: 28, borderRadius: 8, background: inLib ? '#C6F13518' : '#14181D', border: `1px solid ${inLib ? '#C6F135' : '#3A4250'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <i className={`ph ${inLib ? 'ph-check' : 'ph-plus'}`} style={{ fontSize: 14, color: inLib ? '#C6F135' : '#8A939C' }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  // ── PROGRAMS tab ───────────────────────────────────────────────────────────
  const renderPrograms = () => {
    if (programLoading) return <div style={{ textAlign: 'center', padding: 40, color: '#4A5260' }}>Loading…</div>;

    // Edit mode overlay
    if (editingDay !== null && programData?.active) {
      const def = PROGRAMS.find(p => p.key === programData.split);
      const dayDef = def?.days[editingDay];
      if (!dayDef) return null;
      return (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button onClick={() => setEditingDay(null)} style={{ background: 'transparent', border: 'none', color: '#8A939C', cursor: 'pointer', padding: 0 }}>
              <i className="ph ph-arrow-left" style={{ fontSize: 20 }} />
            </button>
            <div>
              <div className="font-oswald" style={{ fontSize: 10, letterSpacing: '.18em', color: '#4A5260' }}>EDITING</div>
              <div className="font-oswald" style={{ fontSize: 18 }}>{dayDef.name}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#8A939C', marginBottom: 12 }}>Tap to toggle exercises in/out of this day.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {dayDef.exercises.map(ex => {
              const isIn = editSlugs.includes(ex.slug);
              return (
                <button
                  key={ex.slug}
                  onClick={() => setEditSlugs(prev => isIn ? prev.filter(s => s !== ex.slug) : [...prev, ex.slug])}
                  style={{ background: isIn ? '#14181D' : '#0F1215', border: `1px solid ${isIn ? '#23282F' : '#1A1F26'}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 13, color: isIn ? '#F2F5F7' : '#4A5260' }}>{ex.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: isIn ? '#8A939C' : '#2A3040' }}>{ex.sets}×{ex.reps}</span>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: isIn ? '#C6F13520' : 'transparent', border: `1px solid ${isIn ? '#C6F135' : '#2A3040'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isIn && <i className="ph-fill ph-check" style={{ fontSize: 12, color: '#C6F135' }} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={saveEditDay}
            disabled={progSaving || editSlugs.length === 0}
            style={{ width: '100%', background: editSlugs.length > 0 ? '#C6F135' : '#23282F', color: editSlugs.length > 0 ? '#0B0D10' : '#4A5260', borderRadius: 12, padding: '13px 0', fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: '.08em', opacity: progSaving ? 0.6 : 1, cursor: editSlugs.length > 0 ? 'pointer' : 'default' }}
          >
            {progSaving ? 'SAVING…' : `SAVE DAY (${editSlugs.length} exercises)`}
          </button>
        </div>
      );
    }

    return (
      <>
        {/* Program chooser */}
        <div className="font-oswald" style={{ fontSize: 10, letterSpacing: '.18em', color: '#4A5260', marginBottom: 8 }}>CHOOSE A PROGRAM</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {PROGRAMS.map(prog => {
            const isActive = programData?.active && programData.split === prog.key;
            return (
              <button
                key={prog.key}
                onClick={() => !isActive && setActiveProgram(prog.key)}
                style={{ background: isActive ? `${prog.color}18` : '#14181D', border: `1px solid ${isActive ? prog.color + '60' : '#23282F'}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: isActive ? 'default' : 'pointer', width: '100%' }}
              >
                <div style={{ flex: 1 }}>
                  <div className="font-oswald" style={{ fontSize: 16, color: isActive ? prog.color : '#F2F5F7' }}>{prog.label}</div>
                  <div style={{ fontSize: 11, color: '#8A939C', marginTop: 2 }}>{prog.days.length} days per cycle</div>
                </div>
                {isActive ? (
                  <span style={{ fontSize: 9, color: prog.color, fontFamily: "'Oswald',sans-serif", letterSpacing: '.12em', background: `${prog.color}14`, border: `1px solid ${prog.color}40`, borderRadius: 6, padding: '3px 8px' }}>ACTIVE</span>
                ) : (
                  <i className="ph ph-caret-right" style={{ color: '#4A5260', fontSize: 16 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Active program schedule */}
        {programData?.active && (() => {
          const def = PROGRAMS.find(p => p.key === programData.split);
          if (!def) return null;
          return (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div className="font-oswald" style={{ fontSize: 10, letterSpacing: '.18em', color: '#4A5260' }}>SCHEDULE</div>
                <button
                  onClick={advanceDay}
                  disabled={progSaving}
                  style={{ fontSize: 11, fontFamily: "'Oswald',sans-serif", color: '#C6F135', letterSpacing: '.1em', background: 'transparent', border: '1px solid #C6F13550', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', opacity: progSaving ? 0.5 : 1 }}
                >
                  ADVANCE DAY →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {def.days.map((day, i) => {
                  const isToday = i === programData.cycleDay;
                  const expanded = expandedDay === i;
                  return (
                    <div key={i} style={{ background: '#14181D', border: `1px solid ${expanded ? def.color + '50' : isToday ? def.color + '40' : '#23282F'}`, borderRadius: 14, overflow: 'hidden' }}>
                      <button
                        onClick={() => setExpandedDay(expanded ? null : i)}
                        style={{ width: '100%', background: 'transparent', border: 'none', padding: '13px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', color: 'inherit' }}
                      >
                        <div style={{ width: 3, height: 34, borderRadius: 2, background: isToday ? def.color : '#2A3040', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div className="font-oswald" style={{ fontSize: 10, letterSpacing: '.18em', color: isToday ? def.color : '#4A5260', marginBottom: 2 }}>
                            {day.tag}{isToday ? ' · TODAY' : ''}
                          </div>
                          <div className="font-oswald" style={{ fontSize: 16, color: isToday ? '#F2F5F7' : '#8A939C' }}>{day.name}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 9, color: '#4A5260', fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em' }}>{day.exercises.length} EX</span>
                          <i className="ph ph-caret-right" style={{ color: '#4A5260', fontSize: 16, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                      </button>
                      {expanded && (
                        <div style={{ borderTop: `1px solid ${def.color}28` }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px 64px', padding: '7px 16px', fontSize: 9, letterSpacing: '.14em', color: '#4A5260', fontFamily: "'Oswald',sans-serif", background: '#111518' }}>
                            <span>EXERCISE</span><span style={{ textAlign: 'center' }}>SETS</span><span style={{ textAlign: 'center' }}>REPS</span>
                          </div>
                          {day.exercises.map((ex, j) => (
                            <div key={j} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 64px', padding: '10px 16px', alignItems: 'center', background: j % 2 === 0 ? '#13171C' : '#14181D', borderTop: '1px solid #1A1F26' }}>
                              <span style={{ fontSize: 13 }}>{ex.name}</span>
                              <span style={{ textAlign: 'center', fontFamily: "'Oswald',sans-serif", fontSize: 15, color: def.color }}>{ex.sets}</span>
                              <span style={{ textAlign: 'center', fontSize: 11, color: '#8A939C' }}>{ex.reps}</span>
                            </div>
                          ))}
                          <div style={{ padding: '10px 16px', borderTop: `1px solid ${def.color}20` }}>
                            <button
                              onClick={() => startEditDay(i)}
                              style={{ fontSize: 11, fontFamily: "'Oswald',sans-serif", color: '#8A939C', letterSpacing: '.1em', background: 'transparent', border: '1px solid #23282F', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}
                            >
                              EDIT DAY
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
      </>
    );
  };

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>
      <div style={{ padding: '16px 20px 104px' }}>
        <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: '#8A939C', marginTop: 6 }}>WORKOUT PLANNER</div>
        <div className="font-oswald" style={{ fontSize: 24, marginBottom: 16, marginTop: 3 }}>LIBRARY</div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: '#14181D', border: '1px solid #23282F', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16 }}>
          {([
            { key: 'mine' as const, label: `MY LIBRARY${mySlugs.length > 0 ? ` (${mySlugs.length})` : ''}` },
            { key: 'exercises' as const, label: 'EXERCISES' },
            { key: 'programs' as const, label: 'PROGRAMS' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{ flex: 1, borderRadius: 9, padding: '8px 0', background: tab === key ? '#C6F135' : 'transparent', color: tab === key ? '#0B0D10' : '#8A939C', border: 'none', cursor: 'pointer', fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: '.1em' }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'mine' && renderMyLibrary()}
        {tab === 'exercises' && renderExercises()}
        {tab === 'programs' && renderPrograms()}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#23282F', border: '1px solid #3A4250', borderRadius: 10, padding: '10px 20px', fontSize: 13, color: '#F2F5F7', zIndex: 200, whiteSpace: 'nowrap' }}>
          {toastMsg}
        </div>
      )}

      <AppNav />
    </main>
  );
}
