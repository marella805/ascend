'use client';

import { useState } from 'react';
import { AppNav } from '@/components/AppNav';

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core', 'Forearms', 'Calves'];

type Exercise = { name: string; muscle: string; equipment: string; type: string };

const EXERCISES: Exercise[] = [
  // CHEST
  { name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell', type: 'Compound' },
  { name: 'Dumbbell Bench Press', muscle: 'Chest', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Incline Barbell Press', muscle: 'Chest', equipment: 'Barbell', type: 'Compound' },
  { name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Decline Barbell Press', muscle: 'Chest', equipment: 'Barbell', type: 'Compound' },
  { name: 'Decline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Smith Machine Bench Press', muscle: 'Chest', equipment: 'Machine', type: 'Compound' },
  { name: 'Smith Machine Incline Press', muscle: 'Chest', equipment: 'Machine', type: 'Compound' },
  { name: 'Cable Fly (Low to High)', muscle: 'Chest', equipment: 'Cable', type: 'Isolation' },
  { name: 'Cable Fly (High to Low)', muscle: 'Chest', equipment: 'Cable', type: 'Isolation' },
  { name: 'Cable Crossover', muscle: 'Chest', equipment: 'Cable', type: 'Isolation' },
  { name: 'Pec Deck / Machine Fly', muscle: 'Chest', equipment: 'Machine', type: 'Isolation' },
  { name: 'Dumbbell Fly', muscle: 'Chest', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Incline Dumbbell Fly', muscle: 'Chest', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Push-Up', muscle: 'Chest', equipment: 'Bodyweight', type: 'Compound' },
  { name: 'Decline Push-Up', muscle: 'Chest', equipment: 'Bodyweight', type: 'Compound' },
  { name: 'Dips (Chest Focus)', muscle: 'Chest', equipment: 'Bodyweight', type: 'Compound' },
  { name: 'Landmine Press', muscle: 'Chest', equipment: 'Barbell', type: 'Compound' },
  // BACK
  { name: 'Conventional Deadlift', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  { name: 'Romanian Deadlift', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  { name: 'Barbell Row (Bent Over)', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  { name: 'Pendlay Row', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  { name: 'T-Bar Row', muscle: 'Back', equipment: 'Machine', type: 'Compound' },
  { name: 'Single-Arm Dumbbell Row', muscle: 'Back', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Chest Supported Row', muscle: 'Back', equipment: 'Machine', type: 'Compound' },
  { name: 'Iso Lateral Row', muscle: 'Back', equipment: 'Machine', type: 'Compound' },
  { name: 'Seated Cable Row (Close Grip)', muscle: 'Back', equipment: 'Cable', type: 'Compound' },
  { name: 'Seated Cable Row (Wide Grip)', muscle: 'Back', equipment: 'Cable', type: 'Compound' },
  { name: 'High Row (Cable)', muscle: 'Back', equipment: 'Cable', type: 'Compound' },
  { name: 'Low Row (Cable)', muscle: 'Back', equipment: 'Cable', type: 'Compound' },
  { name: 'Pull-Up (Wide Grip)', muscle: 'Back', equipment: 'Bodyweight', type: 'Compound' },
  { name: 'Pull-Up (Close Grip)', muscle: 'Back', equipment: 'Bodyweight', type: 'Compound' },
  { name: 'Chin-Up', muscle: 'Back', equipment: 'Bodyweight', type: 'Compound' },
  { name: 'Weighted Pull-Up', muscle: 'Back', equipment: 'Bodyweight', type: 'Compound' },
  { name: 'Lat Pulldown (Wide Grip)', muscle: 'Back', equipment: 'Cable', type: 'Compound' },
  { name: 'Lat Pulldown (Close Grip)', muscle: 'Back', equipment: 'Cable', type: 'Compound' },
  { name: 'Straight-Arm Pulldown', muscle: 'Back', equipment: 'Cable', type: 'Isolation' },
  { name: 'Good Morning', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  { name: 'Back Extension / Hyperextension', muscle: 'Back', equipment: 'Machine', type: 'Isolation' },
  { name: 'Rack Pull', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  { name: 'Meadows Row', muscle: 'Back', equipment: 'Barbell', type: 'Compound' },
  // SHOULDERS
  { name: 'Barbell Overhead Press (Standing)', muscle: 'Shoulders', equipment: 'Barbell', type: 'Compound' },
  { name: 'Barbell Overhead Press (Seated)', muscle: 'Shoulders', equipment: 'Barbell', type: 'Compound' },
  { name: 'Dumbbell Shoulder Press (Standing)', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Dumbbell Shoulder Press (Seated)', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Machine Shoulder Press', muscle: 'Shoulders', equipment: 'Machine', type: 'Compound' },
  { name: 'Smith Machine OHP', muscle: 'Shoulders', equipment: 'Machine', type: 'Compound' },
  { name: 'Arnold Press', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Dumbbell Lateral Raise', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Cable Lateral Raise', muscle: 'Shoulders', equipment: 'Cable', type: 'Isolation' },
  { name: 'Machine Lateral Raise', muscle: 'Shoulders', equipment: 'Machine', type: 'Isolation' },
  { name: 'Upright Row (Barbell)', muscle: 'Shoulders', equipment: 'Barbell', type: 'Compound' },
  { name: 'Upright Row (Dumbbell)', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Face Pull', muscle: 'Shoulders', equipment: 'Cable', type: 'Isolation' },
  { name: 'Rear Delt Fly (Dumbbell)', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Rear Delt Fly (Pec Deck Reverse)', muscle: 'Shoulders', equipment: 'Machine', type: 'Isolation' },
  { name: 'Front Raise (Dumbbell)', muscle: 'Shoulders', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Front Raise (Barbell)', muscle: 'Shoulders', equipment: 'Barbell', type: 'Isolation' },
  { name: 'Cable Front Raise', muscle: 'Shoulders', equipment: 'Cable', type: 'Isolation' },
  // BICEPS
  { name: 'Barbell Curl', muscle: 'Biceps', equipment: 'Barbell', type: 'Isolation' },
  { name: 'EZ Bar Curl', muscle: 'Biceps', equipment: 'Barbell', type: 'Isolation' },
  { name: 'Dumbbell Curl (Standing)', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Dumbbell Curl (Seated)', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Hammer Curl', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Preacher Curl (Barbell)', muscle: 'Biceps', equipment: 'Barbell', type: 'Isolation' },
  { name: 'Preacher Curl (Dumbbell)', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Preacher Curl (Machine)', muscle: 'Biceps', equipment: 'Machine', type: 'Isolation' },
  { name: 'Incline Dumbbell Curl', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Cable Curl (Low Pulley)', muscle: 'Biceps', equipment: 'Cable', type: 'Isolation' },
  { name: 'Bayesian Curl', muscle: 'Biceps', equipment: 'Cable', type: 'Isolation' },
  { name: 'Concentration Curl', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Spider Curl', muscle: 'Biceps', equipment: 'Barbell', type: 'Isolation' },
  { name: 'Cross Body Hammer Curl', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Reverse Curl', muscle: 'Biceps', equipment: 'Barbell', type: 'Isolation' },
  { name: 'Zottman Curl', muscle: 'Biceps', equipment: 'Dumbbell', type: 'Isolation' },
  // TRICEPS
  { name: 'Close Grip Bench Press', muscle: 'Triceps', equipment: 'Barbell', type: 'Compound' },
  { name: 'Skull Crusher (EZ Bar)', muscle: 'Triceps', equipment: 'Barbell', type: 'Isolation' },
  { name: 'Skull Crusher (Dumbbell)', muscle: 'Triceps', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Overhead Dumbbell Extension', muscle: 'Triceps', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Overhead Cable Extension', muscle: 'Triceps', equipment: 'Cable', type: 'Isolation' },
  { name: 'Rope Pushdown', muscle: 'Triceps', equipment: 'Cable', type: 'Isolation' },
  { name: 'Straight Bar Pushdown', muscle: 'Triceps', equipment: 'Cable', type: 'Isolation' },
  { name: 'V-Bar Pushdown', muscle: 'Triceps', equipment: 'Cable', type: 'Isolation' },
  { name: 'Dips (Tricep Focus)', muscle: 'Triceps', equipment: 'Bodyweight', type: 'Compound' },
  { name: 'Diamond Push-Up', muscle: 'Triceps', equipment: 'Bodyweight', type: 'Compound' },
  { name: 'Tate Press', muscle: 'Triceps', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'JM Press', muscle: 'Triceps', equipment: 'Barbell', type: 'Isolation' },
  { name: 'Single Arm Cable Pushdown', muscle: 'Triceps', equipment: 'Cable', type: 'Isolation' },
  { name: 'Kickback (Dumbbell)', muscle: 'Triceps', equipment: 'Dumbbell', type: 'Isolation' },
  // LEGS
  { name: 'Back Squat', muscle: 'Legs', equipment: 'Barbell', type: 'Compound' },
  { name: 'Front Squat', muscle: 'Legs', equipment: 'Barbell', type: 'Compound' },
  { name: 'Hack Squat', muscle: 'Legs', equipment: 'Machine', type: 'Compound' },
  { name: 'Pendulum Squat', muscle: 'Legs', equipment: 'Machine', type: 'Compound' },
  { name: 'Leg Press', muscle: 'Legs', equipment: 'Machine', type: 'Compound' },
  { name: 'Leg Extension', muscle: 'Legs', equipment: 'Machine', type: 'Isolation' },
  { name: 'Walking Lunge', muscle: 'Legs', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Barbell Lunge', muscle: 'Legs', equipment: 'Barbell', type: 'Compound' },
  { name: 'Bulgarian Split Squat', muscle: 'Legs', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Step-Up', muscle: 'Legs', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Sissy Squat', muscle: 'Legs', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Goblet Squat', muscle: 'Legs', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Romanian Deadlift (Dumbbell)', muscle: 'Legs', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Lying Leg Curl', muscle: 'Legs', equipment: 'Machine', type: 'Isolation' },
  { name: 'Seated Leg Curl', muscle: 'Legs', equipment: 'Machine', type: 'Isolation' },
  { name: 'Standing Leg Curl', muscle: 'Legs', equipment: 'Machine', type: 'Isolation' },
  { name: 'Nordic Hamstring Curl', muscle: 'Legs', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Stiff-Leg Deadlift', muscle: 'Legs', equipment: 'Barbell', type: 'Compound' },
  { name: 'Single-Leg Deadlift', muscle: 'Legs', equipment: 'Dumbbell', type: 'Compound' },
  // GLUTES
  { name: 'Barbell Hip Thrust', muscle: 'Glutes', equipment: 'Barbell', type: 'Compound' },
  { name: 'Machine Hip Thrust', muscle: 'Glutes', equipment: 'Machine', type: 'Compound' },
  { name: 'Glute Bridge (Barbell)', muscle: 'Glutes', equipment: 'Barbell', type: 'Isolation' },
  { name: 'Glute Bridge (Bodyweight)', muscle: 'Glutes', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Cable Kickback', muscle: 'Glutes', equipment: 'Cable', type: 'Isolation' },
  { name: 'Abductor Machine', muscle: 'Glutes', equipment: 'Machine', type: 'Isolation' },
  { name: 'Adductor Machine', muscle: 'Glutes', equipment: 'Machine', type: 'Isolation' },
  { name: 'Sumo Deadlift', muscle: 'Glutes', equipment: 'Barbell', type: 'Compound' },
  { name: 'Donkey Kick', muscle: 'Glutes', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Fire Hydrant', muscle: 'Glutes', equipment: 'Bodyweight', type: 'Isolation' },
  // CORE
  { name: 'Cable Crunch', muscle: 'Core', equipment: 'Cable', type: 'Isolation' },
  { name: 'Machine Crunch', muscle: 'Core', equipment: 'Machine', type: 'Isolation' },
  { name: 'Hanging Leg Raise', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Ab Wheel Rollout', muscle: 'Core', equipment: 'Equipment', type: 'Isolation' },
  { name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Side Plank', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Pallof Press', muscle: 'Core', equipment: 'Cable', type: 'Isolation' },
  { name: 'Decline Crunch', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Russian Twist', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Dragon Flag', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Hollow Hold', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Dead Bug', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Bicycle Crunch', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'V-Up', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Reverse Crunch', muscle: 'Core', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Landmine Rotation', muscle: 'Core', equipment: 'Barbell', type: 'Isolation' },
  { name: 'Woodchop (Cable)', muscle: 'Core', equipment: 'Cable', type: 'Isolation' },
  // CALVES
  { name: 'Standing Calf Raise (Machine)', muscle: 'Calves', equipment: 'Machine', type: 'Isolation' },
  { name: 'Seated Calf Raise', muscle: 'Calves', equipment: 'Machine', type: 'Isolation' },
  { name: 'Donkey Calf Raise', muscle: 'Calves', equipment: 'Machine', type: 'Isolation' },
  { name: 'Single-Leg Calf Raise', muscle: 'Calves', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Leg Press Calf Raise', muscle: 'Calves', equipment: 'Machine', type: 'Isolation' },
  // FOREARMS
  { name: 'Wrist Curl (Barbell)', muscle: 'Forearms', equipment: 'Barbell', type: 'Isolation' },
  { name: 'Wrist Curl (Dumbbell)', muscle: 'Forearms', equipment: 'Dumbbell', type: 'Isolation' },
  { name: 'Reverse Wrist Curl', muscle: 'Forearms', equipment: 'Barbell', type: 'Isolation' },
  { name: 'Farmer\'s Walk', muscle: 'Forearms', equipment: 'Dumbbell', type: 'Compound' },
  { name: 'Dead Hang', muscle: 'Forearms', equipment: 'Bodyweight', type: 'Isolation' },
  { name: 'Plate Pinch', muscle: 'Forearms', equipment: 'Equipment', type: 'Isolation' },
  { name: 'Towel Pull-Up', muscle: 'Forearms', equipment: 'Bodyweight', type: 'Compound' },
];

type SplitExercise = { name: string; sets: string; reps: string };
type SplitDay = { name: string; tag: string; exercises: SplitExercise[] };
type Split = { label: string; color: string; days: SplitDay[] };

const SPLITS: Record<string, Split> = {
  PPL: {
    label: 'PPL (6-Day)',
    color: '#FF5A3C',
    days: [
      { name: 'Push (Heavy)', tag: 'MON', exercises: [
        { name: 'Incline Barbell Press', sets: '3', reps: '4–6' },
        { name: 'Smith Machine Bench Press', sets: '3', reps: '6–8' },
        { name: 'Dumbbell Lateral Raise', sets: '4', reps: '12–15' },
        { name: 'Cable Lateral Raise', sets: '2', reps: '15–20' },
        { name: 'Skull Crusher (EZ Bar)', sets: '3', reps: '8–10' },
      ]},
      { name: 'Pull (Lat Heavy)', tag: 'TUE', exercises: [
        { name: 'Weighted Pull-Up', sets: '4', reps: '5–7' },
        { name: 'Lat Pulldown (Wide Grip)', sets: '3', reps: '8–10' },
        { name: 'Lat Pulldown (Close Grip)', sets: '2', reps: '10–12' },
        { name: 'Face Pull', sets: '3', reps: '15–20' },
        { name: 'Preacher Curl (Dumbbell)', sets: '3', reps: '10–12' },
        { name: 'Hammer Curl', sets: '2', reps: '12' },
      ]},
      { name: 'Legs', tag: 'WED', exercises: [
        { name: 'Pendulum Squat', sets: '4', reps: '6–8' },
        { name: 'Leg Extension', sets: '3', reps: '12–15' },
        { name: 'Lying Leg Curl', sets: '3', reps: '10–12' },
        { name: 'Barbell Hip Thrust', sets: '4', reps: '10–12' },
        { name: 'Adductor Machine', sets: '3', reps: '15–20' },
        { name: 'Standing Calf Raise (Machine)', sets: '4', reps: '12–15' },
      ]},
      { name: 'Push (Volume)', tag: 'THU', exercises: [
        { name: 'Dumbbell Bench Press', sets: '4', reps: '10–12' },
        { name: 'Incline Dumbbell Press', sets: '3', reps: '10–12' },
        { name: 'Dips (Chest Focus)', sets: '3', reps: '8–12' },
        { name: 'Dumbbell Shoulder Press (Seated)', sets: '3', reps: '10–12' },
        { name: 'Dumbbell Lateral Raise', sets: '4', reps: '15–20' },
        { name: 'Straight Bar Pushdown', sets: '3', reps: '10–12' },
        { name: 'Overhead Dumbbell Extension', sets: '2', reps: '10–12' },
      ]},
      { name: 'Pull (Row Heavy)', tag: 'FRI', exercises: [
        { name: 'Chest Supported Row', sets: '4', reps: '6–8' },
        { name: 'T-Bar Row', sets: '3', reps: '8–10' },
        { name: 'Seated Cable Row (Close Grip)', sets: '3', reps: '10–12' },
        { name: 'Face Pull', sets: '3', reps: '15–20' },
        { name: 'EZ Bar Curl', sets: '3', reps: '10–12' },
        { name: 'Bayesian Curl', sets: '2', reps: '12–15' },
      ]},
      { name: 'Legs', tag: 'SAT', exercises: [
        { name: 'Romanian Deadlift', sets: '4', reps: '6–8' },
        { name: 'Leg Press', sets: '3', reps: '10–12' },
        { name: 'Seated Leg Curl', sets: '3', reps: '10–12' },
        { name: 'Machine Hip Thrust', sets: '3', reps: '10–12' },
        { name: 'Abductor Machine', sets: '3', reps: '15–20' },
        { name: 'Seated Calf Raise', sets: '4', reps: '15–20' },
      ]},
    ],
  },
  PPLA: {
    label: 'PPLA (7-Day)',
    color: '#B57BFF',
    days: [
      { name: 'Push', tag: 'MON', exercises: [
        { name: 'Incline Barbell Press', sets: '3', reps: '4–6' },
        { name: 'Smith Machine Bench Press', sets: '3', reps: '6–8' },
        { name: 'Dumbbell Lateral Raise', sets: '3', reps: '12–15' },
        { name: 'Cable Lateral Raise', sets: '3', reps: '15–20' },
        { name: 'Skull Crusher (EZ Bar)', sets: '3', reps: '8–10' },
      ]},
      { name: 'Pull', tag: 'TUE', exercises: [
        { name: 'Weighted Pull-Up', sets: '3', reps: '5–7' },
        { name: 'Lat Pulldown (Wide Grip)', sets: '2', reps: '8–10' },
        { name: 'Lat Pulldown (Close Grip)', sets: '2', reps: '10–12' },
        { name: 'Iso Lateral Row', sets: '2', reps: '8–10' },
        { name: 'Low Row (Cable)', sets: '2', reps: '10–12' },
        { name: 'Face Pull', sets: '3', reps: '15–20' },
        { name: 'Preacher Curl (Dumbbell)', sets: '3', reps: '10–12' },
        { name: 'Hammer Curl', sets: '2', reps: '12' },
      ]},
      { name: 'Legs', tag: 'WED', exercises: [
        { name: 'Pendulum Squat', sets: '4', reps: '6–8' },
        { name: 'Leg Extension', sets: '3', reps: '12–15' },
        { name: 'Seated Leg Curl', sets: '3', reps: '10–12' },
        { name: 'Barbell Hip Thrust', sets: '4', reps: '10–12' },
        { name: 'Adductor Machine', sets: '3', reps: '15–20' },
        { name: 'Abductor Machine', sets: '3', reps: '15–20' },
        { name: 'Standing Calf Raise (Machine)', sets: '4', reps: '12–15' },
      ]},
      { name: 'Arms', tag: 'THU', exercises: [
        { name: 'EZ Bar Curl', sets: '3', reps: '6–8' },
        { name: 'Preacher Curl (Dumbbell)', sets: '3', reps: '10–12' },
        { name: 'Incline Dumbbell Curl', sets: '2', reps: '12' },
        { name: 'Bayesian Curl', sets: '2', reps: '12–15' },
        { name: 'Skull Crusher (EZ Bar)', sets: '3', reps: '6–8' },
        { name: 'Straight Bar Pushdown', sets: '3', reps: '10–12' },
        { name: 'Overhead Dumbbell Extension', sets: '2', reps: '10–12' },
        { name: 'Reverse Curl', sets: '2', reps: '12' },
      ]},
      { name: 'Push', tag: 'FRI', exercises: [
        { name: 'Dumbbell Bench Press', sets: '4', reps: '10–12' },
        { name: 'Incline Dumbbell Press', sets: '3', reps: '10–12' },
        { name: 'Dips (Chest Focus)', sets: '3', reps: '8–12' },
        { name: 'Dumbbell Lateral Raise', sets: '3', reps: '15–20' },
        { name: 'Cable Lateral Raise', sets: '3', reps: '15–20' },
      ]},
      { name: 'Pull', tag: 'SAT', exercises: [
        { name: 'Chest Supported Row', sets: '3', reps: '6–8' },
        { name: 'T-Bar Row', sets: '3', reps: '8–10' },
        { name: 'High Row (Cable)', sets: '2', reps: '10–12' },
        { name: 'Face Pull', sets: '3', reps: '15–20' },
        { name: 'Rear Delt Fly (Pec Deck Reverse)', sets: '3', reps: '15' },
        { name: 'EZ Bar Curl', sets: '3', reps: '10–12' },
        { name: 'Hammer Curl', sets: '2', reps: '12' },
      ]},
      { name: 'Legs', tag: 'SUN', exercises: [
        { name: 'Romanian Deadlift', sets: '4', reps: '6–8' },
        { name: 'Leg Press', sets: '3', reps: '10–12' },
        { name: 'Lying Leg Curl', sets: '3', reps: '10–12' },
        { name: 'Machine Hip Thrust', sets: '3', reps: '10–12' },
        { name: 'Seated Calf Raise', sets: '4', reps: '15–20' },
      ]},
    ],
  },
  UpperLower: {
    label: 'Upper/Lower (4-Day)',
    color: '#3CC5FF',
    days: [
      { name: 'Upper (Strength)', tag: 'MON', exercises: [
        { name: 'Incline Barbell Press', sets: '4', reps: '4–6' },
        { name: 'Chest Supported Row', sets: '4', reps: '5–7' },
        { name: 'Barbell Overhead Press (Standing)', sets: '3', reps: '6–8' },
        { name: 'Weighted Pull-Up', sets: '3', reps: '6–8' },
        { name: 'Dumbbell Lateral Raise', sets: '3', reps: '12–15' },
        { name: 'EZ Bar Curl', sets: '2', reps: '10–12' },
        { name: 'Skull Crusher (EZ Bar)', sets: '2', reps: '10–12' },
      ]},
      { name: 'Lower (Strength)', tag: 'TUE', exercises: [
        { name: 'Pendulum Squat', sets: '4', reps: '5–7' },
        { name: 'Romanian Deadlift', sets: '3', reps: '8–10' },
        { name: 'Leg Extension', sets: '3', reps: '10–12' },
        { name: 'Lying Leg Curl', sets: '3', reps: '10–12' },
        { name: 'Barbell Hip Thrust', sets: '3', reps: '10–12' },
        { name: 'Standing Calf Raise (Machine)', sets: '4', reps: '12–15' },
      ]},
      { name: 'Upper (Volume)', tag: 'THU', exercises: [
        { name: 'Dumbbell Bench Press', sets: '4', reps: '10–12' },
        { name: 'Incline Dumbbell Press', sets: '3', reps: '10–12' },
        { name: 'Lat Pulldown (Wide Grip)', sets: '4', reps: '10–12' },
        { name: 'Seated Cable Row (Close Grip)', sets: '3', reps: '12' },
        { name: 'Dumbbell Shoulder Press (Seated)', sets: '3', reps: '10–12' },
        { name: 'Cable Lateral Raise', sets: '3', reps: '15–20' },
        { name: 'Face Pull', sets: '3', reps: '15–20' },
        { name: 'Preacher Curl (Dumbbell)', sets: '3', reps: '10–12' },
        { name: 'Rope Pushdown', sets: '3', reps: '12' },
      ]},
      { name: 'Lower (Volume)', tag: 'FRI', exercises: [
        { name: 'Leg Press', sets: '4', reps: '10–12' },
        { name: 'Hack Squat', sets: '3', reps: '8–10' },
        { name: 'Seated Leg Curl', sets: '3', reps: '12–15' },
        { name: 'Adductor Machine', sets: '3', reps: '15–20' },
        { name: 'Machine Hip Thrust', sets: '4', reps: '12' },
        { name: 'Seated Calf Raise', sets: '4', reps: '15–20' },
      ]},
    ],
  },
};

const TYPE_COLOR: Record<string, string> = { Compound: '#FF5A3C', Isolation: '#3CC5FF' };
const EQUIP_COLOR: Record<string, string> = {
  Barbell: '#FFC53C', Dumbbell: '#B57BFF', Machine: '#8A939C',
  Cable: '#3CC5FF', Bodyweight: '#C6F135', Equipment: '#FF9EAF',
};

export default function LibraryPage() {
  const [tab, setTab] = useState<'library' | 'splits'>('library');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [activeSplit, setActiveSplit] = useState<keyof typeof SPLITS>('PPL');

  const filtered = EXERCISES.filter(e => {
    const matchMuscle = muscleFilter === 'All' || e.muscle === muscleFilter;
    const matchType = typeFilter === 'All' || e.type === typeFilter;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    return matchMuscle && matchType && matchSearch;
  });

  const split = SPLITS[activeSplit];

  return (
    <main style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#0B0D10', fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>
      <div style={{ padding: '16px 20px 104px' }}>

        {/* Header */}
        <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: '#8A939C', marginTop: 6 }}>KNOWLEDGE BASE</div>
        <div className="font-oswald" style={{ fontSize: 24, marginBottom: 16, marginTop: 3 }}>LIBRARY</div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: '#14181D', border: '1px solid #23282F', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16 }}>
          {(['library', 'splits'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, borderRadius: 9, padding: '8px 0',
                background: tab === t ? '#C6F135' : 'transparent',
                color: tab === t ? '#0B0D10' : '#8A939C',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: '.1em',
              }}
            >
              {t === 'library' ? `EXERCISES (${EXERCISES.length})` : 'SPLITS'}
            </button>
          ))}
        </div>

        {tab === 'library' && (
          <>
            {/* Search */}
            <input
              type="text"
              placeholder="Search exercises…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', background: '#14181D', border: '1px solid #23282F',
                borderRadius: 10, padding: '10px 14px', color: '#F2F5F7',
                fontSize: 14, marginBottom: 10, boxSizing: 'border-box',
              }}
            />

            {/* Type filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {['All', 'Compound', 'Isolation'].map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  style={{
                    borderRadius: 8, padding: '5px 12px', fontSize: 11,
                    fontFamily: "'Oswald',sans-serif", letterSpacing: '.08em',
                    background: typeFilter === t ? '#C6F135' : '#14181D',
                    color: typeFilter === t ? '#0B0D10' : '#8A939C',
                    border: '1px solid #23282F', cursor: 'pointer',
                  }}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Muscle group filter */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
              {MUSCLE_GROUPS.map(m => (
                <button
                  key={m}
                  onClick={() => setMuscleFilter(m)}
                  style={{
                    borderRadius: 7, padding: '4px 10px', fontSize: 10,
                    fontFamily: "'Oswald',sans-serif", letterSpacing: '.08em',
                    background: muscleFilter === m ? '#23282F' : 'transparent',
                    color: muscleFilter === m ? '#F2F5F7' : '#4A5260',
                    border: `1px solid ${muscleFilter === m ? '#3A4250' : '#1E2530'}`,
                    cursor: 'pointer',
                  }}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 9, letterSpacing: '.14em', color: '#4A5260', marginBottom: 8, fontFamily: "'Oswald',sans-serif" }}>
              {filtered.length} EXERCISES
            </div>

            {/* Exercise list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {filtered.map((ex, i) => (
                <div
                  key={i}
                  style={{
                    background: '#14181D', border: '1px solid #1E2530',
                    borderRadius: 10, padding: '11px 13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: '#E2E8F0', marginBottom: 5 }}>{ex.name}</div>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <span style={{
                        fontSize: 9, padding: '2px 7px', borderRadius: 4,
                        color: TYPE_COLOR[ex.type] ?? '#8A939C',
                        background: `${TYPE_COLOR[ex.type] ?? '#8A939C'}14`,
                        border: `1px solid ${TYPE_COLOR[ex.type] ?? '#8A939C'}28`,
                        fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em',
                      }}>{ex.type.toUpperCase()}</span>
                      <span style={{
                        fontSize: 9, padding: '2px 7px', borderRadius: 4,
                        color: EQUIP_COLOR[ex.equipment] ?? '#8A939C',
                        background: `${EQUIP_COLOR[ex.equipment] ?? '#8A939C'}14`,
                        border: `1px solid ${EQUIP_COLOR[ex.equipment] ?? '#8A939C'}28`,
                        fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em',
                      }}>{ex.equipment.toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 9, color: '#4A5260', fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em' }}>
                    {ex.muscle.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'splits' && (
          <>
            {/* Split selector */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
              {(Object.entries(SPLITS) as [string, Split][]).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => { setActiveSplit(key as keyof typeof SPLITS); setExpandedDay(null); }}
                  style={{
                    borderRadius: 9, padding: '7px 14px', cursor: 'pointer',
                    background: activeSplit === key ? `${s.color}18` : '#14181D',
                    color: activeSplit === key ? s.color : '#8A939C',
                    border: `1px solid ${activeSplit === key ? `${s.color}60` : '#23282F'}`,
                    fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: '.08em',
                  }}
                >
                  {s.label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Days */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {split.days.map((day, i) => (
                <div
                  key={i}
                  style={{
                    background: '#14181D',
                    border: `1px solid ${expandedDay === i ? `${split.color}50` : '#23282F'}`,
                    borderRadius: 14, overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                    style={{
                      width: '100%', background: 'transparent', border: 'none',
                      padding: '14px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                      color: 'inherit',
                    }}
                  >
                    <div style={{ width: 3, height: 34, borderRadius: 2, background: split.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="font-oswald" style={{ fontSize: 10, letterSpacing: '.18em', color: '#4A5260', marginBottom: 2 }}>{day.tag}</div>
                      <div className="font-oswald" style={{ fontSize: 16 }}>{day.name}</div>
                    </div>
                    <div style={{ fontSize: 9, color: '#4A5260', fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em' }}>
                      {day.exercises.length} EXERCISES
                    </div>
                    <i
                      className="ph ph-caret-right"
                      style={{
                        color: '#4A5260', fontSize: 16,
                        transform: expandedDay === i ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </button>

                  {expandedDay === i && (
                    <div style={{ borderTop: `1px solid ${split.color}28` }}>
                      {/* Table header */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 44px 64px',
                        padding: '7px 16px',
                        fontSize: 9, letterSpacing: '.14em', color: '#4A5260',
                        fontFamily: "'Oswald',sans-serif", background: '#111518',
                      }}>
                        <span>EXERCISE</span>
                        <span style={{ textAlign: 'center' }}>SETS</span>
                        <span style={{ textAlign: 'center' }}>REPS</span>
                      </div>
                      {day.exercises.map((ex, j) => (
                        <div
                          key={j}
                          style={{
                            display: 'grid', gridTemplateColumns: '1fr 44px 64px',
                            padding: '10px 16px', alignItems: 'center',
                            background: j % 2 === 0 ? '#13171C' : '#14181D',
                            borderTop: '1px solid #1A1F26',
                          }}
                        >
                          <span style={{ fontSize: 13 }}>{ex.name}</span>
                          <span style={{ textAlign: 'center', fontFamily: "'Oswald',sans-serif", fontSize: 15, color: split.color }}>
                            {ex.sets}
                          </span>
                          <span style={{ textAlign: 'center', fontSize: 11, color: '#8A939C' }}>
                            {ex.reps}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AppNav />
    </main>
  );
}
