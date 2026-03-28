// src/components/ExerciseTableHeader.tsx
import { features } from "../config/features";

interface ExerciseTableHeaderProps {
  onAddExercise: () => void;
  onBack: () => void;
}

export const ExerciseTableHeader: React.FC<ExerciseTableHeaderProps> = ({ onAddExercise, onBack }) => (
  <div className="flex justify-between items-center mb-8">
    <div>
      <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Exercise Table View</h1>
      <p className="text-gray-600">Browse all exercises in a tabular format</p>
    </div>
    <div className="flex gap-4">
      {features.canEdit && (
        <button
          onClick={onAddExercise}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Add New Exercise
        </button>
      )}
      <button
        onClick={onBack}
        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
      >
        Back to Cards
      </button>
    </div>
  </div>
);
