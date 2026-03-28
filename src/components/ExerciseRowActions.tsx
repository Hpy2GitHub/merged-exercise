// src/components/ExerciseRowActions.tsx
import { Eye, Edit2 } from 'lucide-react';
import { features } from "../config/features";

interface ExerciseRowActionsProps {
  originalIndex: number;
  indexNotFound: boolean;
  onViewDetails: (index: number) => void;
  onEdit: (index: number) => void;
}

export const ExerciseRowActions: React.FC<ExerciseRowActionsProps> = ({
  originalIndex,
  indexNotFound,
  onViewDetails,
  onEdit,
}) => {
  if (indexNotFound) {
    return (
      <div className="flex justify-center items-center gap-2 text-red-600">
        <span className="text-xs font-medium">⚠️ Error: Index not found</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-3">
      <button
        onClick={() => onViewDetails(originalIndex)}
        className="text-indigo-600 hover:text-indigo-800 transition"
        title="View Details"
      >
        <Eye size={20} />
      </button>
      {features.canEdit && (
        <button
          onClick={() => onEdit(originalIndex)}
          className="text-blue-600 hover:text-blue-800 transition"
          title="Edit Exercise"
        >
          <Edit2 size={20} />
        </button>
      )}
    </div>
  );
};
