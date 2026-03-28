// src/components/ExerciseListSelector.tsx
import { ExerciseList } from '../types';
import { features } from "../config/features";

interface ExerciseListSelectorProps {
  exerciseKey: string;
  lists: ExerciseList[];
  onToggleList: (listIndex: number, exerciseKey: string) => void;
}

export const ExerciseListSelector: React.FC<ExerciseListSelectorProps> = ({
  exerciseKey,
  lists,
  onToggleList,
}) => {
  if (!features.canManageLists) return null;

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Add to Lists
      </h2>
      <div className="space-y-2">
        {lists.map((list, idx) => (
          <label key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition">
            <input
              type="checkbox"
              checked={list.exercises.includes(exerciseKey)}
              onChange={() => onToggleList(idx, exerciseKey)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-800">{list.name}</span>
              {list.description && (
                <p className="text-xs text-gray-500 mt-0.5">{list.description}</p>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {list.exercises.length} exercise{list.exercises.length !== 1 ? 's' : ''}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
