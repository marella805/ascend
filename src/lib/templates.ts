// Workout template definitions for PPL and Upper/Lower splits

export type TemplateKey = 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'free';

export type WorkoutTemplate = {
  key: TemplateKey;
  name: string;
  shortName: string;
  color: string;
  next: TemplateKey;       // what comes after in rotation
  patterns: string[];      // movement_pattern values included
  accessorySlugs: string[]; // isolation exercises not caught by pattern
  icon: string;
};

export const TEMPLATES: Record<TemplateKey, WorkoutTemplate> = {
  push: {
    key: 'push',
    name: 'Push Day',
    shortName: 'Push',
    color: '#FF5A3C',
    next: 'pull',
    patterns: ['horizontal_push', 'vertical_push'],
    accessorySlugs: ['tricep-pushdown', 'skull-crusher', 'lateral-raise', 'chest-fly'],
    icon: 'ph-bold ph-arrow-fat-lines-up',
  },
  pull: {
    key: 'pull',
    name: 'Pull Day',
    shortName: 'Pull',
    color: '#3CC5FF',
    next: 'legs',
    patterns: ['vertical_pull', 'horizontal_pull'],
    accessorySlugs: ['barbell-curl', 'dumbbell-curl', 'hammer-curl', 'face-pull'],
    icon: 'ph-bold ph-arrow-fat-lines-down',
  },
  legs: {
    key: 'legs',
    name: 'Leg Day',
    shortName: 'Legs',
    color: '#B57BFF',
    next: 'push',
    patterns: ['squat', 'hinge', 'lunge'],
    accessorySlugs: ['leg-curl', 'leg-extension', 'calf-raise', 'hip-thrust'],
    icon: 'ph-bold ph-person-simple-walk',
  },
  upper: {
    key: 'upper',
    name: 'Upper Body',
    shortName: 'Upper',
    color: '#FFC53C',
    next: 'lower',
    patterns: ['horizontal_push', 'vertical_push', 'vertical_pull', 'horizontal_pull'],
    accessorySlugs: ['barbell-curl', 'dumbbell-curl', 'hammer-curl', 'tricep-pushdown', 'lateral-raise', 'face-pull'],
    icon: 'ph-bold ph-person-arms-spread',
  },
  lower: {
    key: 'lower',
    name: 'Lower Body',
    shortName: 'Lower',
    color: '#4ADE80',
    next: 'upper',
    patterns: ['squat', 'hinge', 'lunge'],
    accessorySlugs: ['leg-curl', 'leg-extension', 'calf-raise', 'hip-thrust'],
    icon: 'ph-bold ph-person-simple-run',
  },
  free: {
    key: 'free',
    name: 'Free Workout',
    shortName: 'Free',
    color: '#8A939C',
    next: 'free',
    patterns: [],
    accessorySlugs: [],
    icon: 'ph-bold ph-shuffle',
  },
};

export const PPL_ORDER: TemplateKey[] = ['push', 'pull', 'legs'];
export const UL_ORDER: TemplateKey[] = ['upper', 'lower'];

export function getNextTemplate(lastKey: TemplateKey): WorkoutTemplate {
  return TEMPLATES[TEMPLATES[lastKey]?.next ?? 'push'];
}

export function isStrengthTemplate(key: TemplateKey): boolean {
  return key !== 'free';
}
