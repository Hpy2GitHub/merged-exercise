// src/components/ExerciseDetail.tsx
import { ArrowLeft, Dumbbell, Target, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { Exercise, ExerciseList } from '../types';
import { MuscleDiagramData } from '../types';
import { getThumbnailUrl, getVideoUrl, getPublicUrl } from '../utils/paths';
import { features } from "../config/features";
import { MuscleDiagram } from './MuscleDiagram';
import { ExerciseMedia } from './ExerciseMedia';
import { ExerciseListSelector } from './ExerciseListSelector';


interface ExerciseDetailProps {
  exercise: Exercise | null;
  lists?: ExerciseList[];
  onBack: () => void;
  onEdit: () => void;
  onToggleList?: (listIndex: number, exerciseKey: string) => void;
  muscleDiagramData: MuscleDiagramData | null;
}


export const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ 
  exercise, 
  lists = [],
  onBack, 
  onEdit,
  onToggleList,
  muscleDiagramData 
}) => {

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <p className="text-gray-500 text-lg">No exercise selected</p>
      </div>
    );
  }

  const videoUrl = exercise.videoLink ? getVideoUrl(exercise.videoLink) : null;
  const posterUrl = exercise.thumbnailLink 
    ? (exercise.thumbnailLink.includes('/') 
        ? getPublicUrl(exercise.thumbnailLink)
        : getThumbnailUrl(exercise.thumbnailLink))
    : undefined;
  const fallbackImageUrl = exercise.thumbnailLink
    ? (exercise.thumbnailLink.includes('/')
        ? getPublicUrl(exercise.thumbnailLink)
        : getThumbnailUrl(exercise.thumbnailLink))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{exercise.name}</h1>
              <p className="text-sm text-gray-500 mb-4">Key: {exercise.key}</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                  {exercise.difficulty || 'N/A'}
                </span>
                {exercise.primaryMuscle && (
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold flex items-center gap-2">
                    <Target size={16} />
                    Primary: {exercise.primaryMuscle}
                  </span>
                )}
                {exercise.equipment && exercise.equipment.length > 0 && (
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Dumbbell size={16} />
                    {exercise.equipment.join(', ')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {features.canEdit && onEdit && (
                <button
                  onClick={onEdit}
                  className="px-5 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center gap-2"
                >
                  Edit
                </button>
              )}
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
              )}
            </div>
          </div>

          {exercise.description && (
            <div className="p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
              <p className="text-gray-700 leading-relaxed text-lg">{exercise.description}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Exercise Demo & Target Muscles
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <ExerciseMedia
              name={exercise.name}
              hasVideo={exercise.hasVideo}
              videoUrl={videoUrl}
              posterUrl={posterUrl}
              fallbackImageUrl={fallbackImageUrl}
            />

            {features.showMuscleDiagram && (
              <MuscleDiagram exercise={exercise} muscleDiagramData={muscleDiagramData} />
            )}
          </div>
        </div>

        {exercise.musclesTargeted && exercise.musclesTargeted.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Target className="text-indigo-600" size={28} />
              Secondary Muscles Worked
            </h2>
            <div className="flex flex-wrap gap-3">
              {exercise.musclesTargeted.map((m) => (
                <span
                  key={m}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {exercise.instructions && exercise.instructions.filter(i => i.trim()).length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Perform</h2>
            <ol className="space-y-4">
              {exercise.instructions.filter(i => i.trim()).map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {idx + 1}
                  </span>
                  <p className="text-gray-700 text-lg leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {exercise.commonMistakes && exercise.commonMistakes.filter(m => m.trim()).length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <AlertCircle className="text-red-600" size={28} />
              Common Mistakes
            </h2>
            <div className="space-y-4">
              {exercise.commonMistakes.filter(m => m.trim()).map((mistake, idx) => (
                <div key={idx} className="p-5 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                  <p className="text-gray-700 leading-relaxed">{mistake}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {exercise.tips && exercise.tips.filter(t => t.trim()).length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Lightbulb className="text-yellow-600" size={28} />
              Pro Tips
            </h2>
            <div className="space-y-4">
              {exercise.tips.filter(t => t.trim()).map((tip, idx) => (
                <div key={idx} className="p-5 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                  <p className="text-gray-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {exercise.calculator && (exercise.calculator.beginner.reps || exercise.calculator.intermediate.reps || exercise.calculator.advanced.reps) && (
          <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <TrendingUp className="text-indigo-600" size={28} />
              Performance Standards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['beginner', 'intermediate', 'advanced'] as const).map(level => {
                const data = exercise.calculator![level];
                if (!data.reps && !data.lbs && !data.oneRepMax) return null;
                return (
                  <div key={level} className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                    <h3 className="text-xl font-bold text-indigo-700 capitalize mb-4">{level}</h3>
                    {data.reps && <p className="text-gray-700"><strong>Reps:</strong> {data.reps}</p>}
                    {data.lbs && <p className="text-gray-700"><strong>Weight:</strong> {data.lbs} lbs</p>}
                    {data.oneRepMax && <p className="text-gray-700"><strong>1RM:</strong> {data.oneRepMax} lbs</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {lists.length > 0 && onToggleList && features.canManageLists && (
          <ExerciseListSelector
            exerciseKey={exercise.key}
            lists={lists}
            onToggleList={onToggleList}
          />
        )}
      </div>
    </div>
  );
};
