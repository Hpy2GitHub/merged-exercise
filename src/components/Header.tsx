// src/components/Header.tsx
import { ChangeEventHandler, MouseEventHandler } from 'react';
// Assuming 'lucide-react' and your custom components have proper type definitions
import { Table, Upload, Download, List } from 'lucide-react';
import { NewExerciseButton } from './NewExerciseButton';
import { Anchor } from './Anchor'; 
import { features } from "../config/features";

/**
 * Define the props for the Header component.
 */
export interface HeaderProps {
  /** The total number of exercises to display. Defaults to 0. */
  exerciseCount?: number; 
  
  /** The timestamp (string or number) of the last update or launch time. */
  launchTime?: string | number; 

  /** Callback function when the 'Table View' button is clicked. */
  onTableView: MouseEventHandler<HTMLButtonElement>;

  /** Callback function when the 'My Lists' button is clicked. */
  onListsView: MouseEventHandler<HTMLButtonElement>;

  /** Callback function when a file is selected for 'Import'. */
  onImport: ChangeEventHandler<HTMLInputElement>;

  /** Callback function when the 'Export' button is clicked. */
  onExport: MouseEventHandler<HTMLButtonElement>;

  /** Callback function when the 'New Exercise' button is clicked. */
  onAddNew: MouseEventHandler<HTMLButtonElement>;
}

/**
 * The main header component for the Exercise Database application.
 * It displays status, navigation links, and action buttons.
 * * @param {HeaderProps} props - The component properties.
 */
export const Header = ({
  exerciseCount = 0,
  launchTime,
  onTableView,
  onListsView,
  onImport,
  onExport,
  onAddNew,
}: HeaderProps) => {
  // TypeScript correctly infers 'launchTime' as string | number | undefined
  const currentTime = launchTime
    ? new Date(launchTime).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800">
            Exercise Database
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {currentTime}
          </p>
          
          {features.canEdit && (
          <div className="flex flex-row gap-4 mt-2 text-sm">
            <Anchor
              href={`${import.meta.env.BASE_URL}tracer.html`}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition"
            >
              Select Regions
            </Anchor>
            <Anchor
              href={`${import.meta.env.BASE_URL}trace-check.html`}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition"
            >
              Verify
            </Anchor>
          </div>
          )}
          </div>
          
        <div className="flex flex-wrap gap-3">
        {features.showListsView && (
          <button
            onClick={onListsView}
            className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium"
          >
            <List size={20} />
            My Lists
          </button>
          )}

          {features.showTableView && (
          <button
            onClick={onTableView}
            className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium"
          >
            <Table size={20} />
            Table View
          </button>
          )}

          {/* Import Button with File Input */}
          {features.canImport && (
          <label className="cursor-pointer" title="Import data from backup file">
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              className="hidden"
            />

            <div className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">
              <Upload size={20} />
              Import
            </div>
          </label>
          )}
          
          {features.canExport && (
          <button
            onClick={onExport}
            title="Export data to backup file"
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
          >
            <Download size={20} />
            Export
          </button>
          )}

          {features.canEdit && 
          <NewExerciseButton onClick={onAddNew} />}
        </div>
      </div>

      <div className="text-lg text-gray-700">
        Total Exercises:{' '}
        <span className="font-bold text-indigo-600 text-2xl">{exerciseCount}</span>
      </div>
    </div>
  );
};
