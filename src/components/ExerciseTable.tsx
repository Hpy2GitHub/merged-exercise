// src/components/ExerciseTable.tsx
import { Exercise } from '../types';
import { getThumbnailUrl, getImageUrl } from '../utils/paths';
import { useExerciseFilter } from '../hooks/useExerciseFilter';
import { ExerciseTableHeader } from './ExerciseTableHeader';
import { ExerciseTableFilters } from './ExerciseTableFilters';
import { ExerciseRowActions } from './ExerciseRowActions';

interface ExerciseTableProps {
  exercises: Exercise[];
  onEdit: (index: number) => void;
  onViewDetails: (index: number) => void;
  onBack: () => void;
  onAddExercise: () => void;
}

export const ExerciseTable: React.FC<ExerciseTableProps> = ({
  exercises,
  onEdit,
  onViewDetails,
  onBack,
  onAddExercise,
}) => {
  const {
    filterState,
    hasActiveFilters,
    setSearchQuery,
    togglePrimaryMuscle,
    toggleMuscle,
    toggleEquipment,
    clearAllFilters,
    filteredExercises,
  } = useExerciseFilter(exercises);

  const { searchQuery, primaryMuscle, selectedMuscles, selectedEquipment } = filterState;

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <ExerciseTableHeader onAddExercise={onAddExercise} onBack={onBack} />

      <ExerciseTableFilters
        searchQuery={searchQuery}
        primaryMuscle={primaryMuscle}
        selectedMuscles={selectedMuscles}
        selectedEquipment={selectedEquipment}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchQuery}
        onTogglePrimaryMuscle={togglePrimaryMuscle}
        onToggleMuscle={toggleMuscle}
        onToggleEquipment={toggleEquipment}
        onClearAll={clearAllFilters}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Primary Muscle</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Secondary Muscles</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Equipment</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredExercises.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-lg">
                  {hasActiveFilters
                    ? 'No exercises found matching the current filters.'
                    : 'No exercises available yet.'}
                </td>
              </tr>
            ) : (
              filteredExercises.map(exercise => {
                const originalIndex = exercises.findIndex(ex => ex.key === exercise.key);
                const indexNotFound = originalIndex === -1;

                if (indexNotFound) {
                  console.error(`Exercise "${exercise.name}" not found in original array. Key: ${exercise.key}`);
                }

                return (
                  <tr
                    key={exercise.key}
                    className={`transition ${
                      indexNotFound ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            src={getThumbnailUrl(exercise.thumbnailLink || 'placeholder.jpg')}
                            alt={exercise.name}
                            className="h-12 w-12 rounded-lg object-cover"
                            onError={e => {
                              const img = e.target as HTMLImageElement;
                              if (!img.src.includes('placeholder.jpg')) {
                                img.src = getImageUrl('placeholder.jpg');
                              }
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-medium text-gray-900">{exercise.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-bold">
                        {exercise.primaryMuscle || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {exercise.musclesTargeted && exercise.musclesTargeted.length > 0 ? (
                          exercise.musclesTargeted.map(m => (
                            <span key={m} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {exercise.equipment && exercise.equipment.length > 0 ? (
                          exercise.equipment.map(eq => (
                            <span key={eq} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {eq}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">Bodyweight</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        exercise.difficulty === 'Beginner'     ? 'bg-green-100 text-green-800' :
                        exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        exercise.difficulty === 'Advanced'     ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {exercise.difficulty || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ExerciseRowActions
                        originalIndex={originalIndex}
                        indexNotFound={indexNotFound}
                        onViewDetails={onViewDetails}
                        onEdit={onEdit}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-8 text-center text-gray-600">
        Showing <span className="font-bold">{filteredExercises.length}</span> of{' '}
        <span className="font-bold">{exercises.length}</span> exercises
        {hasActiveFilters && <span className="text-indigo-600 ml-2">(filtered)</span>}
      </div>
    </div>
  );
};
