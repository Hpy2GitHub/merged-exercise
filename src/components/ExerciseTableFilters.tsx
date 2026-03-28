// src/components/ExerciseTableFilters.tsx
import { Search, X, Filter } from 'lucide-react';
import { getImageUrl } from '../utils/paths';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../hooks/useExerciseFilter';

interface ExerciseTableFiltersProps {
  searchQuery: string;
  primaryMuscle: string;
  selectedMuscles: string[];
  selectedEquipment: string[];
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onTogglePrimaryMuscle: (id: string) => void;
  onToggleMuscle: (id: string) => void;
  onToggleEquipment: (id: string) => void;
  onClearAll: () => void;
}

export const ExerciseTableFilters: React.FC<ExerciseTableFiltersProps> = ({
  searchQuery,
  primaryMuscle,
  selectedMuscles,
  selectedEquipment,
  hasActiveFilters,
  onSearchChange,
  onTogglePrimaryMuscle,
  onToggleMuscle,
  onToggleEquipment,
  onClearAll,
}) => (
  <>
    {/* Search Bar */}
    <div className="mb-8 max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search exercises by name..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>

    {/* Advanced Filters Panel */}
    <div className="mb-12">
      <div className="bg-gray-50 rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Filter size={24} className="text-indigo-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Advanced Filters</h2>
          </div>
          {hasActiveFilters && (
            <button onClick={onClearAll} className="text-red-600 hover:text-red-800 font-medium underline">
              Clear All
            </button>
          )}
        </div>

        {/* Muscle Groups Reference Image */}
        <div className="mb-8 flex justify-center">
          <img
            src={getImageUrl('nav/muscles.png')}
            alt="Muscle groups reference"
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Primary Muscle — radio-style (click again to deselect) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Primary Muscle</h3>
            <div className="flex flex-wrap gap-3">
              {MUSCLE_GROUPS.map(muscle => (
                <label
                  key={muscle.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition ${
                    primaryMuscle === muscle.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="primaryMuscle"
                    value={muscle.id}
                    checked={primaryMuscle === muscle.id}
                    onChange={() => onTogglePrimaryMuscle(muscle.id)}
                    className="sr-only"
                  />
                  {muscle.name}
                </label>
              ))}
            </div>
          </div>

          {/* Secondary Muscles */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Secondary Muscles</h3>
            <div className="flex flex-wrap gap-3">
              {MUSCLE_GROUPS.map(muscle => {
                const checked = selectedMuscles.includes(muscle.id);
                return (
                  <label
                    key={muscle.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition ${
                      checked
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleMuscle(muscle.id)}
                      className="sr-only"
                    />
                    {muscle.name}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Equipment</h3>
            <div className="flex flex-wrap gap-3">
              {EQUIPMENT_TYPES.map(eq => {
                const checked = selectedEquipment.includes(eq.id);
                return (
                  <label
                    key={eq.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition ${
                      checked
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleEquipment(eq.id)}
                      className="sr-only"
                    />
                    {eq.name}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
