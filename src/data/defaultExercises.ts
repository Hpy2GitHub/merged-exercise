// src/data/defaultExercises.ts
// Sample data shown on first launch (before any import or API data is available).

import { Exercise, ExerciseList, ExportData } from '../types';

const DEFAULT_EXERCISES: Exercise[] = [
  {
    name: 'Push-Up',
    key: 'push-up',
    thumbnailLink: '/images/thumbnails/push-up.jpg',
    videoLink: '/videos/push-up.mp4',
    hasVideo: false,
    description: 'A classic bodyweight exercise that works the chest, shoulders, and triceps.',
    primaryMuscle: 'Chest',
    musclesTargeted: ['Chest', 'Shoulders', 'Triceps'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    instructions: [
      'Start in a high plank position with hands slightly wider than shoulder-width.',
      'Lower your body until your chest nearly touches the floor.',
      'Push yourself back up to the starting position.',
    ],
    commonMistakes: [
      'Letting hips sag toward the floor.',
      'Flaring elbows out too wide.',
    ],
    tips: [
      'Keep your core tight throughout the movement.',
      'Breathe in on the way down, out on the way up.',
    ],
    calculator: {
      beginner:     { reps: '8',  lbs: '0', oneRepMax: '' },
      intermediate: { reps: '15', lbs: '0', oneRepMax: '' },
      advanced:     { reps: '25', lbs: '0', oneRepMax: '' },
    },
  },
  {
    name: 'Squat',
    key: 'squat',
    thumbnailLink: '/images/thumbnails/squat.jpg',
    videoLink: '/videos/squat.mp4',
    hasVideo: false,
    description: 'A fundamental lower-body exercise targeting the quads, hamstrings, and glutes.',
    primaryMuscle: 'Quadriceps',
    musclesTargeted: ['Quadriceps', 'Hamstrings', 'Glutes'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    instructions: [
      'Stand with feet shoulder-width apart, toes slightly turned out.',
      'Lower your body by bending at the knees and hips, as if sitting back into a chair.',
      'Stop when thighs are parallel to the floor (or as low as comfortable).',
      'Drive through your heels to return to standing.',
    ],
    commonMistakes: [
      'Allowing knees to cave inward.',
      'Rising onto your toes instead of keeping heels flat.',
    ],
    tips: [
      'Keep your chest up and back straight.',
      'Push your knees out in the direction of your toes.',
    ],
    calculator: {
      beginner:     { reps: '10', lbs: '0',  oneRepMax: '' },
      intermediate: { reps: '15', lbs: '95', oneRepMax: '' },
      advanced:     { reps: '10', lbs: '185', oneRepMax: '' },
    },
  },
  {
    name: 'Dumbbell Row',
    key: 'dumbbell-row',
    thumbnailLink: '/images/thumbnails/dumbbell-row.jpg',
    videoLink: '/videos/dumbbell-row.mp4',
    hasVideo: false,
    description: 'A unilateral back exercise that builds thickness in the lats and rhomboids.',
    primaryMuscle: 'Back',
    musclesTargeted: ['Back', 'Biceps', 'Shoulders'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Beginner',
    instructions: [
      'Place one knee and hand on a bench for support.',
      'Hold a dumbbell in the opposite hand, arm hanging straight down.',
      'Pull the dumbbell up toward your hip, keeping your elbow close to your body.',
      'Lower the weight back to the starting position under control.',
    ],
    commonMistakes: [
      'Rotating the torso to use momentum.',
      'Not fully extending the arm at the bottom.',
    ],
    tips: [
      'Think about driving your elbow toward the ceiling.',
      'Squeeze your shoulder blade at the top of the movement.',
    ],
    calculator: {
      beginner:     { reps: '10', lbs: '20', oneRepMax: '' },
      intermediate: { reps: '10', lbs: '45', oneRepMax: '' },
      advanced:     { reps: '10', lbs: '80', oneRepMax: '' },
    },
  },
];

const DEFAULT_LISTS: ExerciseList[] = [
  {
    name: 'Full Body Starter',
    description: 'A simple full-body routine for beginners.',
    exercises: ['push-up', 'squat'],
    createdDate: new Date().toISOString(),
    tags: ['beginner', 'full-body'],
  },
];

export const DEFAULT_DATA: ExportData = {
  exercises: DEFAULT_EXERCISES,
  lists: DEFAULT_LISTS,
};

// Returns true if the current exercise list appears to be the unmodified defaults.
// Used to decide whether to show the "using sample data" banner.
export function isUsingDefaultData(exercises: Exercise[]): boolean {
  if (exercises.length !== DEFAULT_EXERCISES.length) return false;
  const defaultKeys = new Set(DEFAULT_EXERCISES.map(e => e.key));
  return exercises.every(e => defaultKeys.has(e.key));
}
