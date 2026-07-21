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
    lifts: [
      'Bench Press — 4×6–8',
      'Overhead Press — 3×8',
      'Incline DB Press — 3×10',
      'Lateral Raises — 3×15',
      'Triceps Pushdown — 3×12',
    ],
  },
  {
    weekday: 1,
    name: 'Tuesday',
    split: 'Pull',
    focus: 'Back · Biceps · Rear Delts',
    lifts: [
      'Deadlift — 3×5',
      'Pull-Ups — 3×AMRAP',
      'Lat Pulldown — 3×10',
      'Face Pulls — 3×15',
      'Barbell Curl — 3×12',
    ],
  },
  {
    weekday: 2,
    name: 'Wednesday',
    split: 'Legs',
    focus: 'Quads · Hamstrings · Glutes · Calves',
    lifts: [
      'Back Squat — 4×6–8',
      'Romanian Deadlift — 3×10',
      'Leg Press — 3×12',
      'Leg Curl — 3×12',
      'Calf Raise — 4×15',
    ],
  },
  {
    weekday: 3,
    name: 'Thursday',
    split: 'Push',
    focus: 'Chest · Shoulders · Triceps',
    lifts: [
      'Incline Bench Press — 4×8',
      'Seated DB Press — 3×10',
      'Cable Fly — 3×15',
      'Lateral Raises — 3×15',
      'Overhead Extension — 3×12',
    ],
  },
  {
    weekday: 4,
    name: 'Friday',
    split: 'Pull',
    focus: 'Back · Biceps · Rear Delts',
    lifts: [
      'Barbell Row — 4×8',
      'Chin-Ups — 3×AMRAP',
      'Seated Cable Row — 3×10',
      'Reverse Fly — 3×15',
      'Hammer Curl — 3×12',
    ],
  },
  {
    weekday: 5,
    name: 'Saturday',
    split: 'Legs',
    focus: 'Quads · Hamstrings · Glutes · Calves',
    lifts: [
      'Front Squat — 4×8',
      'Hip Thrust — 3×10',
      'Walking Lunges — 3×12',
      'Leg Extension — 3×15',
      'Seated Calf Raise — 4×15',
    ],
  },
  {
    weekday: 6,
    name: 'Sunday',
    split: 'Rest',
    focus: 'Active Recovery',
    lifts: [
      'Full rest or 30–45 min light walk',
      'Full-body stretching / mobility',
      'Prep & weigh meals for the week',
    ],
  },
];

export const GLASS_ML = 250; // one glass of water
