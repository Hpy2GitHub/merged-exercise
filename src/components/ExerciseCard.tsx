// src/components/ExerciseCard.tsx
import { useState } from 'react';
import { Eye, Edit2, Trash2, ImageOff } from 'lucide-react';
import { Exercise, ExerciseList } from '../types';
import { getThumbnailUrl, getPublicUrl } from '../utils/paths';
import { features } from "../config/features";

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onView: (index: number) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  lists?: ExerciseList[];
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  index, 
  onView, 
  onEdit, 
  onDelete,
  lists = []
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const thumbnailPath = exercise.thumbnailLink
    ? exercise.thumbnailLink.includes('/')
      ? getPublicUrl(exercise.thumbnailLink)
      : getThumbnailUrl(exercise.thumbnailLink)
    : getThumbnailUrl(`${exercise.key}.jpg`);

  // Get lists containing this exercise
  const exerciseLists = lists.filter(list => list.exercises.includes(exercise.key));

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">

{/* Thumbnail Image — entire block hidden when features.showImages is false */}
      {features.showImages && (
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {!imageError ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-gray-400">Loading...</div>
                </div>
              )}
              <img
                src={thumbnailPath}
                loading="lazy"
                alt={exercise.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => {
                  setImageLoaded(true);
                  console.log('Image loaded successfully:', exercise.name);
                }}
                onError={(e) => {
                  setImageError(true);
                  setImageLoaded(false);
                  console.log('Image failed to load:', {
                    src: e.currentTarget.src,
                    exercise: exercise.name,
                    key: exercise.key
                  });
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <ImageOff size={48} className="mb-2" />
              <span className="text-sm">No image available</span>
            </div>
          )}

          {/* Number badge overlay */}
          <div className="absolute top-3 left-3">
            <span className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              {index + 1}
            </span>
          </div>

          {/* List Count Badge */}
          {exerciseLists.length > 0 && (
            <div className="absolute top-3 left-16">
              <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-bold shadow-lg">
                {exerciseLists.length} {exerciseLists.length === 1 ? 'List' : 'Lists'}
              </span>
            </div>
          )}

          {/* Action buttons overlay — Edit and Delete only shown when features.canEdit is true */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={() => onView(index)}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
              title="View Details"
            >
              <Eye size={18} className="text-indigo-600" />
            </button>
            {features.canEdit && (
              <button
                onClick={() => onEdit(index)}
                className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
                title="Edit"
              >
                <Edit2 size={18} className="text-blue-600" />
              </button>
            )}
            {features.canEdit && (
              <button
                onClick={() => onDelete(index)}
                className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
                title="Delete"
              >
                <Trash2 size={18} className="text-red-600" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-6 flex-1">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{exercise.name}</h3>
          <p className="text-xs text-gray-500">Key: {exercise.key}</p>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Difficulty:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
              exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
              exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {exercise.difficulty}
            </span>
          </div>

          {exercise.primaryMuscle && (
            <div>
              <span className="font-semibold text-gray-700">Primary Muscle:</span>
              <span className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-xs font-bold">
                {exercise.primaryMuscle}
              </span>
            </div>
          )}

          {exercise.musclesTargeted && exercise.musclesTargeted.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700">Secondary:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {exercise.musclesTargeted.map(m => (
                  <span key={m} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exercise.equipment && exercise.equipment.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700">Equipment:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {exercise.equipment.map(e => (
                  <span key={e} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* List Badges */}
          {exerciseLists.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700">In Lists:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {exerciseLists.map(list => (
                  <span key={list.name} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    {list.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exercise.description && (
            <p className="text-gray-600 text-sm mt-3 line-clamp-3">
              {exercise.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <button
          onClick={() => onView(index)}
          className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center gap-1 transition"
        >
          <Eye size={16} />
          View Full Details
        </button>
      </div>
    </div>
  );
};
