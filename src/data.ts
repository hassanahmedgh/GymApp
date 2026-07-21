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
      { id: 'mon-bench', name: 'Bench Press', targetSets: 4, targetReps: '6–8' },
      { id: 'mon-ohp', name: 'Overhead Press', targetSets: 3, targetReps: '8' },
      { id: 'mon-incdb', name: 'Incline DB Press', targetSets: 3, targetReps: '10' },
      { id: 'mon-lat', name: 'Lateral Raises', targetSets: 3, targetReps: '15' },
      { id: 'mon-tri', name: 'Triceps Pushdown', targetSets: 3, targetReps: '12' },
    ],
  },
  {
    weekday: 1,
    name: 'Tuesday',
    split: 'Pull',
    focus: 'Back · Biceps · Rear Delts',
    exercises: [
      { id: 'tue-dead', name: 'Deadlift', targetSets: 3, targetReps: '5' },
      { id: 'tue-pull', name: 'Pull-Ups', targetSets: 3, targetReps: 'AMRAP' },
      { id: 'tue-lat', name: 'Lat Pulldown', targetSets: 3, targetReps: '10' },
      { id: 'tue-face', name: 'Face Pulls', targetSets: 3, targetReps: '15' },
      { id: 'tue-curl', name: 'Barbell Curl', targetSets: 3, targetReps: '12' },
    ],
  },
  {
    weekday: 2,
    name: 'Wednesday',
    split: 'Legs',
    focus: 'Quads · Hamstrings · Glutes · Calves',
    exercises: [
      { id: 'wed-squat', name: 'Back Squat', targetSets: 4, targetReps: '6–8' },
      { id: 'wed-rdl', name: 'Romanian Deadlift', targetSets: 3, targetReps: '10' },
      { id: 'wed-press', name: 'Leg Press', targetSets: 3, targetReps: '12' },
      { id: 'wed-curl', name: 'Leg Curl', targetSets: 3, targetReps: '12' },
      { id: 'wed-calf', name: 'Calf Raise', targetSets: 4, targetReps: '15' },
    ],
  },
  {
    weekday: 3,
    name: 'Thursday',
    split: 'Push',
    focus: 'Chest · Shoulders · Triceps',
    exercises: [
      { id: 'thu-inc', name: 'Incline Bench Press', targetSets: 4, targetReps: '8' },
      { id: 'thu-db', name: 'Seated DB Press', targetSets: 3, targetReps: '10' },
      { id: 'thu-fly', name: 'Cable Fly', targetSets: 3, targetReps: '15' },
      { id: 'thu-lat', name: 'Lateral Raises', targetSets: 3, targetReps: '15' },
      { id: 'thu-ext', name: 'Overhead Extension', targetSets: 3, targetReps: '12' },
    ],
  },
  {
    weekday: 4,
    name: 'Friday',
    split: 'Pull',
    focus: 'Back · Biceps · Rear Delts',
    exercises: [
      { id: 'fri-row', name: 'Barbell Row', targetSets: 4, targetReps: '8' },
      { id: 'fri-chin', name: 'Chin-Ups', targetSets: 3, targetReps: 'AMRAP' },
      { id: 'fri-cable', name: 'Seated Cable Row', targetSets: 3, targetReps: '10' },
      { id: 'fri-rear', name: 'Reverse Fly', targetSets: 3, targetReps: '15' },
      { id: 'fri-ham', name: 'Hammer Curl', targetSets: 3, targetReps: '12' },
    ],
  },
  {
    weekday: 5,
    name: 'Saturday',
    split: 'Legs',
    focus: 'Quads · Hamstrings · Glutes · Calves',
    exercises: [
      { id: 'sat-front', name: 'Front Squat', targetSets: 4, targetReps: '8' },
      { id: 'sat-hip', name: 'Hip Thrust', targetSets: 3, targetReps: '10' },
      { id: 'sat-lunge', name: 'Walking Lunges', targetSets: 3, targetReps: '12' },
      { id: 'sat-ext', name: 'Leg Extension', targetSets: 3, targetReps: '15' },
      { id: 'sat-calf', name: 'Seated Calf Raise', targetSets: 4, targetReps: '15' },
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
