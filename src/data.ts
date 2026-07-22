import type { ScheduleItem, SplitDay } from './types';

// The daily 16:8 fasting & gym plan (from the original to-do list).
export const SCHEDULE: ScheduleItem[] = [
  {
    id: 'fast-am',
    time: '9:00 AM – 1:00 PM',
    category: 'Fasting',
    title: 'Morning Fast',
    detail: 'Only water, black coffee, or plain green tea. No sugar, no milk.',
    icon: 'cafe-outline',
  },
  {
    id: 'walk-noon',
    time: '12:30 PM',
    category: 'Movement',
    title: 'Fasted Walk',
    detail: 'Quick 15–20 min fasted walk to accelerate abdominal fat burn.',
    icon: 'walk-outline',
  },
  {
    id: 'meal-1',
    time: '1:00 PM',
    category: 'Meal 1',
    title: 'Break Fast',
    detail:
      '2 boiled eggs + 3 tbsp hung curd + 30g oats + 1 cup unsweetened chai (50% milk / 50% water).',
    icon: 'egg-outline',
  },
  {
    id: 'pre-workout',
    time: '5:00 PM',
    category: 'Pre-Workout',
    title: 'Pre-Workout Fuel',
    detail:
      '3–5g creatine with water. 1 medium banana (100g) OR 2 rice cakes + 15g peanut butter.',
    icon: 'flash-outline',
  },
  {
    id: 'gym',
    time: '6:00 – 7:30 PM',
    category: 'Gym',
    title: 'Gym Session',
    detail:
      'Heavy compound lifts, then 15 min incline treadmill walk. Plain water only.',
    icon: 'barbell-outline',
  },
  {
    id: 'meal-2',
    time: '8:15 PM',
    category: 'Meal 2',
    title: 'Post-Workout Dinner',
    detail:
      '200g cooked chicken (drained) + 1 dry roti (35–40g raw atta) + big oil-free kachumar salad.',
    icon: 'restaurant-outline',
  },
  {
    id: 'walk-pm',
    time: '8:45 PM',
    category: 'Movement',
    title: 'Post-Dinner Walk',
    detail: '15 min walk right after dinner to crush blood-sugar spikes.',
    icon: 'walk-outline',
  },
  {
    id: 'fast-pm',
    time: '9:00 PM',
    category: 'Fasting',
    title: 'Close the Window',
    detail: 'Eating window closed. Lock the fast and hit your daily water target.',
    icon: 'moon-outline',
  },
];

// Push / Pull / Legs weekly split (weekday 0 = Monday).
export const SPLIT: SplitDay[] = [
  {
    weekday: 0,
    name: 'Monday',
    split: 'Push',
    focus: 'Chest · Shoulders · Triceps',
    exercises: [
      { id: 'mon-bench', name: 'Flat Bench Press', targetSets: 3, targetReps: '6–8' },
      { id: 'mon-ohp', name: 'Overhead Shoulder Press', targetSets: 3, targetReps: '8–10' },
      { id: 'mon-flye', name: 'Incline Dumbbell Flyes', targetSets: 2, targetReps: '10–12' },
      { id: 'mon-tri', name: 'Tricep Overhead Cable Ext.', targetSets: 2, targetReps: '12–15' },
    ],
  },
  {
    weekday: 1,
    name: 'Tuesday',
    split: 'Pull',
    focus: 'Back · Lats · Biceps · Core',
    exercises: [
      { id: 'tue-pulldown', name: 'Lat Pulldown (Wide)', targetSets: 3, targetReps: '8–10' },
      { id: 'tue-row', name: 'Seated Cable Row', targetSets: 3, targetReps: '10–12' },
      { id: 'tue-hammer', name: 'Bicep Hammer Curls', targetSets: 2, targetReps: '10–12' },
      { id: 'tue-knee', name: 'Hanging Knee Raises', targetSets: 2, targetReps: '12–15' },
      { id: 'tue-plank', name: 'Plank', targetSets: 2, targetReps: 'Max' },
    ],
  },
  {
    weekday: 2,
    name: 'Wednesday',
    split: 'Legs',
    focus: 'Quads · Glutes · Hamstrings · Core',
    exercises: [
      { id: 'wed-squat', name: 'Back Squat', targetSets: 3, targetReps: '6–8' },
      { id: 'wed-rdl', name: 'Romanian Deadlift', targetSets: 3, targetReps: '10–12' },
      { id: 'wed-legext', name: 'Leg Extensions', targetSets: 2, targetReps: '12–15' },
      { id: 'wed-crunch', name: 'Decline Bench Crunches', targetSets: 3, targetReps: '15–20' },
    ],
  },
  {
    weekday: 3,
    name: 'Thursday',
    split: 'Push',
    focus: 'Chest · Shoulders · Triceps',
    exercises: [
      { id: 'thu-bench', name: 'Flat Bench Press', targetSets: 3, targetReps: '6–8' },
      { id: 'thu-ohp', name: 'Overhead Shoulder Press', targetSets: 3, targetReps: '8–10' },
      { id: 'thu-flye', name: 'Incline Dumbbell Flyes', targetSets: 2, targetReps: '10–12' },
      { id: 'thu-tri', name: 'Tricep Overhead Cable Ext.', targetSets: 2, targetReps: '12–15' },
    ],
  },
  {
    weekday: 4,
    name: 'Friday',
    split: 'Pull',
    focus: 'Back · Lats · Biceps · Core',
    exercises: [
      { id: 'fri-pulldown', name: 'Lat Pulldown (Wide)', targetSets: 3, targetReps: '8–10' },
      { id: 'fri-row', name: 'Seated Cable Row', targetSets: 3, targetReps: '10–12' },
      { id: 'fri-hammer', name: 'Bicep Hammer Curls', targetSets: 2, targetReps: '10–12' },
      { id: 'fri-knee', name: 'Hanging Knee Raises', targetSets: 2, targetReps: '12–15' },
      { id: 'fri-plank', name: 'Plank', targetSets: 2, targetReps: 'Max' },
    ],
  },
  {
    weekday: 5,
    name: 'Saturday',
    split: 'Legs',
    focus: 'Quads · Glutes · Hamstrings · Core',
    exercises: [
      { id: 'sat-squat', name: 'Back Squat', targetSets: 3, targetReps: '6–8' },
      { id: 'sat-rdl', name: 'Romanian Deadlift', targetSets: 3, targetReps: '10–12' },
      { id: 'sat-legext', name: 'Leg Extensions', targetSets: 2, targetReps: '12–15' },
      { id: 'sat-crunch', name: 'Decline Bench Crunches', targetSets: 3, targetReps: '15–20' },
    ],
  },
  {
    weekday: 6,
    name: 'Sunday',
    split: 'Rest',
    focus: 'Active Recovery',
    exercises: [],
    notes: [
      'Full rest or 30–45 min light walk',
      'Full-body stretching / mobility',
      'Prep & weigh meals for the week',
    ],
  },
];

export const DEFAULT_REST_SECONDS = 90;
export const MIN_SETS = 2;

export const GLASS_ML = 250; // one glass of water
