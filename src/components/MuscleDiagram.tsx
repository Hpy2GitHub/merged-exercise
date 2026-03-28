// src/components/MuscleDiagram.tsx
// Extracted from ExerciseDetail.tsx — owns all muscle diagram state and logic.

import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Exercise } from '../types';
import { MuscleDiagramData } from '../types';
import { getImageUrl } from '../utils/paths';

interface ImageSize {
  width: number;
  height: number;
}

interface SvgPoint {
  x: number;
  y: number;
  color: string;
  muscle: string;
}

interface MuscleDiagramProps {
  exercise: Exercise;
  muscleDiagramData: MuscleDiagramData | null;
}

// Helper function to handle various naming conventions with better plural/singular handling
const normalizeMuscleName = (name: string): string[] => {
  if (!name) return [];

  const normalized = name.toLowerCase().trim();

  const variations = [
    normalized,
    normalized.replace(/\s+/g, '_'),
    normalized.replace(/\s+/g, '-'),
  ];

  if (normalized === 'feet') {
    variations.push('foot');
  } else if (normalized === 'foot') {
    variations.push('feet');
  } else if (normalized.endsWith('s') && normalized.length > 1) {
    const singular = normalized.slice(0, -1);
    variations.push(singular);
    variations.push(singular.replace(/\s+/g, '_'));
    variations.push(singular.replace(/\s+/g, '-'));
  }

  if (normalized.includes('back')) {
    variations.push('back');
    variations.push('lowerback');
    variations.push('lower_back');
    variations.push('lower-back');
  }

  return Array.from(new Set(variations.map(v => v.toLowerCase())));
};

export const MuscleDiagram: React.FC<MuscleDiagramProps> = ({ exercise, muscleDiagramData }) => {
  const [frontImageLoaded, setFrontImageLoaded] = useState<boolean>(false);
  const [backImageLoaded, setBackImageLoaded] = useState<boolean>(false);
  const [frontImageSize, setFrontImageSize] = useState<ImageSize>({ width: 300, height: 400 });
  const [backImageSize, setBackImageSize] = useState<ImageSize>({ width: 300, height: 400 });

  const generateMuscleSVG = useMemo((): { front: SvgPoint[]; back: SvgPoint[] } => {
    if (!muscleDiagramData) return { front: [], back: [] };

    const primaryMuscleVariations = normalizeMuscleName(exercise.primaryMuscle || '');
    const secondaryMuscleVariations = exercise.musclesTargeted?.flatMap(m => normalizeMuscleName(m)) || [];

    const generateForView = (view: keyof MuscleDiagramData): SvgPoint[] => {
      const muscles = muscleDiagramData[view] || [];
      const svgElements: SvgPoint[] = [];

      muscles.forEach(muscleGroup => {
        const muscleName = muscleGroup.name.toLowerCase().trim();
        let color: string | null = null;

        const isPrimary = primaryMuscleVariations.some(variation => muscleName === variation);
        const isSecondary = secondaryMuscleVariations.some(variation => muscleName === variation);

        if (isPrimary) color = '#c14249';
        else if (isSecondary) color = '#41c249';

        if (color) {
          muscleGroup.regions.forEach((region) => {
            region.forEach((point) => {
              svgElements.push({ x: point.x, y: point.y, color: color!, muscle: muscleName });
            });
          });
        }
      });

      return svgElements;
    };

    return {
      front: generateForView('front'),
      back: generateForView('back'),
    };
  }, [exercise, muscleDiagramData]);

  const handleImageLoad = (view: 'front' | 'back', event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.target as HTMLImageElement;
    if (view === 'front') {
      setFrontImageLoaded(true);
      setFrontImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    } else {
      setBackImageLoaded(true);
      setBackImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    }
  };

  const determineViewsToShow = () => {
    const primaryMuscle = exercise.primaryMuscle?.toLowerCase();
    const secondaryMuscles = exercise.musclesTargeted?.map(m => m.toLowerCase()) || [];

    const frontMuscles = ['abs', 'abductors', 'adductors', 'biceps', 'calves', 'chest', 'forearms',
      'feet', 'foot', 'neck', 'obliques', 'quads'];
    const backMuscles = ['abductors', 'adductors', 'back', 'calves', 'forearms', 'feet', 'foot', 'glutes',
      'hamstrings', 'lowerback', 'lower back', 'lower-back', 'lower_back', 'neck', 'obliques', 'shoulders', 'trapezius', 'triceps'];

    let showFront = false;
    let showBack = false;

    if (primaryMuscle) {
      if (frontMuscles.some(m => primaryMuscle.includes(m) || m.includes(primaryMuscle))) showFront = true;
      if (backMuscles.some(m => primaryMuscle.includes(m) || m.includes(primaryMuscle))) showBack = true;
    }

    secondaryMuscles.forEach(muscle => {
      if (frontMuscles.some(m => muscle.includes(m) || m.includes(muscle))) showFront = true;
      if (backMuscles.some(m => muscle.includes(m) || m.includes(muscle))) showBack = true;
    });

    if (!showFront && !showBack) { showFront = true; showBack = true; }

    return { showFront, showBack };
  };

  const { showFront, showBack } = determineViewsToShow();

  return (
    <div className="lg:col-span-2">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        Target Muscles
        {(!frontImageLoaded || !backImageLoaded) && (
          <RefreshCw size={16} className="animate-spin text-gray-400" />
        )}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {showFront && (
          <div>
            <div className="relative w-full aspect-square bg-gray-100 rounded-xl shadow-lg border border-gray-300 overflow-hidden">
              <img
                src={getImageUrl('muscles/front.png')}
                alt="Front muscle diagram"
                className="absolute inset-0 w-full h-full object-contain"
                onLoad={(e) => handleImageLoad('front', e)}
                onError={() => console.error('Failed to load front image')}
              />
              {generateMuscleSVG.front.length > 0 && (
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox={`0 0 ${frontImageSize.width} ${frontImageSize.height}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {generateMuscleSVG.front.map((point, idx) => (
                    <circle key={`front-${idx}`} cx={point.x} cy={point.y} r="1" fill={point.color} opacity="0.7" />
                  ))}
                </svg>
              )}
            </div>
            <h4 className="text-md font-medium text-gray-700 mb-2 mt-2">Front View</h4>
          </div>
        )}

        {showBack && (
          <div>
            <div className="relative w-full aspect-square bg-gray-100 rounded-xl shadow-lg border border-gray-300 overflow-hidden">
              <img
                src={getImageUrl('muscles/back.png')}
                alt="Back muscle diagram"
                className="absolute inset-0 w-full h-full object-contain"
                onLoad={(e) => handleImageLoad('back', e)}
                onError={() => console.error('Failed to load back image')}
              />
              {generateMuscleSVG.back.length > 0 && (
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox={`0 0 ${backImageSize.width} ${backImageSize.height}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {generateMuscleSVG.back.map((point, idx) => (
                    <circle key={`back-${idx}`} cx={point.x} cy={point.y} r="1" fill={point.color} opacity="0.7" />
                  ))}
                </svg>
              )}
            </div>
            <h4 className="text-md font-medium text-gray-700 mb-2 mt-2">Back View</h4>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600">Primary</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Secondary</span>
        </div>
      </div>
    </div>
  );
};
